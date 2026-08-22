class AppError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === 'ZodError') {
    const message = err.errors?.map((e) => e.message).join('; ') || 'Validation failed';
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message },
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      error: { code: 'CONFLICT', message: `Duplicate ${field}` },
    });
  }

  if (err.isOperational) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { AppError, errorHandler, asyncHandler };
