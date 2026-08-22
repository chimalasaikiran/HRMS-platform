const mongoose = require('mongoose');
const TimeOffRequest = require('../models/TimeOffRequest');
const AttendanceRecord = require('../models/AttendanceRecord');
const Employee = require('../models/Employee');
const { AppError } = require('../middleware/errorHandler');
const { eachDateInclusive } = require('../utils/dates');

const DEFAULT_ALLOCATIONS = {
  PAID: { available: 24 },
  SICK: { available: 7 },
  UNPAID: { available: null },
};

function requireEmployeeId(userCtx) {
  if (!userCtx.employeeId) {
    throw new AppError('FORBIDDEN', 'No employee profile linked to this user', 403);
  }
  return userCtx.employeeId;
}

function shapeRequest(req, employeeName = '') {
  return {
    id: req._id.toString(),
    employeeId: req.employeeId.toString(),
    employeeName,
    type: req.type,
    startDate: req.startDate,
    endDate: req.endDate,
    days: req.days,
    reason: req.reason,
    attachmentUrl: req.attachmentUrl || '',
    status: req.status,
    reviewerId: req.reviewerId ? req.reviewerId.toString() : null,
    reviewComment: req.reviewComment || '',
    createdAt: req.createdAt,
  };
}

/** DB aggregation — no fetch-all-then-sum */
async function getAllocations(userCtx) {
  const employeeId = new mongoose.Types.ObjectId(requireEmployeeId(userCtx));

  const used = await TimeOffRequest.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(userCtx.companyId),
        employeeId,
        status: 'APPROVED',
        type: { $in: ['PAID', 'SICK'] },
      },
    },
    {
      $group: {
        _id: '$type',
        days: { $sum: '$days' },
      },
    },
  ]);

  const usedMap = Object.fromEntries(used.map((u) => [u._id, u.days]));

  return {
    PAID: {
      available: Math.max(0, DEFAULT_ALLOCATIONS.PAID.available - (usedMap.PAID || 0)),
    },
    SICK: {
      available: Math.max(0, DEFAULT_ALLOCATIONS.SICK.available - (usedMap.SICK || 0)),
    },
    UNPAID: { available: null },
  };
}

async function listMine(userCtx) {
  const employeeId = requireEmployeeId(userCtx);
  const [rows, emp] = await Promise.all([
    TimeOffRequest.find({
      companyId: userCtx.companyId,
      employeeId,
    })
      .sort({ createdAt: -1 })
      .lean(),
    Employee.findOne({ _id: employeeId, companyId: userCtx.companyId })
      .select('firstName lastName')
      .lean(),
  ]);
  const name = emp ? `${emp.firstName} ${emp.lastName}`.trim() : '';
  return rows.map((r) => shapeRequest(r, name));
}

async function listAll(userCtx, { status } = {}) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Admin access required', 403);
  }

  const filter = { companyId: new mongoose.Types.ObjectId(userCtx.companyId) };
  if (status) filter.status = status;

  const rows = await TimeOffRequest.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
        pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
      },
    },
    { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
  ]);

  return rows.map((r) =>
    shapeRequest(
      r,
      r.employee ? `${r.employee.firstName} ${r.employee.lastName}`.trim() : ''
    )
  );
}

