import { Router } from "express";
import {
    registerUser,
    loginUser,
    verifyEmail,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    getCurrentUser
} from "../controllers/userController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.post("/logout", authenticateUser, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes example
router.get("/profile", authenticateUser, getCurrentUser);

router.get("/admin-only", authenticateUser, authorizeRoles("admin"), (_req, res) => {
    res.json({ message: "Admin access granted" });
});

export default router;