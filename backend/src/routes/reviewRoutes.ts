import { Router } from "express";
import {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getReviewStats,
  getAllReviews,
  updateReviewStatus
} from "../controllers/reviewController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";
import { uploadMultiple } from "../utils/fileUpload";

const router = Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/product/:productId/stats", getReviewStats);

// Customer routes (require authentication)
router.post("/", 
  authenticateUser, 
  uploadMultiple("images", 3), 
  createReview
);

router.get("/my-reviews", authenticateUser, getUserReviews);

router.put("/:id", 
  authenticateUser, 
  uploadMultiple("images", 3), 
  updateReview
);

router.delete("/:id", authenticateUser, deleteReview);
router.patch("/:id/helpful", markReviewHelpful);

// Admin routes
router.get("/", 
  authenticateUser, 
  authorizeRoles("admin"), 
  getAllReviews
);

router.patch("/:id/status", 
  authenticateUser, 
  authorizeRoles("admin"), 
  updateReviewStatus
);

export default router;