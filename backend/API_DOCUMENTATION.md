# E-Commerce Platform API Documentation

Base URL: `http://localhost:8000/v1/api`

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

Or the token will be automatically included via cookies if you're using the same domain.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "statusCode": 200,
  "data": {...},
  "message": "Success message",
  "success": true
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false
}
```

## Authentication Endpoints

### Register User
- **POST** `/users/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
- **POST** `/users/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "rememberMe": false
}
```

### Verify Email
- **GET** `/users/verify-email?token=<verification_token>`

### Logout User
- **POST** `/users/logout`
- **Auth Required:** Yes

### Forgot Password
- **POST** `/users/forgot-password`
- **Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
- **POST** `/users/reset-password?token=<reset_token>`
- **Body:**
```json
{
  "password": "newpassword123"
}
```

### Refresh Token
- **POST** `/users/refresh-token`

### Get Current User
- **GET** `/users/profile`
- **Auth Required:** Yes

## Product Endpoints

### Get All Products
- **GET** `/products`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `category` - Filter by category ID
  - `status` - Filter by status (active, inactive, out_of_stock)
  - `featured` - Filter featured products (true/false)
  - `minPrice` - Minimum price filter
  - `maxPrice` - Maximum price filter
  - `search` - Search in name, description, SKU
  - `sortBy` (default: createdAt)
  - `sortOrder` (default: desc)

### Get Single Product
- **GET** `/products/:id`
- **Parameters:** `id` can be MongoDB ObjectId or product slug

### Get Featured Products
- **GET** `/products/featured`
- **Query Parameters:**
  - `limit` (default: 8)

### Get Products by Category
- **GET** `/products/category/:categoryId`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 12)
  - `sortBy` (default: createdAt)
  - `sortOrder` (default: desc)

### Search Products
- **GET** `/products/search`
- **Query Parameters:**
  - `q` - Search query (required)
  - `page` (default: 1)
  - `limit` (default: 12)

### Create Product (Admin Only)
- **POST** `/products`
- **Auth Required:** Yes (Admin)
- **Content-Type:** `multipart/form-data`
- **Body:**
```json
{
  "name": "Product Name",
  "sku": "PROD001",
  "description": "Product description",
  "price": 999.99,
  "discount_price": 899.99,
  "category_id": "category_object_id",
  "stock_quantity": 100,
  "featured": true,
  "specifications": "{\"color\": \"red\", \"size\": \"large\"}",
  "weight": 1.5,
  "dimensions": "{\"length\": 10, \"width\": 5, \"height\": 3}",
  "tags": "[\"electronics\", \"gadget\"]",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description"
}
```
- **Files:** `images` (up to 5 files)

### Update Product (Admin Only)
- **PUT** `/products/:id`
- **Auth Required:** Yes (Admin)
- **Content-Type:** `multipart/form-data`
- **Body:** Same as create product

### Delete Product (Admin Only)
- **DELETE** `/products/:id`
- **Auth Required:** Yes (Admin)

### Update Product Stock (Admin Only)
- **PATCH** `/products/:id/stock`
- **Auth Required:** Yes (Admin)
- **Body:**
```json
{
  "stock_quantity": 50
}
```

## Category Endpoints

### Get All Categories
- **GET** `/categories`
- **Query Parameters:**
  - `status` - Filter by status (active, inactive)
  - `includeProducts` - Include product count (true/false)

### Get Single Category
- **GET** `/categories/:id`
- **Parameters:** `id` can be MongoDB ObjectId or category slug

### Get Category Tree
- **GET** `/categories/tree`

### Get Popular Categories
- **GET** `/categories/popular`
- **Query Parameters:**
  - `limit` (default: 6)

### Create Category (Admin Only)
- **POST** `/categories`
- **Auth Required:** Yes (Admin)
- **Content-Type:** `multipart/form-data`
- **Body:**
```json
{
  "name": "Category Name",
  "parent_id": "parent_category_id",
  "description": "Category description",
  "status": "active"
}
```
- **Files:** `image` (single file)

### Update Category (Admin Only)
- **PUT** `/categories/:id`
- **Auth Required:** Yes (Admin)
- **Content-Type:** `multipart/form-data`
- **Body:** Same as create category

### Delete Category (Admin Only)
- **DELETE** `/categories/:id`
- **Auth Required:** Yes (Admin)

