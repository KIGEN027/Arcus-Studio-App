/* ════════════════════════════════════════════
   ARCUS — Error Handler Middleware
   ════════════════════════════════════════════ */

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Duplicate key (e.g. email)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
  }

  // Known HTTP errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Fallback 500
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
}

function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function asyncWrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, createError, asyncWrap };
