function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  const payload = {
    message: err.message || 'Server error'
  };

  if (err.name === 'ValidationError') {
    payload.message = Object.values(err.errors).map((item) => item.message).join(', ');
  }

  if (err.name === 'CastError') {
    payload.message = 'Resource not found';
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };

