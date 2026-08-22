const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AttendanceRecord = require('../models/AttendanceRecord');
const TimeOffRequest = require('../models/TimeOffRequest');
const { AppError } = require('../middleware/errorHandler');
const { allocateLoginId, generateTempPassword } = require('./loginIdService');
const { toSalaryResponse } = require('./salaryService');
const { todayISO } = require('../utils/dates');

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Bottleneck fix: was N+1 (2 queries per employee).
 * Now: 1 employees query + 1 attendance batch + 1 leave batch (all DB-filtered).
 */
async function listEmployees(userCtx, { search } = {}) {
  const companyId = new mongoose.Types.ObjectId(userCtx.companyId);
  const filter = { companyId };

  if (search && String(search).trim()) {
    const q = escapeRegex(String(search).trim());
    const rx = new RegExp(q, 'i');
    filter.$or = [
      { firstName: rx },
      { lastName: rx },
      { jobPosition: rx },
      { department: rx },
      { email: rx },
    ];
  }

  const employees = await Employee.find(filter)
    .select('firstName lastName jobPosition avatarUrl')
    .sort({ firstName: 1, lastName: 1 })
    .lean();

  if (!employees.length) return [];

  const ids = employees.map((e) => e._id);
  const today = todayISO();

  const [attendanceRows, leaveRows] = await Promise.all([
    AttendanceRecord.find({
      companyId,
      date: today,
      employeeId: { $in: ids },
      status: { $in: ['PRESENT', 'HALF_DAY', 'LEAVE'] },
    })
      .select('employeeId status')
      .lean(),
    TimeOffRequest.find({
      companyId,
      status: 'APPROVED',
      employeeId: { $in: ids },
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .select('employeeId')
      .lean(),
  ]);

  const attendanceByEmp = new Map(
    attendanceRows.map((r) => [r.employeeId.toString(), r.status])
  );
  const onLeaveSet = new Set(leaveRows.map((r) => r.employeeId.toString()));

  return employees.map((emp) => {
    const id = emp._id.toString();
    const att = attendanceByEmp.get(id);
    let status = 'ABSENT';
    if (att === 'PRESENT' || att === 'HALF_DAY') status = 'PRESENT';
    else if (att === 'LEAVE' || onLeaveSet.has(id)) status = 'ON_LEAVE';

    return {
      id,
      name: `${emp.firstName} ${emp.lastName}`.trim(),
      jobPosition: emp.jobPosition,
      avatarUrl: emp.avatarUrl || '',
      status,
    };
  });
}

async function resolveCardStatus(employeeId, companyId, today = todayISO()) {
  const cid = new mongoose.Types.ObjectId(companyId);
  const eid = new mongoose.Types.ObjectId(employeeId);

  const [attendance, onLeave] = await Promise.all([
    AttendanceRecord.findOne({ companyId: cid, employeeId: eid, date: today })
      .select('status')
      .lean(),
    TimeOffRequest.findOne({
      companyId: cid,
      employeeId: eid,
      status: 'APPROVED',
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .select('_id')
      .lean(),
  ]);

  if (attendance && (attendance.status === 'PRESENT' || attendance.status === 'HALF_DAY')) {
    return 'PRESENT';
  }
  if ((attendance && attendance.status === 'LEAVE') || onLeave) return 'ON_LEAVE';
  return 'ABSENT';
}

async function createEmployee(userCtx, body) {
  const {
    firstName,
    lastName,
    email,
    mobile,
    jobPosition,
    department,
    manager,
    location,
    dateOfJoining,
  } = body;

  if (!firstName || !lastName || !email || !dateOfJoining) {
    throw new AppError('VALIDATION_ERROR', 'firstName, lastName, email, dateOfJoining are required', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('CONFLICT', 'Email already registered', 409);
  }

  let managerId = null;
  if (manager) {
    const mgr = await Employee.findOne({ _id: manager, companyId: userCtx.companyId });
    if (!mgr) throw new AppError('NOT_FOUND', 'Manager not found', 404);
    managerId = mgr._id;
  }

  const loginId = await allocateLoginId(userCtx.companyId, firstName, lastName, dateOfJoining);
  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await User.create({
    companyId: userCtx.companyId,
    loginId,
    email: email.toLowerCase(),
    passwordHash,
    role: 'EMPLOYEE',
    mustChangePassword: true,
    employeeId: null,
  });

  const employee = await Employee.create({
    companyId: userCtx.companyId,
    userId: user._id,
    firstName,
    lastName,
    email: email.toLowerCase(),
    mobile: mobile || '',
    jobPosition: jobPosition || '',
    department: department || '',
    managerId,
    location: location || '',
    dateOfJoining,
    salary: { wage: 0, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
  });

  user.employeeId = employee._id;
  await user.save();

  const shaped = await getEmployeeById(userCtx, employee._id.toString());
  return { ...shaped, loginId, tempPassword };
}

async function getEmployeeById(userCtx, employeeId) {
  const [employee, company] = await Promise.all([
    Employee.findOne({ _id: employeeId, companyId: userCtx.companyId })
      .populate('managerId', 'firstName lastName')
      .populate('userId', 'loginId')
      .lean({ virtuals: true }),
    Company.findById(userCtx.companyId).select('name').lean(),
  ]);

  if (!employee) {
    throw new AppError('NOT_FOUND', 'Employee not found', 404);
  }

  const isAdmin = userCtx.role === 'ADMIN';
  const isSelf = userCtx.employeeId === employee._id.toString();

  const base = {
    id: employee._id.toString(),
    loginId: employee.userId?.loginId || '',
    name: `${employee.firstName} ${employee.lastName}`.trim(),
    firstName: employee.firstName,
    lastName: employee.lastName,
    jobPosition: employee.jobPosition,
    email: employee.email,
    mobile: employee.mobile,
    company: company?.name || '',
    department: employee.department,
    manager: employee.managerId
      ? {
          id: employee.managerId._id.toString(),
          name: `${employee.managerId.firstName} ${employee.managerId.lastName}`.trim(),
        }
      : null,
    location: employee.location,
    avatarUrl: employee.avatarUrl || '',
    resume: employee.resume || {},
  };

  if (isAdmin || isSelf) {
    base.privateInfo = {
      ...(employee.privateInfo || {}),
      dateOfJoining: employee.dateOfJoining || '',
    };
  }

  if (isAdmin) {
    base.salary = toSalaryResponse(employee);
  }

  return base;
}

async function patchEmployee(userCtx, employeeId, body) {
  const employee = await Employee.findOne({ _id: employeeId, companyId: userCtx.companyId });
  if (!employee) throw new AppError('NOT_FOUND', 'Employee not found', 404);

  const isAdmin = userCtx.role === 'ADMIN';
  const isSelf = userCtx.employeeId === employee._id.toString();
  if (!isAdmin && !isSelf) {
    throw new AppError('FORBIDDEN', 'You can only edit your own profile', 403);
  }

  if (isAdmin) {
    const adminFields = [
      'firstName',
      'lastName',
      'email',
      'mobile',
      'jobPosition',
      'department',
      'location',
      'dateOfJoining',
      'avatarUrl',
    ];
    for (const key of adminFields) {
      if (body[key] !== undefined) employee[key] = body[key];
    }
    if (body.manager !== undefined) {
      employee.managerId = body.manager || null;
    }
    if (body.resume) {
      employee.resume = { ...employee.resume.toObject?.() || employee.resume, ...body.resume };
    }
    if (body.privateInfo) {
      employee.privateInfo = {
        ...(employee.privateInfo.toObject?.() || employee.privateInfo),
        ...body.privateInfo,
        bank: {
          ...(employee.privateInfo?.bank?.toObject?.() || employee.privateInfo?.bank || {}),
          ...(body.privateInfo.bank || {}),
        },
      };
    }
  } else {
    const forbidden = Object.keys(body).filter(
      (k) => !['mobile', 'avatarUrl', 'residingAddress', 'resume'].includes(k)
    );
    if (forbidden.length) {
      throw new AppError('FORBIDDEN', `Employees cannot update: ${forbidden.join(', ')}`, 403);
    }
    if (body.mobile !== undefined) employee.mobile = body.mobile;
    if (body.avatarUrl !== undefined) employee.avatarUrl = body.avatarUrl;
    if (body.residingAddress !== undefined) {
      employee.privateInfo.residingAddress = body.residingAddress;
    }
    if (body.resume) {
      employee.resume = { ...employee.resume.toObject?.() || employee.resume, ...body.resume };
    }
  }

  await employee.save();
  return getEmployeeById(userCtx, employeeId);
}

async function getSalary(userCtx, employeeId) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Salary details are visible only to HR officers.', 403);
  }
  const employee = await Employee.findOne({ _id: employeeId, companyId: userCtx.companyId })
    .select('salary')
    .lean();
  if (!employee) throw new AppError('NOT_FOUND', 'Employee not found', 404);
  return toSalaryResponse(employee);
}

async function putSalary(userCtx, employeeId, body) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Salary details are visible only to HR officers.', 403);
  }
  const employee = await Employee.findOne({ _id: employeeId, companyId: userCtx.companyId });
  if (!employee) throw new AppError('NOT_FOUND', 'Employee not found', 404);

  if (body.wage === undefined || Number(body.wage) < 0) {
    throw new AppError('VALIDATION_ERROR', 'wage is required and must be >= 0', 400);
  }

  employee.salary = {
    wage: Number(body.wage),
    workingDaysPerWeek: body.workingDaysPerWeek ?? employee.salary.workingDaysPerWeek ?? 5,
    breakMinutes: body.breakMinutes ?? employee.salary.breakMinutes ?? 60,
    hoursPerDay: body.hoursPerDay ?? employee.salary.hoursPerDay ?? 8,
  };
  await employee.save();
  return toSalaryResponse(employee);
}

module.exports = {
  listEmployees,
  createEmployee,
  getEmployeeById,
  patchEmployee,
  getSalary,
  putSalary,
  resolveCardStatus,
};
