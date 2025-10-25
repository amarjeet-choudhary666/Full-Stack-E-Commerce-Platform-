"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularCategories = exports.getCategoryTree = exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const CategoryModel_1 = require("../models/CategoryModel");
const ProductModel_1 = require("../models/ProductModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const fileUpload_1 = require("../utils/fileUpload");
// Create category
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, parent_id, description, status } = req.body;
    if (!name) {
        throw new apiError_1.ApiError(400, "Category name is required");
    }
    // Check if parent category exists (if parent_id is provided)
    if (parent_id) {
        const parentCategory = await CategoryModel_1.Category.findById(parent_id);
        if (!parentCategory) {
            throw new apiError_1.ApiError(404, "Parent category not found");
        }
    }
    // Handle image upload
    let imageUrl;
    if (req.file) {
        imageUrl = await (0, fileUpload_1.uploadToCloudinary)(req.file.buffer, "categories");
    }
    const category = await CategoryModel_1.Category.create({
        name,
        parent_id: parent_id || null,
        description,
        status: status || "active",
        image: imageUrl
    });
    return res.status(201).json(new apiResponse_1.ApiResponse(201, category, "Category created successfully"));
});
// Get all categories with hierarchy
exports.getCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, includeProducts = false } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    let categories;
    if (includeProducts === "true") {
        // Get categories with product count
        categories = await CategoryModel_1.Category.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category_id",
                    as: "products"
                }
            },
            {
                $addFields: {
                    productCount: { $size: "$products" }
                }
            },
            {
                $project: {
                    products: 0 // Remove the products array, keep only count
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }
    else {
        categories = await CategoryModel_1.Category.find(filter).sort({ createdAt: -1 });
    }
    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories = [];
    // First pass: create map of all categories
    categories.forEach((category) => {
        categoryMap.set(category._id.toString(), { ...category, children: [] });
    });
    // Second pass: build hierarchy
    categories.forEach((category) => {
        if (category.parent_id) {
            const parent = categoryMap.get(category.parent_id.toString());
            if (parent) {
                parent.children.push(categoryMap.get(category._id.toString()));
            }
        }
        else {
            rootCategories.push(categoryMap.get(category._id.toString()));
        }
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, rootCategories, "Categories fetched successfully"));
});
// Get single category
exports.getCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        category = await CategoryModel_1.Category.findById(id);
    }
    else {
        category = await CategoryModel_1.Category.findOne({ slug: id });
    }
    if (!category) {
        throw new apiError_1.ApiError(404, "Category not found");
    }
    // Get subcategories
    const subcategories = await CategoryModel_1.Category.find({ parent_id: category._id });
    // Get product count
    const productCount = await ProductModel_1.Product.countDocuments({
        category_id: category._id,
        status: "active"
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        ...category.toObject(),
        subcategories,
        productCount
    }, "Category fetched successfully"));
});
// Update category
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    const category = await CategoryModel_1.Category.findById(id);
    if (!category) {
        throw new apiError_1.ApiError(404, "Category not found");
    }
    // Check if parent category exists (if parent_id is provided)
    if (updateData.parent_id && updateData.parent_id !== category.parent_id?.toString()) {
        const parentCategory = await CategoryModel_1.Category.findById(updateData.parent_id);
        if (!parentCategory) {
            throw new apiError_1.ApiError(404, "Parent category not found");
        }
        // Prevent circular reference
        if (updateData.parent_id === id) {
            throw new apiError_1.ApiError(400, "Category cannot be its own parent");
        }
    }
    // Handle image upload
    if (req.file) {
        // Delete old image if exists
        if (category.image) {
            await (0, fileUpload_1.deleteFromCloudinary)(category.image);
        }
        updateData.image = await (0, fileUpload_1.uploadToCloudinary)(req.file.buffer, "categories");
    }
    const updatedCategory = await CategoryModel_1.Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedCategory, "Category updated successfully"));
});
// Delete category
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const category = await CategoryModel_1.Category.findById(id);
    if (!category) {
        throw new apiError_1.ApiError(404, "Category not found");
    }
    // Check if category has products
    const productCount = await ProductModel_1.Product.countDocuments({ category_id: id });
    if (productCount > 0) {
        throw new apiError_1.ApiError(400, "Cannot delete category with existing products");
    }
    // Check if category has subcategories
    const subcategoryCount = await CategoryModel_1.Category.countDocuments({ parent_id: id });
    if (subcategoryCount > 0) {
        throw new apiError_1.ApiError(400, "Cannot delete category with existing subcategories");
    }
    // Delete image from Cloudinary
    if (category.image) {
        await (0, fileUpload_1.deleteFromCloudinary)(category.image);
    }
    await CategoryModel_1.Category.findByIdAndDelete(id);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Category deleted successfully"));
});
// Get category tree (hierarchical structure)
exports.getCategoryTree = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const categories = await CategoryModel_1.Category.find({ status: "active" }).sort({ name: 1 });
    const buildTree = (parentId = null) => {
        return categories
            .filter(cat => {
            if (parentId === null) {
                return !cat.parent_id;
            }
            return cat.parent_id?.toString() === parentId;
        })
            .map(cat => ({
            ...cat.toObject(),
            children: buildTree(cat._id.toString())
        }));
    };
    const tree = buildTree();
    return res.status(200).json(new apiResponse_1.ApiResponse(200, tree, "Category tree fetched successfully"));
});
// Get popular categories (based on product count)
exports.getPopularCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 6 } = req.query;
    const popularCategories = await CategoryModel_1.Category.aggregate([
        { $match: { status: "active" } },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category_id",
                as: "products"
            }
        },
        {
            $addFields: {
                productCount: { $size: "$products" }
            }
        },
        {
            $match: {
                productCount: { $gt: 0 }
            }
        },
        {
            $sort: { productCount: -1 }
        },
        {
            $limit: parseInt(limit)
        },
        {
            $project: {
                products: 0
            }
        }
    ]);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, popularCategories, "Popular categories fetched successfully"));
});
//# sourceMappingURL=categoryController.js.map