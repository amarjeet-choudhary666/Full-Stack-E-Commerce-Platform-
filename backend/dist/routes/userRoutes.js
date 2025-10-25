"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/register", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.get("/verify-email", userController_1.verifyEmail);
router.post("/logout", authMiddleware_1.authenticateUser, userController_1.logoutUser);
router.post("/refresh-token", userController_1.refreshAccessToken);
router.post("/forgot-password", userController_1.forgotPassword);
router.post("/reset-password", userController_1.resetPassword);
// Protected routes example
router.get("/profile", authMiddleware_1.authenticateUser, userController_1.getCurrentUser);
router.get("/admin-only", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), (_req, res) => {
    res.json({ message: "Admin access granted" });
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map