async function createRequest(userCtx, body) {
  const employeeId = requireEmployeeId(userCtx);
  const { type, startDate, endDate, days, reason, attachmentUrl } = body;

  if (!type || !startDate || !endDate || days === undefined) {
    throw new AppError('VALIDATION_ERROR', 'type, startDate, endDate, days are required', 400);
  }
  if (!['PAID', 'SICK', 'UNPAID'].includes(type)) {
    throw new AppError('VALIDATION_ERROR', 'Invalid leave type', 400);
  }

  if (type === 'PAID' || type === 'SICK') {
    const alloc = await getAllocations(userCtx);
    if (alloc[type].available !== null && days > alloc[type].available) {
      throw new AppError('VALIDATION_ERROR', `Insufficient ${type} leave balance`, 400);
    }
  }

  if (startDate > endDate) {
    throw new AppError('VALIDATION_ERROR', 'startDate must be on or before endDate', 400);
  }

  const [row, emp] = await Promise.all([
    TimeOffRequest.create({
      companyId: userCtx.companyId,
      employeeId,
      type,
      startDate,
      endDate,
      days: Number(days),
      reason: reason || '',
      attachmentUrl: attachmentUrl || '',
      status: 'PENDING',
    }),
    Employee.findOne({ _id: employeeId, companyId: userCtx.companyId })
      .select('firstName lastName')
      .lean(),
  ]);

  return shapeRequest(row, emp ? `${emp.firstName} ${emp.lastName}`.trim() : '');
}

async function writeLeaveAttendance(companyId, employeeId, startDate, endDate, session = null) {
  const dates = eachDateInclusive(startDate, endDate).filter((date) => {
    const wd = new Date(date + 'T00:00:00').getDay();
    return wd !== 0 && wd !== 6;
  });

  if (!dates.length) return;

  const ops = dates.map((date) => ({
    updateOne: {
      filter: { employeeId, date },
      update: {
        $set: {
          companyId,
          employeeId,
          date,
          status: 'LEAVE',
          checkIn: null,
          checkOut: null,
          workMinutes: 0,
          extraMinutes: 0,
        },
      },
      upsert: true,
    },
  }));

  const opts = session ? { session, ordered: false } : { ordered: false };
  await AttendanceRecord.bulkWrite(ops, opts);
}

async function approve(userCtx, id, { comment } = {}) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Admin access required', 403);
  }

  const req = await TimeOffRequest.findOneAndUpdate(
    { _id: id, companyId: userCtx.companyId, status: 'PENDING' },
    {
      $set: {
        status: 'APPROVED',
        reviewerId: userCtx.id,
        reviewComment: comment || '',
      },
    },
    { new: true }
  );

  if (!req) {
    const exists = await TimeOffRequest.findOne({ _id: id, companyId: userCtx.companyId })
      .select('status')
      .lean();
    if (!exists) throw new AppError('NOT_FOUND', 'Time off request not found', 404);
    throw new AppError('CONFLICT', 'Request already reviewed', 409);
  }

  const applyAttendance = async (session) => {
    await writeLeaveAttendance(req.companyId, req.employeeId, req.startDate, req.endDate, session);
  };

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await applyAttendance(session);
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    if (err.message && /transaction|replica set/i.test(err.message)) {
      await applyAttendance(null);
    } else {
      throw err;
    }
  }

  const emp = await Employee.findById(req.employeeId).select('firstName lastName').lean();
  return shapeRequest(req, emp ? `${emp.firstName} ${emp.lastName}`.trim() : '');
}

async function reject(userCtx, id, { comment } = {}) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Admin access required', 403);
  }

  const req = await TimeOffRequest.findOneAndUpdate(
    { _id: id, companyId: userCtx.companyId, status: 'PENDING' },
    {
      $set: {
        status: 'REJECTED',
        reviewerId: userCtx.id,
        reviewComment: comment || '',
      },
    },
    { new: true }
  ).lean();

  if (!req) {
    const exists = await TimeOffRequest.findOne({ _id: id, companyId: userCtx.companyId })
      .select('status')
      .lean();
    if (!exists) throw new AppError('NOT_FOUND', 'Time off request not found', 404);
    throw new AppError('CONFLICT', 'Request already reviewed', 409);
  }

  const emp = await Employee.findById(req.employeeId).select('firstName lastName').lean();
  return shapeRequest(req, emp ? `${emp.firstName} ${emp.lastName}`.trim() : '');
}

async function getLeaveBalance(userCtx) {
  return getAllocations(userCtx);
}

module.exports = {
  getAllocations,
  listMine,
  listAll,
  createRequest,
  approve,
  reject,
  getLeaveBalance,
};
