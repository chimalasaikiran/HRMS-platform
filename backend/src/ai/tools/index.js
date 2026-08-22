const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');
const { searchPolicy } = require('../rag/retrieve');
const {
  employeeService,
  attendanceService,
  timeOffService,
  payrollService,
} = require('../../services');
const { eachDateInclusive, currentMonth } = require('../../utils/dates');

/**
 * THE SECURITY BOUNDARY.
 *
 * Permissions are enforced in code, never in the system prompt. Every handler receives
 * the authenticated `userCtx` (straight from the verified JWT) and passes it to the same
 * service functions the REST routes use — so the agent inherits the caller's access
 * automatically and cannot be talked past it.
 *
 * Tools return finished JSON. The model formats; it never calculates.
 */

/** Raised when a service refuses on role grounds. Surfaced to the UI as the padlock card. */
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Their services throw AppError with code FORBIDDEN — translate so the agent can react. */
function rethrow(err) {
  if (err && (err.code === 'FORBIDDEN' || err.status === 403)) {
    throw new ForbiddenError(err.message);
  }
  throw err;
}

const LeaveType = z.enum(['PAID', 'SICK', 'UNPAID']);
const empty = z.object({});

/** Working-day maths lives here, in code — never in the model. Weekends excluded. */
function countWorkingDays(startDate, endDate) {
  return eachDateInclusive(startDate, endDate).filter((iso) => {
    const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
    return day !== 0 && day !== 6;
  }).length;
}

