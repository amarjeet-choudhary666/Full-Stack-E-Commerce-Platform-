"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.getAllOrders = exports.cancelOrder = exports.updateOrderStatus = exports.getOrder = exports.getUserOrders = exports.createOrder = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const OrderModel_1 = require("../models/OrderModel");
const CartModel_1 = require("../models/CartModel");
const ProductModel_1 = require("../models/ProductModel");
const AddressModel_1 = require("../models/AddressModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
// Create order from cart
exports.createOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { shipping_address_id, payment_method, coupon_code, notes } = req.body;
    if (!shipping_address_id || !payment_method) {
        throw new apiError_1.ApiError(400, "Shipping address and payment method are required");
    }
    // Get user's cart
    const cart = await CartModel_1.Cart.findOne({ user_id: userId }).populate("items.product_id");
    if (!cart || cart.items.length === 0) {
        throw new apiError_1.ApiError(400, "Cart is empty");
    }
    // Get shipping address
    const shippingAddress = await AddressModel_1.Address.findOne({
        _id: shipping_address_id,
        user_id: userId
    });
    if (!shippingAddress) {
        throw new apiError_1.ApiError(404, "Shipping address not found");
    }
    // Validate cart items and check stock
    const orderItems = [];
    let totalAmount = 0;
    for (const cartItem of cart.items) {
        const product = cartItem.product_id;
        if (!product || product.status !== "active") {
            throw new apiError_1.ApiError(400, `Product ${product?.name || 'Unknown'} is not available`);
        }
        if (product.stock_quantity < cartItem.quantity) {
            throw new apiError_1.ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
        }
        const currentPrice = product.discount_price || product.price;
        const subtotal = currentPrice * cartItem.quantity;
        orderItems.push({
            product_id: product._id,
            product_name: product.name,
            product_image: product.images[0] || "",
            quantity: cartItem.quantity,
            price: currentPrice,
            subtotal: subtotal
        });
        totalAmount += subtotal;
    }
    // Calculate shipping and tax (simplified calculation)
    const shippingAmount = totalAmount > 500 ? 0 : 50; // Free shipping above ₹500
    const taxAmount = Math.round(totalAmount * 0.18); // 18% GST
    const discountAmount = 0; // TODO: Apply coupon discount
    const finalAmount = totalAmount + shippingAmount + taxAmount - discountAmount;
    // Create order
    const order = await OrderModel_1.Order.create({
        user_id: userId,
        items: orderItems,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        final_amount: finalAmount,
        payment_method,
        shipping_address: {
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            country: shippingAddress.country,
            phone: shippingAddress.phone
        },
        coupon_code,
        notes
    });
    // Update product stock
    for (const item of orderItems) {
        await ProductModel_1.Product.findByIdAndUpdate(item.product_id, { $inc: { stock_quantity: -item.quantity } });
    }
    // Clear cart
    cart.items = [];
    await cart.save();
    // Populate order details
    const populatedOrder = await OrderModel_1.Order.findById(order._id).populate("user_id", "name email");
    return res.status(201).json(new apiResponse_1.ApiResponse(201, populatedOrder, "Order created successfully"));
});
// Get user's orders
exports.getUserOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user_id: userId };
    if (status)
        filter.status = status;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([
        OrderModel_1.Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        OrderModel_1.Order.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        orders,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalOrders: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "Orders fetched successfully"));
});
// Get single order
exports.getOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    let filter = { _id: id };
    // Non-admin users can only see their own orders
    if (userRole !== "admin") {
        filter.user_id = userId;
    }
    const order = await OrderModel_1.Order.findOne(filter).populate("user_id", "name email");
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, order, "Order fetched successfully"));
});
// Update order status (Admin only)
exports.updateOrderStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status, tracking_number, notes } = req.body;
    if (!status) {
        throw new apiError_1.ApiError(400, "Status is required");
    }
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
        throw new apiError_1.ApiError(400, "Invalid status");
    }
    const updateData = { status };
    if (tracking_number)
        updateData.tracking_number = tracking_number;
    if (notes)
        updateData.notes = notes;
    // Set delivery date if status is delivered
    if (status === "delivered") {
        updateData.delivered_at = new Date();
    }
    const order = await OrderModel_1.Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("user_id", "name email");
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, order, "Order status updated successfully"));
});
// Cancel order
exports.cancelOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    let filter = { _id: id };
    // Non-admin users can only cancel their own orders
    if (userRole !== "admin") {
        filter.user_id = userId;
    }
    const order = await OrderModel_1.Order.findOne(filter);
    if (!order) {
        throw new apiError_1.ApiError(404, "Order not found");
    }
    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
        throw new apiError_1.ApiError(400, "Order cannot be cancelled at this stage");
    }
    // Restore product stock
    for (const item of order.items) {
        await ProductModel_1.Product.findByIdAndUpdate(item.product_id, { $inc: { stock_quantity: item.quantity } });
    }
    // Update order
    order.status = "cancelled";
    order.cancelled_at = new Date();
    order.cancellation_reason = cancellation_reason || "Cancelled by user";
    await order.save();
    return res.status(200).json(new apiResponse_1.ApiResponse(200, order, "Order cancelled successfully"));
});
// Get all orders (Admin only)
exports.getAllOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, status, payment_status, payment_method, startDate, endDate, search } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    if (payment_status)
        filter.payment_status = payment_status;
    if (payment_method)
        filter.payment_method = payment_method;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate)
            filter.createdAt.$gte = new Date(startDate);
        if (endDate)
            filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
        filter.$or = [
            { order_number: { $regex: search, $options: "i" } },
            { "shipping_address.phone": { $regex: search, $options: "i" } }
        ];
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [orders, total] = await Promise.all([
        OrderModel_1.Order.find(filter)
            .populate("user_id", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        OrderModel_1.Order.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        orders,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalOrders: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "Orders fetched successfully"));
});
// Get order statistics (Admin only)
exports.getOrderStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { period = "30" } = req.query; // days
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const stats = await OrderModel_1.Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$final_amount" },
                averageOrderValue: { $avg: "$final_amount" },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                },
                confirmedOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
                },
                shippedOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] }
                },
                deliveredOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
                },
                cancelledOrders: {
                    $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                }
            }
        }
    ]);
    const result = stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
    };
    return res.status(200).json(new apiResponse_1.ApiResponse(200, result, "Order statistics fetched successfully"));
});
//# sourceMappingURL=orderController.js.map