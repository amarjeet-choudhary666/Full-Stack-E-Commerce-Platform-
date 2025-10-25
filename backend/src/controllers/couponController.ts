import { asyncHandler } from "../utils/asyncHandler";
import { Coupon } from "../models/CouponModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

// Create coupon (Admin only)
export const createCoupon = asyncHandler(async (req, res) => {
  const adminId = (req as any).user._id;
  const {
    code,
    description,
    discount_type,
    discount_value,
    min_purchase_amount,
    max_discount_amount,
    usage_limit,
    user_usage_limit,
    applicable_categories,
    applicable_products,
    start_date,
    expiry_date
  } = req.body;

  if (!code || !description || !discount_type || !discount_value || !start_date || !expiry_date) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (discount_type === "percentage" && (discount_value < 1 || discount_value > 100)) {
    throw new ApiError(400, "Percentage discount must be between 1 and 100");
  }

  if (new Date(start_date) >= new Date(expiry_date)) {
    throw new ApiError(400, "Start date must be before expiry date");
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(409, "Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discount_type,
    discount_value,
    min_purchase_amount: min_purchase_amount || 0,
    max_discount_amount,
    usage_limit: usage_limit || 1,
    user_usage_limit: user_usage_limit || 1,
    applicable_categories: applicable_categories || [],
    applicable_products: applicable_products || [],
    start_date: new Date(start_date),
    expiry_date: new Date(expiry_date),
    created_by: adminId
  });

  return res.status(201).json(
    new ApiResponse(201, coupon, "Coupon created successfully")
  );
});

// Get all coupons (Admin only)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;

  const filter: any = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate("created_by", "name email")
      .populate("applicable_categories", "name")
      .populate("applicable_products", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Coupon.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      coupons,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCoupons: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "Coupons fetched successfully")
  );
});

// Get single coupon (Admin only)
export const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id)
    .populate("created_by", "name email")
    .populate("applicable_categories", "name")
    .populate("applicable_products", "name");

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res.status(200).json(
    new ApiResponse(200, coupon, "Coupon fetched successfully")
  );
});

// Update coupon (Admin only)
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  // Validate dates if provided
  if (updateData.start_date && updateData.expiry_date) {
    if (new Date(updateData.start_date) >= new Date(updateData.expiry_date)) {
      throw new ApiError(400, "Start date must be before expiry date");
    }
  }

  // Validate percentage discount
  if (updateData.discount_type === "percentage" && updateData.discount_value) {
    if (updateData.discount_value < 1 || updateData.discount_value > 100) {
      throw new ApiError(400, "Percentage discount must be between 1 and 100");
    }
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("created_by", "name email")
   .populate("applicable_categories", "name")
   .populate("applicable_products", "name");

  return res.status(200).json(
    new ApiResponse(200, updatedCoupon, "Coupon updated successfully")
  );
});

// Delete coupon (Admin only)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await Coupon.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Coupon deleted successfully")
  );
});

// Validate coupon code (Public)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cart_total } = req.body;

  if (!code || cart_total === undefined) {
    throw new ApiError(400, "Coupon code and cart total are required");
  }

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    status: "active"
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  const now = new Date();
  
  // Check if coupon is expired
  if (now < coupon.start_date || now > coupon.expiry_date) {
    throw new ApiError(400, "Coupon has expired or is not yet active");
  }

  // Check usage limit
  if (coupon.used_count >= coupon.usage_limit) {
    throw new ApiError(400, "Coupon usage limit exceeded");
  }

  // Check minimum purchase amount
  if (cart_total < coupon.min_purchase_amount) {
    throw new ApiError(400, `Minimum purchase amount of ₹${coupon.min_purchase_amount} required`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === "percentage") {
    discountAmount = (cart_total * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
  } else {
    discountAmount = coupon.discount_value;
  }

  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cart_total);

  return res.status(200).json(
    new ApiResponse(200, {
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      },
      discount_amount: Math.round(discountAmount),
      final_amount: cart_total - Math.round(discountAmount)
    }, "Coupon is valid")
  );
});

// Apply coupon (used during order creation)
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    status: "active"
  });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  // Increment usage count
  coupon.used_count += 1;
  await coupon.save();

  return res.status(200).json(
    new ApiResponse(200, { coupon_applied: true }, "Coupon applied successfully")
  );
});

// Get active coupons for customers
export const getActiveCoupons = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const now = new Date();
  const coupons = await Coupon.find({
    status: "active",
    start_date: { $lte: now },
    expiry_date: { $gte: now },
    $expr: { $lt: ["$used_count", "$usage_limit"] }
  })
    .select("code description discount_type discount_value min_purchase_amount expiry_date")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit as string));

  return res.status(200).json(
    new ApiResponse(200, coupons, "Active coupons fetched successfully")
  );
});