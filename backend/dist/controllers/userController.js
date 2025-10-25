"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.resetPassword = exports.forgotPassword = exports.refreshAccessToken = exports.logoutUser = exports.verifyEmail = exports.loginUser = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const UserModel_1 = require("../models/UserModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("../utils/emailService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
// register user controller
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            throw new apiError_1.ApiError(400, "All fields are required");
        }
        const existingUser = await UserModel_1.User.findOne({ email });
        if (existingUser) {
            throw new apiError_1.ApiError(409, "User already exists with this email");
        }
        const user = await UserModel_1.User.create({
            name,
            email: email,
            password
        });
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        try {
            await (0, emailService_1.sendVerificationEmail)(email, verificationToken);
        }
        catch (emailError) {
            console.error("Email sending failed:", emailError);
        }
        const createdUser = await UserModel_1.User.findById(user._id).select("-password -refreshToken -emailVerificationToken -passwordResetToken");
        if (!createdUser) {
            throw new apiError_1.ApiError(500, "Something went wrong while creating user");
        }
        return res.status(201).json(new apiResponse_1.ApiResponse(201, createdUser, "User registered successfully. Please check your email to verify your account."));
    }
    catch (error) {
        console.error("Error in registerUser:", error.message);
        const statusCode = error.statusCode || 500;
        return res
            .status(statusCode)
            .json({
            success: false,
            message: error.message || "Internal Server Error",
            statusCode
        });
    }
});
// login User controller
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
        throw new apiError_1.ApiError(400, "All fields are required");
    }
    const user = await UserModel_1.User.findOne({ email }).select("+password");
    if (!user) {
        throw new apiError_1.ApiError(404, "User does not exist with this email");
    }
    if (!user.isEmailVerified) {
        throw new apiError_1.ApiError(403, "Please verify your email before logging in");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError(401, "Invalid credentials");
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
    const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const loggedInUser = await UserModel_1.User.findById(user._id).select("-password -refreshToken -emailVerificationToken -passwordResetToken");
    const options = {
        httpOnly: true,
        secure: true,
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined // 7 days if remember me, else session
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse_1.ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken
    }, "User logged in successfully"));
});
// verify email controller
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new apiError_1.ApiError(400, "Verification token is required");
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel_1.User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() }
    });
    if (!user) {
        throw new apiError_1.ApiError(400, "Invalid or expired verification token");
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Email verified successfully"));
});
// logout controller
exports.logoutUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    if (userId) {
        await UserModel_1.User.findByIdAndUpdate(userId, {
            $unset: { refreshToken: 1 }
        });
    }
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse_1.ApiResponse(200, {}, "User logged out successfully"));
});
// refresh token controller
exports.refreshAccessToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError_1.ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await UserModel_1.User.findById(decodedToken?.userId);
        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new apiError_1.ApiError(401, "Invalid refresh token");
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        const options = {
            httpOnly: true,
            secure: true
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new apiResponse_1.ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
    }
    catch (error) {
        throw new apiError_1.ApiError(401, "Invalid refresh token");
    }
});
// forgot password controller
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new apiError_1.ApiError(400, "Email is required");
    }
    const user = await UserModel_1.User.findOne({ email });
    if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "If an account with that email exists, a password reset link has been sent."));
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
        await (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Password reset link sent to your email"));
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new apiError_1.ApiError(500, "Failed to send password reset email");
    }
});
// reset password controller
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!token || !password) {
        throw new apiError_1.ApiError(400, "Token and password are required");
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel_1.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
    });
    if (!user) {
        throw new apiError_1.ApiError(400, "Invalid or expired reset token");
    }
    user.password = password; // Will be hashed by pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Password reset successfully"));
});
// get current user profile
exports.getCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return res.status(200).json(new apiResponse_1.ApiResponse(200, { user: req.user }, "User profile fetched successfully"));
});
//# sourceMappingURL=userController.js.map