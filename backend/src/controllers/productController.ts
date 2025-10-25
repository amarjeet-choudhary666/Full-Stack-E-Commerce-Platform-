import { asyncHandler } from "../utils/asyncHandler";
import { Product } from "../models/ProductModel";
import { Category } from "../models/CategoryModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { uploadMultipleToCloudinary, deleteFromCloudinary } from "../utils/fileUpload";

// Create product
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    description,
    price,
    discount_price,
    category_id,
    stock_quantity,
    featured,
    specifications,
    weight,
    dimensions,
    tags,
    meta_title,
    meta_description
  } = req.body;

  // Validate required fields
  if (!name || !sku || !description || !price || !category_id || stock_quantity === undefined) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Check if category exists
  const category = await Category.findById(category_id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if SKU already exists
  const existingSku = await Product.findOne({ sku });
  if (existingSku) {
    throw new ApiError(409, "Product with this SKU already exists");
  }

  // Handle image uploads
  let imageUrls: string[] = [];
  if ((req as any).files && Array.isArray((req as any).files)) {
    imageUrls = await uploadMultipleToCloudinary((req as any).files, "products");
  }

  const product = await Product.create({
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

  const populatedProduct = await Product.findById(product._id).populate("category_id", "name slug");

  return res.status(201).json(
    new ApiResponse(201, populatedProduct, "Product created successfully")
  );
});

// Get all products with filters and pagination
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    featured,
    minPrice,
    maxPrice,
    search,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  // Build filter object
  const filter: any = {};
  
  if (category) filter.category_id = category;
  if (status) filter.status = status;
  if (featured !== undefined) filter.featured = featured === "true";
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } }
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category_id", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "Products fetched successfully")
  );
});

// Get single product by ID or slug
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  let product;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    // If it's a valid ObjectId, search by ID
    product = await Product.findById(id).populate("category_id", "name slug");
  } else {
    // Otherwise, search by slug
    product = await Product.findOne({ slug: id }).populate("category_id", "name slug");
  }

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(200, product, "Product fetched successfully")
  );
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Handle image uploads
  if ((req as any).files && Array.isArray((req as any).files) && (req as any).files.length > 0) {
    // Delete old images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(imageUrl => deleteFromCloudinary(imageUrl))
      );
    }
    
    // Upload new images
    updateData.images = await uploadMultipleToCloudinary((req as any).files, "products");
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
  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.discount_price) updateData.discount_price = parseFloat(updateData.discount_price);
  if (updateData.stock_quantity !== undefined) updateData.stock_quantity = parseInt(updateData.stock_quantity);
  if (updateData.weight) updateData.weight = parseFloat(updateData.weight);
  if (updateData.featured !== undefined) updateData.featured = updateData.featured === "true";

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate("category_id", "name slug");

  return res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    await Promise.all(
      product.images.map(imageUrl => deleteFromCloudinary(imageUrl))
    );
  }

  await Product.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Product deleted successfully")
  );
});

// Get featured products
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ 
    featured: true, 
    status: "active" 
  })
    .populate("category_id", "name slug")
    .limit(parseInt(limit as string))
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, products, "Featured products fetched successfully")
  );
});

// Get products by category
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 12, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const sort: any = {};
  sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({ category_id: categoryId, status: "active" })
      .populate("category_id", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments({ category_id: categoryId, status: "active" })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      category,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "Products fetched successfully")
  );
});

// Search products
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q) {
    throw new ApiError(400, "Search query is required");
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
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
    Product.find(searchFilter)
      .populate("category_id", "name slug")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Product.countDocuments(searchFilter)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "Search results fetched successfully")
  );
});

// Update product stock
export const updateProductStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stock_quantity } = req.body;

  if (stock_quantity === undefined || stock_quantity < 0) {
    throw new ApiError(400, "Valid stock quantity is required");
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { stock_quantity: parseInt(stock_quantity) },
    { new: true, runValidators: true }
  ).populate("category_id", "name slug");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(200, product, "Product stock updated successfully")
  );
});