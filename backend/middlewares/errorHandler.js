const errorHandler = (err, req, res, next) => {
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;
  
  // Don't expose sensitive error details to client in production
  const message = process.env.NODE_ENV === "production" 
    ? (statusCode === 500 ? "Internal Server Error" : err.message)
    : err.message;

  // Structured error response
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== "production" && { error: err.message, stack: err.stack }),
  });
};

module.exports = errorHandler;
