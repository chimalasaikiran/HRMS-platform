class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.isOperational = true;
  }
}

function sendError(res, status, code, message) {
  // Top-level `message` keeps Frontend AuthContext happy (reads responseData.message first)
  return res.status(status).json({
    message,
    error: { code, message },
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === 'ZodError') {
    const message = err.errors?.map((e) => e.message).join('; ') || 'Validation failed';
    return sendError(res, 400, 'VALIDATION_ERROR', message);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'VALIDATION_ERROR', err.message);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'VALIDATION_ERROR', `Invalid ${err.path || 'id'}`);
  }

  if (err instanceof SyntaxError && (err.status === 400 || err.type === 'entity.parse.failed')) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Invalid JSON body');
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, 409, 'CONFLICT', `Duplicate ${field}`);
  }

  if (err.isOperational) {
    return sendError(res, err.status, err.code, err.message);
  }

  console.error(err);
  return sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { AppError, errorHandler, asyncHandler };
