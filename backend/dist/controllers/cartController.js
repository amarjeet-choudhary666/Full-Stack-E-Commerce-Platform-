"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCartPrices = exports.getCartSummary = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const CartModel_1 = require("../models/CartModel");
const ProductModel_1 = require("../models/ProductModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
// Get user's cart
exports.getCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    let cart = await CartModel_1.Cart.findOne({ user_id: userId }).populate({
        path: "items.product_id",
        select: "name price discount_price images stock_quantity status slug"
    });
    if (!cart) {
        cart = await CartModel_1.Cart.create({ user_id: userId, items: [] });
    }
    // Filter out products that are no longer available
    const validItems = cart.items.filter((item) => item.product_id && item.product_id.status === "active");
    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, cart, "Cart fetched successfully"));
});
// Add item to cart
exports.addToCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) {
        throw new apiError_1.ApiError(400, "Product ID is required");
    }
    if (quantity < 1) {
        throw new apiError_1.ApiError(400, "Quantity must be at least 1");
    }
    // Check if product exists and is available
    const product = await ProductModel_1.Product.findById(product_id);
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    if (product.status !== "active") {
        throw new apiError_1.ApiError(400, "Product is not available");
    }
    if (product.stock_quantity < quantity) {
        throw new apiError_1.ApiError(400, `Only ${product.stock_quantity} items available in stock`);
    }
    // Get or create cart
    let cart = await CartModel_1.Cart.findOne({ user_id: userId });
    if (!cart) {
        cart = await CartModel_1.Cart.create({ user_id: userId, items: [] });
    }
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product_id.toString() === product_id);
    const currentPrice = product.discount_price || product.price;
    if (existingItemIndex > -1) {
        // Update quantity if product already in cart
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock_quantity) {
            throw new apiError_1.ApiError(400, `Cannot add more items. Only ${product.stock_quantity} available in stock`);
        }
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = currentPrice;
    }
    else {
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
    const updatedCart = await CartModel_1.Cart.findById(cart._id).populate({
        path: "items.product_id",
        select: "name price discount_price images stock_quantity status slug"
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedCart, "Item added to cart successfully"));
});
// Update cart item quantity
exports.updateCartItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { product_id, quantity } = req.body;
    if (!product_id || quantity < 1) {
        throw new apiError_1.ApiError(400, "Product ID and valid quantity are required");
    }
    const cart = await CartModel_1.Cart.findOne({ user_id: userId });
    if (!cart) {
        throw new apiError_1.ApiError(404, "Cart not found");
    }
    const itemIndex = cart.items.findIndex((item) => item.product_id.toString() === product_id);
    if (itemIndex === -1) {
        throw new apiError_1.ApiError(404, "Item not found in cart");
    }
    // Check product availability and stock
    const product = await ProductModel_1.Product.findById(product_id);
    if (!product || product.status !== "active") {
        throw new apiError_1.ApiError(400, "Product is not available");
    }
    if (product.stock_quantity < quantity) {
        throw new apiError_1.ApiError(400, `Only ${product.stock_quantity} items available in stock`);
    }
    // Update item
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.discount_price || product.price;
    await cart.save();
    // Populate and return updated cart
    const updatedCart = await CartModel_1.Cart.findById(cart._id).populate({
        path: "items.product_id",
        select: "name price discount_price images stock_quantity status slug"
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedCart, "Cart item updated successfully"));
});
// Remove item from cart
exports.removeFromCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { product_id } = req.params;
    const cart = await CartModel_1.Cart.findOne({ user_id: userId });
    if (!cart) {
        throw new apiError_1.ApiError(404, "Cart not found");
    }
    const itemIndex = cart.items.findIndex((item) => item.product_id.toString() === product_id);
    if (itemIndex === -1) {
        throw new apiError_1.ApiError(404, "Item not found in cart");
    }
    cart.items.splice(itemIndex, 1);
    await cart.save();
    // Populate and return updated cart
    const updatedCart = await CartModel_1.Cart.findById(cart._id).populate({
        path: "items.product_id",
        select: "name price discount_price images stock_quantity status slug"
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedCart, "Item removed from cart successfully"));
});
// Clear entire cart
exports.clearCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const cart = await CartModel_1.Cart.findOne({ user_id: userId });
    if (!cart) {
        throw new apiError_1.ApiError(404, "Cart not found");
    }
    cart.items = [];
    await cart.save();
    return res.status(200).json(new apiResponse_1.ApiResponse(200, cart, "Cart cleared successfully"));
});
// Get cart summary (total items and amount)
exports.getCartSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const cart = await CartModel_1.Cart.findOne({ user_id: userId });
    const summary = {
        total_items: cart?.total_items || 0,
        total_amount: cart?.total_amount || 0,
        items_count: cart?.items.length || 0
    };
    return res.status(200).json(new apiResponse_1.ApiResponse(200, summary, "Cart summary fetched successfully"));
});
// Sync cart prices (update prices based on current product prices)
exports.syncCartPrices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const cart = await CartModel_1.Cart.findOne({ user_id: userId });
    if (!cart || cart.items.length === 0) {
        return res.status(200).json(new apiResponse_1.ApiResponse(200, cart || { items: [] }, "Cart is empty"));
    }
    let updated = false;
    // Update prices for each item
    for (const item of cart.items) {
        const product = await ProductModel_1.Product.findById(item.product_id);
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
    const updatedCart = await CartModel_1.Cart.findById(cart._id).populate({
        path: "items.product_id",
        select: "name price discount_price images stock_quantity status slug"
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedCart, updated ? "Cart prices updated" : "Cart prices are up to date"));
});
//# sourceMappingURL=cartController.js.map