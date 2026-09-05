export function errorHandler(error, req, res, next) {
  console.error('Error:', error);

  // Validation error
  if (error.name === 'ValidationError') {
    return res.status(422).json({
      ok: false,
      error: error.message,
      status: 422,
    });
  }

  // Database constraint error
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      ok: false,
      error: 'This resource already exists or violates database constraints',
      status: 409,
    });
  }

  // Generic error response
  const status = error.status || 500;
  const message = error.message || 'An unexpected error occurred';

  res.status(status).json({
    ok: false,
    error: message,
    status: status,
  });
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 422;
  }
}
