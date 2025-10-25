"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const apiError_1 = require("../utils/apiError");
const errorHandler = (err, _req, res, _next) => {
    let error = err;
    // If it's not an ApiError, create one
    if (!(error instanceof apiError_1.ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new apiError_1.ApiError(statusCode, message, [], err.stack);
    }
    // Handle specific MongoDB errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message).join(", ");
        error = new apiError_1.ApiError(400, `Validation Error: ${message}`);
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = new apiError_1.ApiError(409, message);
    }
    if (err.name === "CastError") {
        const message = "Invalid ID format";
        error = new apiError_1.ApiError(400, message);
    }
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token";
        error = new apiError_1.ApiError(401, message);
    }
    if (err.name === "TokenExpiredError") {
        const message = "Token expired";
        error = new apiError_1.ApiError(401, message);
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
exports.errorHandler = errorHandler;
// Handle 404 errors
const notFound = (req, _res, next) => {
    const error = new apiError_1.ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorMiddleware.js.map