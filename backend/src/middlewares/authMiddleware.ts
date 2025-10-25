import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { User } from "../models/UserModel";
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticateUser = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Access token is required");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
        const user = await User.findById(decodedToken?.userId).select("-password -refreshToken -emailVerificationToken -passwordResetToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        if (user.status === 'blocked') {
            throw new ApiError(403, "Your account has been blocked");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new ApiError(401, "Authentication required");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }

        next();
    };
};