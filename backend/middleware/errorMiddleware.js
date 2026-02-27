// middleware/errorMiddleware.js

/**
 * 404 Not Found Middleware
 * Handles requests to routes that don't exist
 */
export const notFound = (req, res, next) => {
  const error = new Error(`🔍 Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error("❌ Error:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Set default status code
  const statusCode = err.status || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development only
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === "ValidationError") {
    // Mongoose validation error
    errorResponse.message = "Validation Failed";
    errorResponse.errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(errorResponse);
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyPattern)[0];
    errorResponse.message = `${field} already exists. Please use a different value.`;
    return res.status(400).json(errorResponse);
  }

  if (err.name === "JsonWebTokenError") {
    errorResponse.message = "Invalid token. Please log in again.";
    return res.status(401).json(errorResponse);
  }

  if (err.name === "TokenExpiredError") {
    errorResponse.message = "Token expired. Please log in again.";
    return res.status(401).json(errorResponse);
  }

  if (err.name === "CastError") {
    errorResponse.message = "Invalid ID format";
    return res.status(400).json(errorResponse);
  }

  // Send response
  res.status(statusCode).json(errorResponse);
};