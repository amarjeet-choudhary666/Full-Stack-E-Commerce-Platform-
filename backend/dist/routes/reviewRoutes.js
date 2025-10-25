"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileUpload_1 = require("../utils/fileUpload");
const router = (0, express_1.Router)();
// Public routes
router.get("/product/:productId", reviewController_1.getProductReviews);
router.get("/product/:productId/stats", reviewController_1.getReviewStats);
// Customer routes (require authentication)
router.post("/", authMiddleware_1.authenticateUser, (0, fileUpload_1.uploadMultiple)("images", 3), reviewController_1.createReview);
router.get("/my-reviews", authMiddleware_1.authenticateUser, reviewController_1.getUserReviews);
router.put("/:id", authMiddleware_1.authenticateUser, (0, fileUpload_1.uploadMultiple)("images", 3), reviewController_1.updateReview);
router.delete("/:id", authMiddleware_1.authenticateUser, reviewController_1.deleteReview);
router.patch("/:id/helpful", reviewController_1.markReviewHelpful);
// Admin routes
router.get("/", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), reviewController_1.getAllReviews);
router.patch("/:id/status", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), reviewController_1.updateReviewStatus);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map