"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"));
router.get("/dashboard/overview", adminController_1.getDashboardOverview);
router.get("/analytics/sales", adminController_1.getSalesAnalytics);
router.get("/analytics/top-products", adminController_1.getTopSellingProducts);
router.get("/analytics/customers", adminController_1.getCustomerAnalytics);
router.get("/inventory/alerts", adminController_1.getInventoryAlerts);
router.get("/orders/status-distribution", adminController_1.getOrderStatusDistribution);
router.get("/activities/recent", adminController_1.getRecentActivities);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map