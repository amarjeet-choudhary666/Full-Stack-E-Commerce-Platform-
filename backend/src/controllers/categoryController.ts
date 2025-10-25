import { asyncHandler } from "../utils/asyncHandler";
import { Category } from "../models/CategoryModel";
import { Product } from "../models/ProductModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/fileUpload";

// Create category
export const createCategory = asyncHandler(async (req, res) => {
    const { name, parent_id, description, status } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    // Check if parent category exists (if parent_id is provided)
    if (parent_id) {
        const parentCategory = await Category.findById(parent_id);
        if (!parentCategory) {
            throw new ApiError(404, "Parent category not found");
        }
    }

    // Handle image upload
    let imageUrl: string | undefined;
    if ((req as any).file) {
        imageUrl = await uploadToCloudinary((req as any).file.buffer, "categories");
    }

    const category = await Category.create({
        name,
        parent_id: parent_id || null,
        description,
        status: status || "active",
        image: imageUrl
    });

    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

// Get all categories with hierarchy
export const getCategories = asyncHandler(async (req, res) => {
    const { status, includeProducts = false } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    let categories;

    if (includeProducts === "true") {
        // Get categories with product count
        categories = await Category.aggregate([
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
    } else {
        categories = await Category.find(filter).sort({ createdAt: -1 });
    }

    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    categories.forEach((category: any) => {
        categoryMap.set(category._id.toString(), { ...category, children: [] });
    });

    // Second pass: build hierarchy
    categories.forEach((category: any) => {
        if (category.parent_id) {
            const parent = categoryMap.get(category.parent_id.toString());
            if (parent) {
                parent.children.push(categoryMap.get(category._id.toString()));
            }
        } else {
            rootCategories.push(categoryMap.get(category._id.toString()));
        }
    });

    return res.status(200).json(
        new ApiResponse(200, rootCategories, "Categories fetched successfully")
    );
});

// Get single category
export const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        category = await Category.findById(id);
    } else {
        category = await Category.findOne({ slug: id });
    }

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Get subcategories
    const subcategories = await Category.find({ parent_id: category._id });

    // Get product count
    const productCount = await Product.countDocuments({
        category_id: category._id,
        status: "active"
    });

    return res.status(200).json(
        new ApiResponse(200, {
            ...category.toObject(),
            subcategories,
            productCount
        }, "Category fetched successfully")
    );
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Check if parent category exists (if parent_id is provided)
    if (updateData.parent_id && updateData.parent_id !== category.parent_id?.toString()) {
        const parentCategory = await Category.findById(updateData.parent_id);
        if (!parentCategory) {
            throw new ApiError(404, "Parent category not found");
        }

        // Prevent circular reference
        if (updateData.parent_id === id) {
            throw new ApiError(400, "Category cannot be its own parent");
        }
    }

    // Handle image upload
    if ((req as any).file) {
        // Delete old image if exists
        if (category.image) {
            await deleteFromCloudinary(category.image);
        }
        updateData.image = await uploadToCloudinary((req as any).file.buffer, "categories");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedCategory, "Category updated successfully")
    );
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category_id: id });
    if (productCount > 0) {
        throw new ApiError(400, "Cannot delete category with existing products");
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent_id: id });
    if (subcategoryCount > 0) {
        throw new ApiError(400, "Cannot delete category with existing subcategories");
    }

    // Delete image from Cloudinary
    if (category.image) {
        await deleteFromCloudinary(category.image);
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Category deleted successfully")
    );
});

// Get category tree (hierarchical structure)
export const getCategoryTree = asyncHandler(async (_req, res) => {
    const categories = await Category.find({ status: "active" }).sort({ name: 1 });

    const buildTree = (parentId: string | null = null): any[] => {
        return categories
            .filter(cat => {
                if (parentId === null) {
                    return !cat.parent_id;
                }
                return cat.parent_id?.toString() === parentId;
            })
            .map(cat => ({
                ...cat.toObject(),
                children: buildTree((cat._id as any).toString())
            }));
    };

    const tree = buildTree();

    return res.status(200).json(
        new ApiResponse(200, tree, "Category tree fetched successfully")
    );
});

// Get popular categories (based on product count)
export const getPopularCategories = asyncHandler(async (req, res) => {
    const { limit = 6 } = req.query;

    const popularCategories = await Category.aggregate([
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
            $limit: parseInt(limit as string)
        },
        {
            $project: {
                products: 0
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, popularCategories, "Popular categories fetched successfully")
    );
});