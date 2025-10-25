import { Router } from "express";
import {
  getDashboardOverview,
  getSalesAnalytics,
  getTopSellingProducts,
  getCustomerAnalytics,
  getInventoryAlerts,
  getOrderStatusDistribution,
  getRecentActivities
} from "../controllers/adminController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateUser, authorizeRoles("admin"));

router.get("/dashboard/overview", getDashboardOverview);
router.get("/analytics/sales", getSalesAnalytics);
router.get("/analytics/top-products", getTopSellingProducts);
router.get("/analytics/customers", getCustomerAnalytics);
router.get("/inventory/alerts", getInventoryAlerts);
router.get("/orders/status-distribution", getOrderStatusDistribution);
router.get("/activities/recent", getRecentActivities);

export default router;