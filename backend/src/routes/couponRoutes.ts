import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getActiveCoupons
} from "../controllers/couponController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.get("/active", getActiveCoupons);
router.post("/validate", validateCoupon);

// Customer routes
router.post("/apply", authenticateUser, applyCoupon);

// Admin routes
router.post("/", 
  authenticateUser, 
  authorizeRoles("admin"), 
  createCoupon
);

router.get("/", 
  authenticateUser, 
  authorizeRoles("admin"), 
  getAllCoupons
);

router.get("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  getCoupon
);

router.put("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  updateCoupon
);

router.delete("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  deleteCoupon
);

export default router;