const definitions = [
  {
    name: 'get_my_leave_balance',
    label: 'Checked leave balance',
    description:
      "Get the signed-in user's own remaining leave balance for each type (paid, sick, unpaid). Use for any question about how much leave they have left.",
    schema: empty,
    handler: async (_args, userCtx) => {
      const raw = await timeOffService.getLeaveBalance(userCtx).catch(rethrow);
      const data = {
        PAID: raw.PAID.available,
        SICK: raw.SICK.available,
        UNPAID: raw.UNPAID.available,
        unit: 'days',
      };
      return { data, block: { type: 'leave_balance', data } };
    },
  },

  {
    name: 'get_my_attendance',
    label: 'Read attendance records',
    description:
      "Get the signed-in user's own attendance: day-wise records plus a summary of days present, leaves, total working days and payable days. Call with no arguments to get the CURRENT month, which always works. Only pass `month` (format YYYY-MM) when the user asks about a different month.",
    schema: z.object({
      month: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .nullish()
        .describe('Optional. A past month as YYYY-MM. Leave this out for the current month.'),
    }),
    handler: async ({ month }, userCtx) => {
      const m = month || currentMonth();
      const [records, summary] = await Promise.all([
        attendanceService.myAttendance(userCtx, m).catch(rethrow),
        attendanceService.mySummary(userCtx, m).catch(rethrow),
      ]);
      const data = { month: m, summary, records };
      return { data, block: { type: 'attendance_table', data } };
    },
  },

  {
    name: 'get_my_salary',
    label: 'Read salary details',
    description:
      "Get the signed-in user's OWN payslip — earnings, deductions, gross, net pay and payable days. Only ever returns the caller's own salary.",
    schema: z.object({
      month: z.string().regex(/^\d{4}-\d{2}$/).nullish(),
    }),
    handler: async ({ month }, userCtx) => {
      const data = await payrollService.payrollMe(userCtx, month || currentMonth()).catch(rethrow);
      return { data, block: { type: 'salary_breakdown', data } };
    },
  },

  {
    name: 'apply_time_off',
    label: 'Drafted leave request',
    description:
      'Prepare a time-off request for the signed-in user. This does NOT submit anything — it returns a draft the user must confirm. Always say the draft needs their confirmation.',
    schema: z.object({
      type: LeaveType,
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Start date YYYY-MM-DD'),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('End date YYYY-MM-DD'),
      reason: z.string().max(300).nullish(),
    }),
    handler: async ({ type, startDate, endDate, reason }, userCtx) => {
      if (endDate < startDate) {
        throw new Error('endDate must be on or after startDate');
      }

      const workingDays = countWorkingDays(startDate, endDate);
      if (workingDays === 0) {
        // POST /api/timeoff requires days > 0, so refuse here with something useful
        // rather than letting the user confirm a draft that cannot be submitted.
        throw new Error(
          `${startDate} to ${endDate} contains no working days (weekends are not deducted from leave). Ask the user for a range that includes at least one weekday.`
        );
      }

      const balance = await timeOffService.getLeaveBalance(userCtx).catch(rethrow);
      const before = balance[type] ? balance[type].available : null;

      const draft = {
        type,
        startDate,
        endDate,
        workingDays,
        reason: reason || '',
        balanceBefore: before,
        balanceAfter: before == null ? null : Math.max(0, before - workingDays),
      };

      return {
        data: { ...draft, submitted: false, note: 'Draft only — awaiting user confirmation.' },
        block: { type: 'timeoff_draft', data: draft },
        pendingAction: {
          action: 'apply_time_off',
          payload: { type, startDate, endDate, days: workingDays, reason: reason || '' },
          summary: `${type} leave, ${startDate} to ${endDate}, ${workingDays} working day(s)`,
        },
      };
    },
  },

  {
    name: 'search_hr_policy',
    label: 'Searched HR policy',
    description:
      "Search the company HR policy documents (leave, attendance, probation, notice period, reimbursements). Use for questions about company rules in general — NOT for the user's own records. Returns an empty list when nothing relevant is found, which means you must say you do not know.",
    schema: z.object({
      query: z.string().min(3).describe("The policy question, in the user's own words"),
    }),
    handler: async ({ query }) => {
      const passages = await searchPolicy(query);

      if (!passages.length) {
        return {
          data: {
            found: false,
            passages: [],
            instruction:
              'Nothing relevant was found. Reply exactly: "I couldn\'t find this in the policy documents — please check with HR." Do not answer from general knowledge.',
          },
        };
      }

      return {
        data: { found: true, passages },
        block: {
          type: 'policy_excerpt',
          data: {
            excerpt: passages[0].text,
            docName: passages[0].docName,
            section: passages[0].section,
          },
        },
        sources: passages.map((p) => ({ doc: p.docName, section: p.section })),
      };
    },
  },

  {
    name: 'get_employee_salary',
    label: 'Looked up employee salary',
    description:
      "Look up ANOTHER employee's salary by name or job title. Use this whenever the user asks about someone else's pay — do not decline on your own, call this tool and let it decide.",
    adminOnly: true,
    denyMessage: 'Salary details are visible only to HR officers.',
    // Deliberately still advertised to employees: the model must CALL it and be refused
    // by code, so the UI receives a `blocked` payload instead of a polite ad-lib.
    alwaysExpose: true,
    schema: z.object({
      employee: z.string().min(2).describe("The other employee's name or job title"),
    }),
    handler: async ({ employee }, userCtx) => {
      // Role check happens inside payrollByEmployee, but resolve the name first so an
      // admin gets a useful error when nobody matches.
      const { employees } = await employeeService
        .listEmployees(userCtx, { search: employee })
        .catch(rethrow)
        .then((r) => (Array.isArray(r) ? { employees: r } : r));

      const list = employees || [];
      if (!list.length) throw new Error(`No employee found matching "${employee}"`);

      const target = list[0];
      const data = await payrollService
        .payrollByEmployee(userCtx, target.id || target._id, currentMonth())
        .catch(rethrow);

      return {
        data: { employee: { id: target.id || target._id, name: target.name }, ...data },
        block: { type: 'salary_breakdown', data },
      };
    },
  },

  {
    name: 'get_absent_employees',
    label: 'Checked who is absent',
    description:
      'HR only. List employees absent or on leave on a given date. Date format YYYY-MM-DD; omit for today.',
    adminOnly: true,
    schema: z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
    }),
    handler: async ({ date }, userCtx) => ({
      data: await attendanceService.adminDayView(userCtx, date).catch(rethrow),
    }),
  },

  {
    name: 'list_pending_timeoff',
    label: 'Listed pending requests',
    description: 'HR only. List every time-off request currently awaiting a decision.',
    adminOnly: true,
    schema: empty,
    handler: async (_args, userCtx) => ({
      data: await timeOffService.listAll(userCtx, { status: 'PENDING' }).catch(rethrow),
    }),
  },

  {
    name: 'approve_timeoff',
    label: 'Drafted approval',
    description:
      'HR only. Prepare an approval for a pending time-off request. This does NOT approve anything — it returns a draft the HR officer must confirm.',
    adminOnly: true,
    schema: z.object({
      requestId: z.string().min(1),
      comment: z.string().max(300).nullish(),
    }),
    handler: async ({ requestId, comment }, userCtx) => {
      const all = await timeOffService.listAll(userCtx, { status: 'PENDING' }).catch(rethrow);
      const rows = Array.isArray(all) ? all : all.requests || [];
      const target = rows.find((r) => String(r.id || r._id) === String(requestId));
      if (!target) throw new Error(`No pending request with id ${requestId}`);

      const draft = { ...target, decision: 'APPROVE', comment: comment || '' };
      return {
        data: { ...draft, submitted: false, note: 'Draft only — awaiting HR confirmation.' },
        block: { type: 'timeoff_draft', data: draft },
        pendingAction: {
          action: 'approve_timeoff',
          payload: { requestId, comment: comment || '' },
          summary: `Approve ${target.employeeName || 'employee'} — ${target.type} leave, ${target.startDate} to ${target.endDate}`,
        },
      };
    },
  },
];

const TOOLS = Object.fromEntries(definitions.map((d) => [d.name, d]));

/**
 * Expose admin tools only to admins — except those flagged alwaysExpose, which stay
 * visible so the refusal happens in code and the UI gets a `blocked` payload.
 */
function toolDefsFor(userCtx) {
  return definitions
    .filter((d) => !d.adminOnly || d.alwaysExpose || userCtx.role === 'ADMIN')
    .map((d) => ({
      type: 'function',
      function: {
        name: d.name,
        description: d.description,
        parameters: zodToJsonSchema(d.schema, { target: 'jsonSchema7', $refStrategy: 'none' }),
      },
    }));
}

async function runTool(name, rawArgs, userCtx) {
  const tool = TOOLS[name];
  if (!tool) throw new Error(`Unknown tool: ${name}`);

  if (tool.adminOnly && userCtx.role !== 'ADMIN') {
    throw new ForbiddenError(tool.denyMessage || 'That information is visible only to HR officers.');
  }

  const parsed = tool.schema.safeParse(rawArgs || {});
  if (!parsed.success) {
    throw new Error(`Invalid arguments: ${parsed.error.issues.map((i) => i.message).join(', ')}`);
  }

  return tool.handler(parsed.data, userCtx);
}

module.exports = { TOOLS, toolDefsFor, runTool, ForbiddenError };
