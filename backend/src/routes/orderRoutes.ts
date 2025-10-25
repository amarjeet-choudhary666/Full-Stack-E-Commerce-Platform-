import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats
} from "../controllers/orderController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// Customer routes (require authentication)
router.post("/", authenticateUser, createOrder);
router.get("/my-orders", authenticateUser, getUserOrders);
router.get("/:id", authenticateUser, getOrder);
router.patch("/:id/cancel", authenticateUser, cancelOrder);

// Admin routes
router.get("/", authenticateUser, authorizeRoles("admin"), getAllOrders);
router.get("/stats/overview", authenticateUser, authorizeRoles("admin"), getOrderStats);
router.patch("/:id/status", authenticateUser, authorizeRoles("admin"), updateOrderStatus);

export default router;