"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewStatus = exports.getAllReviews = exports.getReviewStats = exports.markReviewHelpful = exports.deleteReview = exports.updateReview = exports.getUserReviews = exports.getProductReviews = exports.createReview = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ReviewModel_1 = require("../models/ReviewModel");
const ProductModel_1 = require("../models/ProductModel");
const OrderModel_1 = require("../models/OrderModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const fileUpload_1 = require("../utils/fileUpload");
// Create review
exports.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating || !comment) {
        throw new apiError_1.ApiError(400, "Product ID, rating, and comment are required");
    }
    if (rating < 1 || rating > 5) {
        throw new apiError_1.ApiError(400, "Rating must be between 1 and 5");
    }
    // Check if product exists
    const product = await ProductModel_1.Product.findById(product_id);
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    // Check if user has already reviewed this product
    const existingReview = await ReviewModel_1.Review.findOne({ product_id, user_id: userId });
    if (existingReview) {
        throw new apiError_1.ApiError(409, "You have already reviewed this product");
    }
    // Check if user has purchased this product
    const hasPurchased = await OrderModel_1.Order.findOne({
        user_id: userId,
        "items.product_id": product_id,
        status: "delivered"
    });
    // Handle image uploads
    let imageUrls = [];
    if (req.files && Array.isArray(req.files)) {
        imageUrls = await (0, fileUpload_1.uploadMultipleToCloudinary)(req.files, "reviews");
    }
    const review = await ReviewModel_1.Review.create({
        product_id,
        user_id: userId,
        rating: parseInt(rating),
        comment,
        images: imageUrls,
        verified_purchase: !!hasPurchased,
        status: "approved" // Auto-approve for now, can be changed to "pending" for moderation
    });
    const populatedReview = await ReviewModel_1.Review.findById(review._id)
        .populate("user_id", "name")
        .populate("product_id", "name");
    return res.status(201).json(new apiResponse_1.ApiResponse(201, populatedReview, "Review created successfully"));
});
// Get product reviews
exports.getProductReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const filter = {
        product_id: productId,
        status: "approved"
    };
    if (rating) {
        filter.rating = parseInt(rating);
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [reviews, total, averageRating] = await Promise.all([
        ReviewModel_1.Review.find(filter)
            .populate("user_id", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        ReviewModel_1.Review.countDocuments(filter),
        ReviewModel_1.Review.aggregate([
            { $match: { product_id: productId, status: "approved" } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ])
    ]);
    const ratingStats = averageRating[0] || { avgRating: 0, totalReviews: 0 };
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        reviews,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalReviews: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        },
        averageRating: Math.round(ratingStats.avgRating * 10) / 10,
        totalReviews: ratingStats.totalReviews
    }, "Product reviews fetched successfully"));
});
// Get user's reviews
exports.getUserReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [reviews, total] = await Promise.all([
        ReviewModel_1.Review.find({ user_id: userId })
            .populate("product_id", "name images slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        ReviewModel_1.Review.countDocuments({ user_id: userId })
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        reviews,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalReviews: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "User reviews fetched successfully"));
});
// Update review
exports.updateReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;
    const review = await ReviewModel_1.Review.findOne({ _id: id, user_id: userId });
    if (!review) {
        throw new apiError_1.ApiError(404, "Review not found");
    }
    if (rating && (rating < 1 || rating > 5)) {
        throw new apiError_1.ApiError(400, "Rating must be between 1 and 5");
    }
    const updateData = {};
    if (rating)
        updateData.rating = parseInt(rating);
    if (comment)
        updateData.comment = comment;
    // Handle image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        updateData.images = await (0, fileUpload_1.uploadMultipleToCloudinary)(req.files, "reviews");
    }
    const updatedReview = await ReviewModel_1.Review.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("user_id", "name").populate("product_id", "name");
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedReview, "Review updated successfully"));
});
// Delete review
exports.deleteReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    let filter = { _id: id };
    // Non-admin users can only delete their own reviews
    if (userRole !== "admin") {
        filter.user_id = userId;
    }
    const review = await ReviewModel_1.Review.findOne(filter);
    if (!review) {
        throw new apiError_1.ApiError(404, "Review not found");
    }
    await ReviewModel_1.Review.findByIdAndDelete(id);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Review deleted successfully"));
});
// Mark review as helpful
exports.markReviewHelpful = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const review = await ReviewModel_1.Review.findByIdAndUpdate(id, { $inc: { helpful_count: 1 } }, { new: true }).populate("user_id", "name");
    if (!review) {
        throw new apiError_1.ApiError(404, "Review not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, review, "Review marked as helpful"));
});
// Get review statistics for a product
exports.getReviewStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const stats = await ReviewModel_1.Review.aggregate([
        { $match: { product_id: productId, status: "approved" } },
        {
            $group: {
                _id: "$rating",
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);
    const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0);
    const averageRating = stats.reduce((sum, stat) => sum + (stat._id * stat.count), 0) / totalReviews || 0;
    const ratingDistribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    stats.forEach(stat => {
        ratingDistribution[stat._id] = stat.count;
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
    }, "Review statistics fetched successfully"));
});
// Admin: Get all reviews for moderation
exports.getAllReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 20, status, rating } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    if (rating)
        filter.rating = parseInt(rating);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [reviews, total] = await Promise.all([
        ReviewModel_1.Review.find(filter)
            .populate("user_id", "name email")
            .populate("product_id", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        ReviewModel_1.Review.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        reviews,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalReviews: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "All reviews fetched successfully"));
});
// Admin: Update review status
exports.updateReviewStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
        throw new apiError_1.ApiError(400, "Invalid status");
    }
    const review = await ReviewModel_1.Review.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).populate("user_id", "name").populate("product_id", "name");
    if (!review) {
        throw new apiError_1.ApiError(404, "Review not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, review, "Review status updated successfully"));
});
//# sourceMappingURL=reviewController.js.map