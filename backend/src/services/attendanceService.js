const mongoose = require('mongoose');
const AttendanceRecord = require('../models/AttendanceRecord');
const Employee = require('../models/Employee');
const TimeOffRequest = require('../models/TimeOffRequest');
const { AppError } = require('../middleware/errorHandler');
const {
  todayISO,
  formatHHMM,
  parseHHMM,
  minutesToHHMM,
  monthRange,
  currentMonth,
} = require('../utils/dates');

function requireEmployeeId(userCtx) {
  if (!userCtx.employeeId) {
    throw new AppError('FORBIDDEN', 'No employee profile linked to this user', 403);
  }
  return userCtx.employeeId;
}

function shapeRecord(rec, employeeName = '') {
  return {
    date: rec.date,
    employeeId: rec.employeeId.toString(),
    employeeName,
    checkIn: rec.checkIn,
    checkOut: rec.checkOut,
    workHours: minutesToHHMM(rec.workMinutes || 0),
    extraHours: minutesToHHMM(rec.extraMinutes || 0),
    status: rec.status,
  };
}

async function checkIn(userCtx) {
  const employeeId = requireEmployeeId(userCtx);
  const date = todayISO();
  const filter = {
    companyId: userCtx.companyId,
    employeeId,
    date,
  };

  const existing = await AttendanceRecord.findOne(filter).select('checkIn status').lean();
  if (existing?.checkIn) {
    return { checkIn: existing.checkIn, status: existing.status };
  }

  const now = formatHHMM();
  const rec = await AttendanceRecord.findOneAndUpdate(
    filter,
    {
      $set: {
        companyId: userCtx.companyId,
        employeeId,
        date,
        checkIn: now,
        status: 'PRESENT',
      },
      $setOnInsert: {
        checkOut: null,
        workMinutes: 0,
        extraMinutes: 0,
      },
    },
    { upsert: true, new: true }
  ).lean();

  return { checkIn: rec.checkIn, status: rec.status };
}

async function checkOut(userCtx) {
  const employeeId = requireEmployeeId(userCtx);
  const date = todayISO();
  const rec = await AttendanceRecord.findOne({
    companyId: userCtx.companyId,
    employeeId,
    date,
  });
  if (!rec || !rec.checkIn) {
    throw new AppError('VALIDATION_ERROR', 'Check in first before checking out', 400);
  }

  const now = formatHHMM();
  rec.checkOut = now;
  const worked = Math.max(0, parseHHMM(now) - parseHHMM(rec.checkIn));
  rec.workMinutes = worked;
  const standard = 8 * 60;
  rec.extraMinutes = Math.max(0, worked - standard);
  rec.status = worked < 4 * 60 ? 'HALF_DAY' : 'PRESENT';
  await rec.save();

  return {
    checkOut: rec.checkOut,
    workHours: minutesToHHMM(rec.workMinutes),
    extraHours: minutesToHHMM(rec.extraMinutes),
  };
}

async function myAttendance(userCtx, month = currentMonth()) {
  const employeeId = requireEmployeeId(userCtx);
  const { start, end } = monthRange(month);
  const eid = new mongoose.Types.ObjectId(employeeId);

  const [records, emp] = await Promise.all([
    AttendanceRecord.find({
      companyId: userCtx.companyId,
      employeeId: eid,
      date: { $gte: start, $lte: end },
    })
      .select('date employeeId checkIn checkOut workMinutes extraMinutes status')
      .sort({ date: 1 })
      .lean(),
    Employee.findOne({ _id: eid, companyId: userCtx.companyId })
      .select('firstName lastName')
      .lean(),
  ]);

  const name = emp ? `${emp.firstName} ${emp.lastName}`.trim() : '';
  return records.map((r) => shapeRecord(r, name));
}

async function mySummary(userCtx, month = currentMonth()) {
  const employeeId = requireEmployeeId(userCtx);
  const { start, end, daysInMonth } = monthRange(month);
  const eid = new mongoose.Types.ObjectId(employeeId);
  const [y, m] = month.split('-').map(Number);

  let totalWorkingDays = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const wd = new Date(y, m - 1, d).getDay();
    if (wd !== 0 && wd !== 6) totalWorkingDays += 1;
  }

  const [agg, unpaidLeaves] = await Promise.all([
    AttendanceRecord.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(userCtx.companyId),
          employeeId: eid,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          daysPresent: {
            $sum: {
              $cond: [{ $in: ['$status', ['PRESENT', 'HALF_DAY']] }, 1, 0],
            },
          },
          leavesCount: {
            $sum: { $cond: [{ $eq: ['$status', 'LEAVE'] }, 1, 0] },
          },
          dates: { $addToSet: '$date' },
        },
      },
    ]),
    TimeOffRequest.find({
      companyId: userCtx.companyId,
      employeeId: eid,
      status: 'APPROVED',
      type: 'UNPAID',
      startDate: { $lte: end },
      endDate: { $gte: start },
    })
      .select('startDate endDate')
      .lean(),
  ]);

  const daysPresent = agg[0]?.daysPresent || 0;
  const leavesCount = agg[0]?.leavesCount || 0;
  const recordedDates = new Set(agg[0]?.dates || []);

  let unpaidDays = 0;
  for (const leave of unpaidLeaves) {
    const s = leave.startDate < start ? start : leave.startDate;
    const e = leave.endDate > end ? end : leave.endDate;
    const cur = new Date(s + 'T00:00:00');
    const last = new Date(e + 'T00:00:00');
    while (cur <= last) {
      const wd = cur.getDay();
      if (wd !== 0 && wd !== 6) unpaidDays += 1;
      cur.setDate(cur.getDate() + 1);
    }
  }

  const today = todayISO();
  let missing = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const wd = new Date(y, m - 1, d).getDay();
    if (wd === 0 || wd === 6) continue;
    if (date > today) continue;
    if (!recordedDates.has(date)) missing += 1;
  }

  return {
    daysPresent,
    leavesCount,
    totalWorkingDays,
    payableDays: Math.max(0, totalWorkingDays - unpaidDays - missing),
  };
}

async function adminDayView(userCtx, date = todayISO()) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Admin access required', 403);
  }

  const companyId = userCtx.companyId;
  const [employees, records] = await Promise.all([
    Employee.find({ companyId })
      .select('firstName lastName')
      .sort({ firstName: 1, lastName: 1 })
      .lean(),
    AttendanceRecord.find({ companyId, date })
      .select('employeeId checkIn checkOut workMinutes extraMinutes status date')
      .lean(),
  ]);

  const byEmp = new Map(records.map((r) => [r.employeeId.toString(), r]));

  return employees.map((emp) => {
    const rec = byEmp.get(emp._id.toString());
    const name = `${emp.firstName} ${emp.lastName}`.trim();
    if (rec) return shapeRecord(rec, name);
    return {
      date,
      employeeId: emp._id.toString(),
      employeeName: name,
      checkIn: null,
      checkOut: null,
      workHours: '00:00',
      extraHours: '00:00',
      status: 'ABSENT',
    };
  });
}

module.exports = {
  checkIn,
  checkOut,
  myAttendance,
  mySummary,
  adminDayView,
  shapeRecord,
};
