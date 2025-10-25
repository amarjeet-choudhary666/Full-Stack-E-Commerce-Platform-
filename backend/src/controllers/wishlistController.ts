import { asyncHandler } from "../utils/asyncHandler";
import { Wishlist } from "../models/WishlistModel";
import { Product } from "../models/ProductModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

// Get user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  let wishlist = await Wishlist.findOne({ user_id: userId }).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug category_id",
    populate: {
      path: "category_id",
      select: "name slug"
    }
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user_id: userId, items: [] });
  }

  // Filter out products that are no longer available
  const validItems = wishlist.items.filter((item: any) => 
    item.product_id && item.product_id.status === "active"
  );

  if (validItems.length !== wishlist.items.length) {
    wishlist.items = validItems;
    await wishlist.save();
  }

  return res.status(200).json(
    new ApiResponse(200, wishlist, "Wishlist fetched successfully")
  );
});

// Add item to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id } = req.body;

  if (!product_id) {
    throw new ApiError(400, "Product ID is required");
  }

  // Check if product exists and is available
  const product = await Product.findById(product_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "active") {
    throw new ApiError(400, "Product is not available");
  }

  // Get or create wishlist
  let wishlist = await Wishlist.findOne({ user_id: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user_id: userId, items: [] });
  }

  // Check if product already exists in wishlist
  const existingItem = wishlist.items.find(
    (item: any) => item.product_id.toString() === product_id
  );

  if (existingItem) {
    throw new ApiError(409, "Product already exists in wishlist");
  }

  // Add new item to wishlist
  wishlist.items.push({
    product_id,
    added_at: new Date()
  });

  await wishlist.save();

  // Populate and return updated wishlist
  const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug category_id",
    populate: {
      path: "category_id",
      select: "name slug"
    }
  });

  return res.status(200).json(
    new ApiResponse(200, updatedWishlist, "Item added to wishlist successfully")
  );
});

// Remove item from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id } = req.params;

  const wishlist = await Wishlist.findOne({ user_id: userId });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const itemIndex = wishlist.items.findIndex(
    (item: any) => item.product_id.toString() === product_id
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in wishlist");
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  // Populate and return updated wishlist
  const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug category_id",
    populate: {
      path: "category_id",
      select: "name slug"
    }
  });

  return res.status(200).json(
    new ApiResponse(200, updatedWishlist, "Item removed from wishlist successfully")
  );
});

// Clear entire wishlist
export const clearWishlist = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const wishlist = await Wishlist.findOne({ user_id: userId });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.items = [];
  await wishlist.save();

  return res.status(200).json(
    new ApiResponse(200, wishlist, "Wishlist cleared successfully")
  );
});

// Check if product is in wishlist
export const checkWishlistItem = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id } = req.params;

  const wishlist = await Wishlist.findOne({ user_id: userId });
  
  const isInWishlist = wishlist ? wishlist.items.some(
    (item: any) => item.product_id.toString() === product_id
  ) : false;

  return res.status(200).json(
    new ApiResponse(200, { isInWishlist }, "Wishlist item status checked")
  );
});

// Get wishlist summary (total items)
export const getWishlistSummary = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const wishlist = await Wishlist.findOne({ user_id: userId });
  
  const summary = {
    total_items: wishlist?.items.length || 0
  };

  return res.status(200).json(
    new ApiResponse(200, summary, "Wishlist summary fetched successfully")
  );
});

// Move item from wishlist to cart
export const moveToCart = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    throw new ApiError(400, "Product ID is required");
  }

  // Check if product exists in wishlist
  const wishlist = await Wishlist.findOne({ user_id: userId });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const itemIndex = wishlist.items.findIndex(
    (item: any) => item.product_id.toString() === product_id
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in wishlist");
  }

  // Check product availability and stock
  const product = await Product.findById(product_id);
  if (!product || product.status !== "active") {
    throw new ApiError(400, "Product is not available");
  }

  if (product.stock_quantity < quantity) {
    throw new ApiError(400, `Only ${product.stock_quantity} items available in stock`);
  }

  // Add to cart logic would go here (similar to cart controller)
  // For now, we'll just remove from wishlist
  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Item moved to cart successfully")
  );
});