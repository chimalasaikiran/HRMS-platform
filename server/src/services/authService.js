const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { AppError } = require('../middleware/errorHandler');
const { allocateLoginId } = require('./loginIdService');

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role, // ADMIN | EMPLOYEE — source of truth for authorization
      companyId: user.companyId.toString(),
      employeeId: user.employeeId ? user.employeeId.toString() : null,
      loginId: user.loginId,
      email: user.email,
      mustChangePassword: Boolean(user.mustChangePassword),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function registerCompany({ companyName, adminName, email, phone, password, logoUrl }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('CONFLICT', 'Email already registered', 409);
  }

  const parts = String(adminName).trim().split(/\s+/);
  const firstName = parts[0] || 'Admin';
  const lastName = parts.slice(1).join(' ') || 'User';
  const year = String(new Date().getFullYear());
  const joinDate = `${year}-01-01`;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [company] = await Company.create(
      [
        {
          name: companyName,
          logoUrl: logoUrl || '',
          code: 'OI',
          joiningSerialByYear: { [year]: 0 },
        },
      ],
      { session }
    );

    const loginId = await allocateLoginId(company._id, firstName, lastName, joinDate, session);
    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await User.create(
      [
        {
          companyId: company._id,
          loginId,
          email: email.toLowerCase(),
          passwordHash,
          role: 'ADMIN',
          mustChangePassword: false,
          employeeId: null,
        },
      ],
      { session }
    );

    const [employee] = await Employee.create(
      [
        {
          companyId: company._id,
          userId: user._id,
          firstName,
          lastName,
          email: email.toLowerCase(),
          mobile: phone || '',
          jobPosition: 'HR Officer',
          department: 'Human Resources',
          dateOfJoining: joinDate,
          salary: { wage: 0, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
        },
      ],
      { session }
    );

    user.employeeId = employee._id;
    await user.save({ session });

    await session.commitTransaction();

    const token = signToken(user);
    return {
      token,
      user: await shapeMe(user, employee, company),
      mustChangePassword: false,
    };
  } catch (err) {
    await session.abortTransaction();
    // Local Mongo without replica set: fall back to sequential writes
    if (err.message && /transaction|replica set/i.test(err.message)) {
      return registerCompanySequential({ companyName, adminName, email, phone, password, logoUrl });
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function registerCompanySequential({ companyName, adminName, email, phone, password, logoUrl }) {
  const parts = String(adminName).trim().split(/\s+/);
  const firstName = parts[0] || 'Admin';
  const lastName = parts.slice(1).join(' ') || 'User';
  const year = String(new Date().getFullYear());
  const joinDate = `${year}-01-01`;

  const company = await Company.create({
    name: companyName,
    logoUrl: logoUrl || '',
    code: 'OI',
    joiningSerialByYear: { [year]: 0 },
  });

  const loginId = await allocateLoginId(company._id, firstName, lastName, joinDate);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    companyId: company._id,
    loginId,
    email: email.toLowerCase(),
    passwordHash,
    role: 'ADMIN',
    mustChangePassword: false,
    employeeId: null,
  });

  const employee = await Employee.create({
    companyId: company._id,
    userId: user._id,
    firstName,
    lastName,
    email: email.toLowerCase(),
    mobile: phone || '',
    jobPosition: 'HR Officer',
    department: 'Human Resources',
    dateOfJoining: joinDate,
    salary: { wage: 0, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
  });

  user.employeeId = employee._id;
  await user.save();

  return {
    token: signToken(user),
    user: await shapeMe(user, employee, company),
    mustChangePassword: false,
  };
}

async function login({ identifier, password }) {
  const id = String(identifier).trim();
  const user = await User.findOne({
    $or: [{ email: id.toLowerCase() }, { loginId: id.toUpperCase() }],
  });
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
  }

  const [employee, company] = await Promise.all([
    user.employeeId
      ? Employee.findById(user.employeeId).select('firstName lastName avatarUrl').lean()
      : null,
    Company.findById(user.companyId).select('name').lean(),
  ]);

  return {
    token: signToken(user),
    user: await shapeMe(user, employee, company),
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    throw new AppError('UNAUTHORIZED', 'Current password is incorrect', 401);
  }

  if (!newPassword || newPassword.length < 8) {
    throw new AppError('VALIDATION_ERROR', 'New password must be at least 8 characters', 400);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.mustChangePassword = false;
  await user.save();
  return { ok: true };
}

async function getMe(userCtx) {
  // Prefer JWT claims for role; hydrate name/avatar from DB with company filter
  const [user, employee, company] = await Promise.all([
    User.findById(userCtx.id).select('loginId email role companyId employeeId').lean(),
    userCtx.employeeId
      ? Employee.findOne({ _id: userCtx.employeeId, companyId: userCtx.companyId })
          .select('firstName lastName avatarUrl')
          .lean()
      : null,
    Company.findById(userCtx.companyId).select('name').lean(),
  ]);

  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  return {
    id: user._id.toString(),
    name: employee ? `${employee.firstName} ${employee.lastName}`.trim() : user.loginId,
    loginId: user.loginId,
    email: user.email,
    role: userCtx.role, // JWT role is authoritative
    avatarUrl: employee?.avatarUrl || '',
    companyId: user.companyId.toString(),
    employeeId: user.employeeId ? user.employeeId.toString() : null,
    companyName: company?.name || '',
  };
}

async function shapeMe(user, employee, company) {
  return {
    id: user._id.toString(),
    name: employee ? `${employee.firstName} ${employee.lastName}`.trim() : user.loginId,
    loginId: user.loginId,
    email: user.email,
    role: user.role,
    avatarUrl: employee?.avatarUrl || '',
    companyId: user.companyId.toString(),
    employeeId: user.employeeId ? user.employeeId.toString() : null,
    companyName: company?.name || '',
  };
}

module.exports = {
  registerCompany,
  login,
  changePassword,
  getMe,
  signToken,
};
