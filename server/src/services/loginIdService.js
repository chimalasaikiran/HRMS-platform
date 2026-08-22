const Company = require('../models/Company');
const { AppError } = require('../middleware/errorHandler');

function letters(name, n = 2) {
  const cleaned = String(name || '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();
  return (cleaned + 'XX').slice(0, n);
}

/**
 * OI + 2 first + 2 last + year + 4-digit serial
 * John Doe, 2022, 1st → OIJODO20220001
 */
async function allocateLoginId(companyId, firstName, lastName, dateOfJoining, session = null) {
  const year = (dateOfJoining || todayYear()).slice(0, 4);
  const prefix = `OI${letters(firstName)}${letters(lastName)}${year}`;

  const update = { $inc: { [`joiningSerialByYear.${year}`]: 1 } };
  const opts = { new: true };
  if (session) opts.session = session;

  const company = await Company.findByIdAndUpdate(companyId, update, opts);
  if (!company) {
    throw new AppError('NOT_FOUND', 'Company not found', 404);
  }

  const serial = company.joiningSerialByYear.get
    ? company.joiningSerialByYear.get(year)
    : company.joiningSerialByYear[year];

  if (!serial) {
    throw new AppError('INTERNAL_ERROR', 'Failed to allocate login serial', 500);
  }

  return `${prefix}${String(serial).padStart(4, '0')}`;
}

function todayYear() {
  return String(new Date().getFullYear());
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#';
  let out = 'Df';
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

module.exports = { allocateLoginId, generateTempPassword, letters };
