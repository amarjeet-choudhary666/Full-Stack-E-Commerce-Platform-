"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Customer routes (require authentication)
router.post("/", authMiddleware_1.authenticateUser, orderController_1.createOrder);
router.get("/my-orders", authMiddleware_1.authenticateUser, orderController_1.getUserOrders);
router.get("/:id", authMiddleware_1.authenticateUser, orderController_1.getOrder);
router.patch("/:id/cancel", authMiddleware_1.authenticateUser, orderController_1.cancelOrder);
// Admin routes
router.get("/", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), orderController_1.getAllOrders);
router.get("/stats/overview", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), orderController_1.getOrderStats);
router.patch("/:id/status", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map