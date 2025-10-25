import { asyncHandler } from "../utils/asyncHandler";
import { Review } from "../models/ReviewModel";
import { Product } from "../models/ProductModel";
import { Order } from "../models/OrderModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { uploadMultipleToCloudinary } from "../utils/fileUpload";

// Create review
export const createReview = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id, rating, comment } = req.body;

  if (!product_id || !rating || !comment) {
    throw new ApiError(400, "Product ID, rating, and comment are required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Check if product exists
  const product = await Product.findById(product_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({ product_id, user_id: userId });
  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this product");
  }

  // Check if user has purchased this product
  const hasPurchased = await Order.findOne({
    user_id: userId,
    "items.product_id": product_id,
    status: "delivered"
  });

  // Handle image uploads
  let imageUrls: string[] = [];
  if ((req as any).files && Array.isArray((req as any).files)) {
    imageUrls = await uploadMultipleToCloudinary((req as any).files, "reviews");
  }

  const review = await Review.create({
    product_id,
    user_id: userId,
    rating: parseInt(rating),
    comment,
    images: imageUrls,
    verified_purchase: !!hasPurchased,
    status: "approved" // Auto-approve for now, can be changed to "pending" for moderation
  });

  const populatedReview = await Review.findById(review._id)
    .populate("user_id", "name")
    .populate("product_id", "name");

  return res.status(201).json(
    new ApiResponse(201, populatedReview, "Review created successfully")
  );
});

// Get product reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  const filter: any = { 
    product_id: productId, 
    status: "approved" 
  };
  
  if (rating) {
    filter.rating = parseInt(rating as string);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total, averageRating] = await Promise.all([
    Review.find(filter)
      .populate("user_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { product_id: productId, status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ])
  ]);

  const ratingStats = averageRating[0] || { avgRating: 0, totalReviews: 0 };
  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
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
    }, "Product reviews fetched successfully")
  );
});

// Get user's reviews
export const getUserReviews = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find({ user_id: userId })
      .populate("product_id", "name images slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments({ user_id: userId })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalReviews: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "User reviews fetched successfully")
  );
});

// Update review
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user._id;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: id, user_id: userId });
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (rating && (rating < 1 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const updateData: any = {};
  if (rating) updateData.rating = parseInt(rating);
  if (comment) updateData.comment = comment;

  // Handle image uploads
  if ((req as any).files && Array.isArray((req as any).files) && (req as any).files.length > 0) {
    updateData.images = await uploadMultipleToCloudinary((req as any).files, "reviews");
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("user_id", "name").populate("product_id", "name");

  return res.status(200).json(
    new ApiResponse(200, updatedReview, "Review updated successfully")
  );
});

// Delete review
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user._id;
  const userRole = (req as any).user.role;

  let filter: any = { _id: id };
  
  // Non-admin users can only delete their own reviews
  if (userRole !== "admin") {
    filter.user_id = userId;
  }

  const review = await Review.findOne(filter);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await Review.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Review deleted successfully")
  );
});

// Mark review as helpful
export const markReviewHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndUpdate(
    id,
    { $inc: { helpful_count: 1 } },
    { new: true }
  ).populate("user_id", "name");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res.status(200).json(
    new ApiResponse(200, review, "Review marked as helpful")
  );
});

// Get review statistics for a product
export const getReviewStats = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const stats = await Review.aggregate([
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
    ratingDistribution[stat._id as keyof typeof ratingDistribution] = stat.count;
  });

  return res.status(200).json(
    new ApiResponse(200, {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    }, "Review statistics fetched successfully")
  );
});

// Admin: Get all reviews for moderation
export const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, rating } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (rating) filter.rating = parseInt(rating as string);

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate("user_id", "name email")
      .populate("product_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalReviews: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "All reviews fetched successfully")
  );
});

// Admin: Update review status
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const review = await Review.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("user_id", "name").populate("product_id", "name");

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res.status(200).json(
    new ApiResponse(200, review, "Review status updated successfully")
  );
});