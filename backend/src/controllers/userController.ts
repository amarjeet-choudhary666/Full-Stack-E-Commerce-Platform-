import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/UserModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService";
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

// register user controller
export const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, role = 'customer' } = req.body;

        if (!name || !email || !password) {
            throw new ApiError(400, "All fields are required")
        }

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new ApiError(409, "User already exists with this email")
        }

        const user = await User.create(
            {
                name,
                email: email,
                password,
                role: role === 'admin' ? 'admin' : 'customer'
            }
        )

        const verificationToken = (user as any).generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -passwordResetToken")

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while creating user")
        }

        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully. Please check your email to verify your account.")
        )
    } catch (error: any) {
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
}
)




// login User controller
export const loginUser = asyncHandler(async(req, res) => {
    const {email, password, rememberMe} = req.body;

    if(!email || !password){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({email}).select("+password")

    if(!user){
        throw new ApiError(404, "User does not exist with this email")
    }

    // Temporarily disable email verification for development
    // if (!user.isEmailVerified) {
    //     throw new ApiError(403, "Please verify your email before logging in")
    // }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    const accessToken = generateAccessToken((user._id as any).toString())
    const refreshToken = generateRefreshToken((user._id as any).toString())

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -passwordResetToken")

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined // 7 days if remember me, else session
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})


// verify email controller
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new ApiError(400, "Verification token is required");
    }

    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
});

// logout controller
export const logoutUser = asyncHandler(async (req, res) => {
    const userId = (req as any).user?._id;

    if (userId) {
        await User.findByIdAndUpdate(userId, {
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
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// refresh token controller
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
        const user = await User.findById(decodedToken?.userId);

        if (!user || incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const accessToken = generateAccessToken((user._id as any).toString());
        const refreshToken = generateRefreshToken((user._id as any).toString());

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
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

// forgot password controller
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if email exists or not for security
        return res.status(200).json(
            new ApiResponse(200, {}, "If an account with that email exists, a password reset link has been sent.")
        );
    }

    const resetToken = (user as any).generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail(email, resetToken);
        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset link sent to your email")
        );
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Failed to send password reset email");
    }
});

// reset password controller
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || !password) {
        throw new ApiError(400, "Token and password are required");
    }

    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired reset token");
    }

    user.password = password; // Will be hashed by pre-save middleware
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully")
    );
});

// get current user profile
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { user: (req as any).user }, "User profile fetched successfully")
    );
});
