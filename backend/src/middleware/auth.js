const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const ROLES = new Set(['ADMIN', 'EMPLOYEE']);

/**
 * Auth is JWT-only for identity + role.
 * Role is taken from the verified token payload — never from request body/query.
 */
function authJwt(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError('INTERNAL_ERROR', 'JWT_SECRET is not configured', 500);
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired token', 401);
    }

    if (!payload?.sub || !payload?.role || !payload?.companyId) {
      throw new AppError('UNAUTHORIZED', 'Token missing required claims', 401);
    }

    if (!ROLES.has(payload.role)) {
      throw new AppError('UNAUTHORIZED', 'Invalid role in token', 401);
    }

    // Role / scope from JWT only — ignore any client-supplied role fields
    req.user = {
      id: String(payload.sub),
      role: payload.role,
      companyId: String(payload.companyId),
      employeeId: payload.employeeId ? String(payload.employeeId) : null,
      loginId: payload.loginId || '',
      email: payload.email || '',
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
    next();
  } catch (err) {
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new AppError('FORBIDDEN', 'Admin access required', 403));
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 'Insufficient permissions', 403));
    }
    next();
  };
}

module.exports = { authJwt, requireAdmin, requireRole, ROLES };
