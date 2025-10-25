import { asyncHandler } from "../utils/asyncHandler";
import { Cart } from "../models/CartModel";
import { Product } from "../models/ProductModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  let cart = await Cart.findOne({ user_id: userId }).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug"
  });

  if (!cart) {
    cart = await Cart.create({ user_id: userId, items: [] });
  }

  // Filter out products that are no longer available
  const validItems = cart.items.filter((item: any) => 
    item.product_id && item.product_id.status === "active"
  );

  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart fetched successfully")
  );
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    throw new ApiError(400, "Product ID is required");
  }

  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // Check if product exists and is available
  const product = await Product.findById(product_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "active") {
    throw new ApiError(400, "Product is not available");
  }

  if (product.stock_quantity < quantity) {
    throw new ApiError(400, `Only ${product.stock_quantity} items available in stock`);
  }

  // Get or create cart
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId, items: [] });
  }

  // Check if product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item: any) => item.product_id.toString() === product_id
  );

  const currentPrice = product.discount_price || product.price;

  if (existingItemIndex > -1) {
    // Update quantity if product already in cart
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (newQuantity > product.stock_quantity) {
      throw new ApiError(400, `Cannot add more items. Only ${product.stock_quantity} available in stock`);
    }

    cart.items[existingItemIndex].quantity = newQuantity;
    cart.items[existingItemIndex].price = currentPrice;
  } else {
    // Add new item to cart
    cart.items.push({
      product_id,
      quantity,
      price: currentPrice,
      added_at: new Date()
    });
  }

  await cart.save();

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug"
  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Item added to cart successfully")
  );
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id, quantity } = req.body;

  if (!product_id || quantity < 1) {
    throw new ApiError(400, "Product ID and valid quantity are required");
  }

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item: any) => item.product_id.toString() === product_id
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Check product availability and stock
  const product = await Product.findById(product_id);
  if (!product || product.status !== "active") {
    throw new ApiError(400, "Product is not available");
  }

  if (product.stock_quantity < quantity) {
    throw new ApiError(400, `Only ${product.stock_quantity} items available in stock`);
  }

  // Update item
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].price = product.discount_price || product.price;

  await cart.save();

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug"
  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Cart item updated successfully")
  );
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const { product_id } = req.params;

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item: any) => item.product_id.toString() === product_id
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Item not found in cart");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug"
  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Item removed from cart successfully")
  );
});

// Clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  await cart.save();

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart cleared successfully")
  );
});

// Get cart summary (total items and amount)
export const getCartSummary = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const cart = await Cart.findOne({ user_id: userId });
  
  const summary = {
    total_items: cart?.total_items || 0,
    total_amount: cart?.total_amount || 0,
    items_count: cart?.items.length || 0
  };

  return res.status(200).json(
    new ApiResponse(200, summary, "Cart summary fetched successfully")
  );
});

// Sync cart prices (update prices based on current product prices)
export const syncCartPrices = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart || cart.items.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, cart || { items: [] }, "Cart is empty")
    );
  }

  let updated = false;

  // Update prices for each item
  for (const item of cart.items) {
    const product = await Product.findById(item.product_id);
    if (product && product.status === "active") {
      const currentPrice = product.discount_price || product.price;
      if (item.price !== currentPrice) {
        item.price = currentPrice;
        updated = true;
      }
    }
  }

  if (updated) {
    await cart.save();
  }

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product_id",
    select: "name price discount_price images stock_quantity status slug"
  });

  return res.status(200).json(
    new ApiResponse(200, updatedCart, updated ? "Cart prices updated" : "Cart prices are up to date")
  );
});