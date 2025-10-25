"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
const UserModel_1 = require("../models/UserModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.authenticateUser = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new apiError_1.ApiError(401, "Access token is required");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await UserModel_1.User.findById(decodedToken?.userId).select("-password -refreshToken -emailVerificationToken -passwordResetToken");
        if (!user) {
            throw new apiError_1.ApiError(401, "Invalid access token");
        }
        if (user.status === 'blocked') {
            throw new apiError_1.ApiError(403, "Your account has been blocked");
        }
        req.user = user;
        next();
    }
    catch (error) {
        throw new apiError_1.ApiError(401, "Invalid access token");
    }
});
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new apiError_1.ApiError(401, "Authentication required");
        }
        if (!roles.includes(req.user.role)) {
            throw new apiError_1.ApiError(403, "You do not have permission to perform this action");
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=authMiddleware.js.map