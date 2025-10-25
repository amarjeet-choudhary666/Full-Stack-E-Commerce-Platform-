import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = err;

  // If it's not an ApiError, create one
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Handle specific MongoDB errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val: any) => val.message).join(", ");
    error = new ApiError(400, `Validation Error: ${message}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ApiError(409, message);
  }

  if (err.name === "CastError") {
    const message = "Invalid ID format";
    error = new ApiError(400, message);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ApiError(401, message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ApiError(401, message);
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
};

// Handle 404 errors
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};