## Cart Endpoints

### Get User Cart
- **GET** `/cart`
- **Auth Required:** Yes

### Get Cart Summary
- **GET** `/cart/summary`
- **Auth Required:** Yes

### Add Item to Cart
- **POST** `/cart/add`
- **Auth Required:** Yes
- **Body:**
```json
{
  "product_id": "product_object_id",
  "quantity": 2
}
```

### Update Cart Item
- **PUT** `/cart/update`
- **Auth Required:** Yes
- **Body:**
```json
{
  "product_id": "product_object_id",
  "quantity": 3
}
```

### Remove Item from Cart
- **DELETE** `/cart/remove/:product_id`
- **Auth Required:** Yes

### Clear Cart
- **DELETE** `/cart/clear`
- **Auth Required:** Yes

### Sync Cart Prices
- **POST** `/cart/sync-prices`
- **Auth Required:** Yes

## Order Endpoints

### Create Order
- **POST** `/orders`
- **Auth Required:** Yes
- **Body:**
```json
{
  "shipping_address_id": "address_object_id",
  "payment_method": "cod",
  "coupon_code": "DISCOUNT10",
  "notes": "Special delivery instructions"
}
```

### Get User Orders
- **GET** `/orders/my-orders`
- **Auth Required:** Yes
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` - Filter by order status

### Get Single Order
- **GET** `/orders/:id`
- **Auth Required:** Yes

### Cancel Order
- **PATCH** `/orders/:id/cancel`
- **Auth Required:** Yes
- **Body:**
```json
{
  "cancellation_reason": "Changed my mind"
}
```

### Get All Orders (Admin Only)
- **GET** `/orders`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` - Filter by order status
  - `payment_status` - Filter by payment status
  - `payment_method` - Filter by payment method
  - `startDate` - Filter orders from date
  - `endDate` - Filter orders to date
  - `search` - Search in order number, phone

### Update Order Status (Admin Only)
- **PATCH** `/orders/:id/status`
- **Auth Required:** Yes (Admin)
- **Body:**
```json
{
  "status": "shipped",
  "tracking_number": "TRK123456789",
  "notes": "Order shipped via courier"
}
```

### Get Order Statistics (Admin Only)
- **GET** `/orders/stats/overview`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `period` (default: 30) - Number of days

## Address Endpoints

### Get User Addresses
- **GET** `/addresses`
- **Auth Required:** Yes

### Get Default Address
- **GET** `/addresses/default`
- **Auth Required:** Yes

### Get Single Address
- **GET** `/addresses/:id`
- **Auth Required:** Yes

### Create Address
- **POST** `/addresses`
- **Auth Required:** Yes
- **Body:**
```json
{
  "address_line1": "123 Main Street",
  "address_line2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "phone": "9876543210",
  "is_default": true,
  "address_type": "home",
  "landmark": "Near City Mall"
}
```

### Update Address
- **PUT** `/addresses/:id`
- **Auth Required:** Yes
- **Body:** Same as create address

### Delete Address
- **DELETE** `/addresses/:id`
- **Auth Required:** Yes

### Set Default Address
- **PATCH** `/addresses/:id/set-default`
- **Auth Required:** Yes

## Wishlist Endpoints

### Get User Wishlist
- **GET** `/wishlist`
- **Auth Required:** Yes

### Get Wishlist Summary
- **GET** `/wishlist/summary`
- **Auth Required:** Yes

### Check if Product in Wishlist
- **GET** `/wishlist/check/:product_id`
- **Auth Required:** Yes

### Add Item to Wishlist
- **POST** `/wishlist/add`
- **Auth Required:** Yes
- **Body:**
```json
{
  "product_id": "product_object_id"
}
```

### Remove Item from Wishlist
- **DELETE** `/wishlist/remove/:product_id`
- **Auth Required:** Yes

### Clear Wishlist
- **DELETE** `/wishlist/clear`
- **Auth Required:** Yes

### Move Item to Cart
- **POST** `/wishlist/move-to-cart`
- **Auth Required:** Yes
- **Body:**
```json
{
  "product_id": "product_object_id",
  "quantity": 1
}
```

## Review Endpoints

### Get Product Reviews
- **GET** `/reviews/product/:productId`
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `rating` - Filter by rating (1-5)

