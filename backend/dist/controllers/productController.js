"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductStock = exports.searchProducts = exports.getProductsByCategory = exports.getFeaturedProducts = exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ProductModel_1 = require("../models/ProductModel");
const CategoryModel_1 = require("../models/CategoryModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const fileUpload_1 = require("../utils/fileUpload");
// Create product
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, sku, description, price, discount_price, category_id, stock_quantity, featured, specifications, weight, dimensions, tags, meta_title, meta_description } = req.body;
    // Validate required fields
    if (!name || !sku || !description || !price || !category_id || stock_quantity === undefined) {
        throw new apiError_1.ApiError(400, "All required fields must be provided");
    }
    // Check if category exists
    const category = await CategoryModel_1.Category.findById(category_id);
    if (!category) {
        throw new apiError_1.ApiError(404, "Category not found");
    }
    // Check if SKU already exists
    const existingSku = await ProductModel_1.Product.findOne({ sku });
    if (existingSku) {
        throw new apiError_1.ApiError(409, "Product with this SKU already exists");
    }
    // Handle image uploads
    let imageUrls = [];
    if (req.files && Array.isArray(req.files)) {
        imageUrls = await (0, fileUpload_1.uploadMultipleToCloudinary)(req.files, "products");
    }
    const product = await ProductModel_1.Product.create({
        name,
        sku,
        description,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : undefined,
        category_id,
        stock_quantity: parseInt(stock_quantity),
        images: imageUrls,
        featured: featured === "true",
        specifications: specifications ? JSON.parse(specifications) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        dimensions: dimensions ? JSON.parse(dimensions) : undefined,
        tags: tags ? JSON.parse(tags) : undefined,
        meta_title,
        meta_description
    });
    const populatedProduct = await ProductModel_1.Product.findById(product._id).populate("category_id", "name slug");
    return res.status(201).json(new apiResponse_1.ApiResponse(201, populatedProduct, "Product created successfully"));
});
// Get all products with filters and pagination
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page = 1, limit = 10, category, status, featured, minPrice, maxPrice, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    // Build filter object
    const filter = {};
    if (category)
        filter.category_id = category;
    if (status)
        filter.status = status;
    if (featured !== undefined)
        filter.featured = featured === "true";
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = parseFloat(minPrice);
        if (maxPrice)
            filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } }
        ];
    }
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
        ProductModel_1.Product.find(filter)
            .populate("category_id", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        ProductModel_1.Product.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        products,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalProducts: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "Products fetched successfully"));
});
// Get single product by ID or slug
exports.getProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // If it's a valid ObjectId, search by ID
        product = await ProductModel_1.Product.findById(id).populate("category_id", "name slug");
    }
    else {
        // Otherwise, search by slug
        product = await ProductModel_1.Product.findOne({ slug: id }).populate("category_id", "name slug");
    }
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, product, "Product fetched successfully"));
});
// Update product
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    const product = await ProductModel_1.Product.findById(id);
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    // Handle image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Delete old images from Cloudinary
        if (product.images && product.images.length > 0) {
            await Promise.all(product.images.map(imageUrl => (0, fileUpload_1.deleteFromCloudinary)(imageUrl)));
        }
        // Upload new images
        updateData.images = await (0, fileUpload_1.uploadMultipleToCloudinary)(req.files, "products");
    }
    // Parse JSON fields if they exist
    if (updateData.specifications) {
        updateData.specifications = JSON.parse(updateData.specifications);
    }
    if (updateData.dimensions) {
        updateData.dimensions = JSON.parse(updateData.dimensions);
    }
    if (updateData.tags) {
        updateData.tags = JSON.parse(updateData.tags);
    }
    // Convert string values to appropriate types
    if (updateData.price)
        updateData.price = parseFloat(updateData.price);
    if (updateData.discount_price)
        updateData.discount_price = parseFloat(updateData.discount_price);
    if (updateData.stock_quantity !== undefined)
        updateData.stock_quantity = parseInt(updateData.stock_quantity);
    if (updateData.weight)
        updateData.weight = parseFloat(updateData.weight);
    if (updateData.featured !== undefined)
        updateData.featured = updateData.featured === "true";
    const updatedProduct = await ProductModel_1.Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).populate("category_id", "name slug");
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedProduct, "Product updated successfully"));
});
// Delete product
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const product = await ProductModel_1.Product.findById(id);
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
        await Promise.all(product.images.map(imageUrl => (0, fileUpload_1.deleteFromCloudinary)(imageUrl)));
    }
    await ProductModel_1.Product.findByIdAndDelete(id);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Product deleted successfully"));
});
// Get featured products
exports.getFeaturedProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 8 } = req.query;
    const products = await ProductModel_1.Product.find({
        featured: true,
        status: "active"
    })
        .populate("category_id", "name slug")
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, products, "Featured products fetched successfully"));
});
// Get products by category
exports.getProductsByCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const category = await CategoryModel_1.Category.findById(categoryId);
    if (!category) {
        throw new apiError_1.ApiError(404, "Category not found");
    }
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
        ProductModel_1.Product.find({ category_id: categoryId, status: "active" })
            .populate("category_id", "name slug")
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
        ProductModel_1.Product.countDocuments({ category_id: categoryId, status: "active" })
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        products,
        category,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalProducts: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "Products fetched successfully"));
});
// Search products
exports.searchProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) {
        throw new apiError_1.ApiError(400, "Search query is required");
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const searchFilter = {
        $and: [
            { status: "active" },
            {
                $or: [
                    { name: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i" } },
                    { sku: { $regex: q, $options: "i" } }
                ]
            }
        ]
    };
    const [products, total] = await Promise.all([
        ProductModel_1.Product.find(searchFilter)
            .populate("category_id", "name slug")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 }),
        ProductModel_1.Product.countDocuments(searchFilter)
    ]);
    const totalPages = Math.ceil(total / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        products,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalProducts: total,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "Search results fetched successfully"));
});
// Update product stock
exports.updateProductStock = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    if (stock_quantity === undefined || stock_quantity < 0) {
        throw new apiError_1.ApiError(400, "Valid stock quantity is required");
    }
    const product = await ProductModel_1.Product.findByIdAndUpdate(id, { stock_quantity: parseInt(stock_quantity) }, { new: true, runValidators: true }).populate("category_id", "name slug");
    if (!product) {
        throw new apiError_1.ApiError(404, "Product not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, product, "Product stock updated successfully"));
});
//# sourceMappingURL=productController.js.map