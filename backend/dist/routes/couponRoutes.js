"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponController_1 = require("../controllers/couponController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/active", couponController_1.getActiveCoupons);
router.post("/validate", couponController_1.validateCoupon);
// Customer routes
router.post("/apply", authMiddleware_1.authenticateUser, couponController_1.applyCoupon);
// Admin routes
router.post("/", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), couponController_1.createCoupon);
router.get("/", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), couponController_1.getAllCoupons);
router.get("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), couponController_1.getCoupon);
router.put("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), couponController_1.updateCoupon);
router.delete("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), couponController_1.deleteCoupon);
exports.default = router;
//# sourceMappingURL=couponRoutes.js.map