### Get Review Statistics
- **GET** `/reviews/product/:productId/stats`

### Create Review
- **POST** `/reviews`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Body:**
```json
{
  "product_id": "product_object_id",
  "rating": 5,
  "comment": "Great product!"
}
```
- **Files:** `images` (up to 3 files)

### Get User Reviews
- **GET** `/reviews/my-reviews`
- **Auth Required:** Yes
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)

### Update Review
- **PUT** `/reviews/:id`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Body:**
```json
{
  "rating": 4,
  "comment": "Updated review"
}
```
- **Files:** `images` (up to 3 files)

### Delete Review
- **DELETE** `/reviews/:id`
- **Auth Required:** Yes

### Mark Review as Helpful
- **PATCH** `/reviews/:id/helpful`

### Get All Reviews (Admin Only)
- **GET** `/reviews`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `status` - Filter by status (pending, approved, rejected)
  - `rating` - Filter by rating

### Update Review Status (Admin Only)
- **PATCH** `/reviews/:id/status`
- **Auth Required:** Yes (Admin)
- **Body:**
```json
{
  "status": "approved"
}
```

## Coupon Endpoints

### Get Active Coupons
- **GET** `/coupons/active`
- **Query Parameters:**
  - `limit` (default: 10)

### Validate Coupon
- **POST** `/coupons/validate`
- **Body:**
```json
{
  "code": "DISCOUNT10",
  "cart_total": 1000
}
```

### Apply Coupon
- **POST** `/coupons/apply`
- **Auth Required:** Yes
- **Body:**
```json
{
  "code": "DISCOUNT10"
}
```

### Create Coupon (Admin Only)
- **POST** `/coupons`
- **Auth Required:** Yes (Admin)
- **Body:**
```json
{
  "code": "DISCOUNT10",
  "description": "10% off on all products",
  "discount_type": "percentage",
  "discount_value": 10,
  "min_purchase_amount": 500,
  "max_discount_amount": 100,
  "usage_limit": 100,
  "user_usage_limit": 1,
  "applicable_categories": [],
  "applicable_products": [],
  "start_date": "2024-01-01T00:00:00.000Z",
  "expiry_date": "2024-12-31T23:59:59.000Z"
}
```

### Get All Coupons (Admin Only)
- **GET** `/coupons`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` - Filter by status
  - `search` - Search in code, description

### Get Single Coupon (Admin Only)
- **GET** `/coupons/:id`
- **Auth Required:** Yes (Admin)

### Update Coupon (Admin Only)
- **PUT** `/coupons/:id`
- **Auth Required:** Yes (Admin)
- **Body:** Same as create coupon

### Delete Coupon (Admin Only)
- **DELETE** `/coupons/:id`
- **Auth Required:** Yes (Admin)

## Admin Dashboard Endpoints

### Get Dashboard Overview
- **GET** `/admin/dashboard/overview`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `period` (default: 30) - Number of days

### Get Sales Analytics
- **GET** `/admin/analytics/sales`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `period` (default: 30) - Number of days
  - `groupBy` (default: day) - Group by hour, day, week, month

### Get Top Selling Products
- **GET** `/admin/analytics/top-products`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `limit` (default: 10)
  - `period` (default: 30) - Number of days

### Get Customer Analytics
- **GET** `/admin/analytics/customers`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `period` (default: 30) - Number of days

### Get Inventory Alerts
- **GET** `/admin/inventory/alerts`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `threshold` (default: 10) - Low stock threshold

### Get Order Status Distribution
- **GET** `/admin/orders/status-distribution`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `period` (default: 30) - Number of days

### Get Recent Activities
- **GET** `/admin/activities/recent`
- **Auth Required:** Yes (Admin)
- **Query Parameters:**
  - `limit` (default: 20)

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## File Upload

### Supported Formats
- Images: JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 5MB per file

### Upload Endpoints
- Product images: Up to 5 files per product
- Category images: 1 file per category
- Review images: Up to 3 files per review

All uploaded images are automatically optimized and converted to WebP format via Cloudinary.

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended to add rate limiting in production.

## CORS

CORS is configured to allow requests from `http://localhost:5173` (default Vite dev server).

## Environment Variables

Required environment variables for the API:

```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce_platform
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```