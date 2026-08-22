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
      role: user.role, // ADMIN | EMPLOYEE ΓÇö source of truth for authorization
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
          .select('firstName lastName avatarUrl department')
          .lean()
      : null,
    Company.findById(userCtx.companyId).select('name').lean(),
  ]);

  if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);

  const fullName = employee
    ? `${employee.firstName} ${employee.lastName}`.trim()
    : user.loginId;

  return {
    id: user._id.toString(),
    name: fullName,
    fullName,
    loginId: user.loginId,
    email: user.email,
    role: mapRoleToDisplay(userCtx.role),
    avatarUrl: employee?.avatarUrl || '',
    companyId: user.companyId.toString(),
    employeeId: user.employeeId ? user.employeeId.toString() : null,
    companyName: company?.name || '',
    department:
      employee?.department ||
      (userCtx.role === 'ADMIN' ? 'People Operations' : 'General Staff'),
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

/** Frontend display roles Γåö DB roles */
function mapRoleToDb(role) {
  const r = String(role || '').trim().toLowerCase();
  if (
    r === 'hr / people team' ||
    r === 'hr' ||
    r === 'admin' ||
    r === 'people team'
  ) {
    return 'ADMIN';
  }
  return 'EMPLOYEE';
}

function mapRoleToDisplay(dbRole) {
  return dbRole === 'ADMIN' ? 'HR / People team' : 'Employee';
}

function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'User',
    // Employee.lastName is required — never send an empty string
    lastName: parts.slice(1).join(' ') || 'Member',
  };
}

async function ensureDefaultCompany() {
  let company = await Company.findOne({ name: 'Dayflow' });
  if (company) return company;
  company = await Company.findOne().sort({ createdAt: 1 });
  if (company) return company;
  return Company.create({
    name: 'Dayflow',
    logoUrl: '',
    code: 'OI',
    joiningSerialByYear: {},
  });
}

/**
 * Frontend signup: { employeeId, email, password, fullName, role }
 * HR -> new company + ADMIN; Employee -> joins Dayflow (or first) company.
 */
async function signup({ employeeId, email, password, fullName, role }) {
  const empCode = String(employeeId || '').trim().toUpperCase();
  const emailNorm = String(email || '').trim().toLowerCase();
  const name = String(fullName || '').trim();

  if (!empCode || !emailNorm || !password || !name) {
    throw new AppError(
      'VALIDATION_ERROR',
      'employeeId, email, password, and fullName are required',
      400
    );
  }
  if (String(password).length < 6) {
    throw new AppError('VALIDATION_ERROR', 'Password must be at least 6 characters', 400);
  }

  const existingEmail = await User.findOne({ email: emailNorm });
  if (existingEmail) {
    throw new AppError('CONFLICT', 'Email already registered', 409);
  }

  const existingLogin = await User.findOne({ loginId: empCode });
  if (existingLogin) {
    throw new AppError('CONFLICT', 'This Employee ID is already registered', 409);
  }

  const dbRole = mapRoleToDb(role);
  const { firstName, lastName } = splitFullName(name);
  const year = String(new Date().getFullYear());
  const joinDate = `${year}-01-01`;
  const passwordHash = await bcrypt.hash(password, 10);
  const department = dbRole === 'ADMIN' ? 'People Operations' : 'General Staff';
  const jobPosition = dbRole === 'ADMIN' ? 'HR Officer' : 'Team Member';

  let company;
  let createdCompany = false;
  if (dbRole === 'ADMIN') {
    company = await Company.create({
      name: `${name}'s Company`,
      logoUrl: '',
      code: 'OI',
      joiningSerialByYear: { [year]: 0 },
    });
    createdCompany = true;
  } else {
    company = await ensureDefaultCompany();
  }

  let user;
  try {
    user = await User.create({
      companyId: company._id,
      loginId: empCode,
      email: emailNorm,
      passwordHash,
      role: dbRole,
      mustChangePassword: false,
      employeeId: null,
    });

    const employee = await Employee.create({
      companyId: company._id,
      userId: user._id,
      firstName,
      lastName,
      email: emailNorm,
      mobile: '',
      jobPosition,
      department,
      dateOfJoining: joinDate,
      privateInfo: { bank: { empCode } },
      salary: { wage: 0, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
    });

    user.employeeId = employee._id;
    await user.save();

    const me = await shapeMe(user, employee, company);
    return {
      token: signToken(user),
      user: {
        ...me,
        fullName: name,
        employeeId: me.employeeId,
        loginId: empCode,
        role: mapRoleToDisplay(dbRole),
        department,
      },
      mustChangePassword: false,
      message: 'Account created successfully',
    };
  } catch (err) {
    if (user?._id) {
      await User.deleteOne({ _id: user._id }).catch(() => {});
    }
    if (createdCompany && company?._id) {
      await Company.deleteOne({ _id: company._id }).catch(() => {});
    }
    throw err;
  }
}

async function login({ identifier, email, password }) {
  const id = String(identifier || email || '').trim();
  if (!id) {
    throw new AppError('VALIDATION_ERROR', 'identifier or email is required', 400);
  }

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

  // Repair orphaned users created before lastName/signup rollback fixes
  if (!user.employeeId) {
    const { firstName, lastName } = splitFullName(user.loginId);
    const year = String(new Date().getFullYear());
    const employee = await Employee.create({
      companyId: user.companyId,
      userId: user._id,
      firstName,
      lastName,
      email: user.email,
      mobile: '',
      jobPosition: user.role === 'ADMIN' ? 'HR Officer' : 'Team Member',
      department: user.role === 'ADMIN' ? 'People Operations' : 'General Staff',
      dateOfJoining: `${year}-01-01`,
      privateInfo: { bank: { empCode: user.loginId } },
      salary: { wage: 0, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
    });
    user.employeeId = employee._id;
    await user.save();
  }

  const [employee, company] = await Promise.all([
    user.employeeId
      ? Employee.findById(user.employeeId)
          .select('firstName lastName avatarUrl department')
          .lean()
      : null,
    Company.findById(user.companyId).select('name').lean(),
  ]);

  const me = await shapeMe(user, employee, company);
  const fullName = employee
    ? `${employee.firstName} ${employee.lastName}`.trim()
    : user.loginId;

  return {
    token: signToken(user),
    user: {
      ...me,
      fullName,
      role: mapRoleToDisplay(user.role),
      department:
        employee?.department ||
        (user.role === 'ADMIN' ? 'People Operations' : 'General Staff'),
    },
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

module.exports = {
  registerCompany,
  signup,
  login,
  changePassword,
  getMe,
  signToken,
  mapRoleToDb,
  mapRoleToDisplay,
};
