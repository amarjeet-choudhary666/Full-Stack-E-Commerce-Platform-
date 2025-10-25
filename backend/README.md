# E-Commerce Platform Backend

A comprehensive e-commerce backend API built with Node.js, Express, TypeScript, and MongoDB.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin, Customer)
- Email verification and password reset
- Session management and auto-logout
- Password hashing with bcrypt

### 👥 User Management
- User registration and login
- Profile management
- Address management
- Account verification

### 📦 Product Management
- CRUD operations for products
- Image upload with Cloudinary
- Product categories and subcategories
- Stock management
- Featured products
- Product search and filtering

### 🛒 Shopping Features
- Shopping cart management
- Wishlist functionality
- Order management with status tracking
- Multiple address support

### 📊 Admin Dashboard
- Sales analytics and reporting
- Order management
- Customer analytics
- Inventory alerts
- Dashboard overview with key metrics

### 🏪 Category Management
- Hierarchical category structure
- Category-based product filtering
- Category image management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Password Hashing**: bcrypt

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── adminController.ts
│   │   ├── addressController.ts
│   │   ├── cartController.ts
│   │   ├── categoryController.ts
│   │   ├── orderController.ts
│   │   ├── productController.ts
│   │   ├── userController.ts
│   │   └── wishlistController.ts
│   ├── middlewares/          # Custom middlewares
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   └── validationMiddleware.ts
│   ├── models/              # Database models
│   │   ├── AddressModel.ts
│   │   ├── CartModel.ts
│   │   ├── CategoryModel.ts
│   │   ├── CouponModel.ts
│   │   ├── OrderModel.ts
│   │   ├── ProductModel.ts
│   │   ├── ReviewModel.ts
│   │   ├── UserModel.ts
│   │   └── WishlistModel.ts
│   ├── routes/              # API routes
│   │   ├── adminRoutes.ts
│   │   ├── addressRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── wishlistRoutes.ts
│   ├── utils/               # Utility functions
│   │   ├── apiError.ts
│   │   ├── apiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── emailService.ts
│   │   ├── fileUpload.ts
│   │   ├── jwt.ts
│   │   └── seedData.ts
│   ├── db/                  # Database configuration
│   │   └── index.ts
│   ├── app.ts              # Express app configuration
│   └── index.ts            # Server entry point
├── dist/                   # Compiled JavaScript files
├── package.json
├── tsconfig.json
├── nodemon.json
└── .env.example
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### 1. Clone and Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
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

### 3. Database Setup
Make sure MongoDB is running, then seed the database with sample data:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:8000`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## API Endpoints

### Authentication
- `POST /v1/api/users/register` - User registration
- `POST /v1/api/users/login` - User login
- `POST /v1/api/users/logout` - User logout
- `GET /v1/api/users/verify-email` - Email verification
- `POST /v1/api/users/forgot-password` - Forgot password
- `POST /v1/api/users/reset-password` - Reset password
- `POST /v1/api/users/refresh-token` - Refresh access token

### Products
- `GET /v1/api/products` - Get all products (with filters)
- `GET /v1/api/products/:id` - Get single product
- `POST /v1/api/products` - Create product (Admin)
- `PUT /v1/api/products/:id` - Update product (Admin)
- `DELETE /v1/api/products/:id` - Delete product (Admin)
- `GET /v1/api/products/featured` - Get featured products
- `GET /v1/api/products/search` - Search products

### Categories
- `GET /v1/api/categories` - Get all categories
- `GET /v1/api/categories/:id` - Get single category
- `POST /v1/api/categories` - Create category (Admin)
- `PUT /v1/api/categories/:id` - Update category (Admin)
- `DELETE /v1/api/categories/:id` - Delete category (Admin)

### Cart
- `GET /v1/api/cart` - Get user cart
- `POST /v1/api/cart/add` - Add item to cart
- `PUT /v1/api/cart/update` - Update cart item
- `DELETE /v1/api/cart/remove/:product_id` - Remove item from cart
- `DELETE /v1/api/cart/clear` - Clear cart

### Orders
- `POST /v1/api/orders` - Create order
- `GET /v1/api/orders/my-orders` - Get user orders
- `GET /v1/api/orders/:id` - Get single order
- `PATCH /v1/api/orders/:id/cancel` - Cancel order
- `GET /v1/api/orders` - Get all orders (Admin)
- `PATCH /v1/api/orders/:id/status` - Update order status (Admin)

### Addresses
- `GET /v1/api/addresses` - Get user addresses
- `POST /v1/api/addresses` - Create address
- `PUT /v1/api/addresses/:id` - Update address
- `DELETE /v1/api/addresses/:id` - Delete address
- `PATCH /v1/api/addresses/:id/set-default` - Set default address

### Wishlist
- `GET /v1/api/wishlist` - Get user wishlist
- `POST /v1/api/wishlist/add` - Add item to wishlist
- `DELETE /v1/api/wishlist/remove/:product_id` - Remove from wishlist

### Admin Dashboard
- `GET /v1/api/admin/dashboard/overview` - Dashboard overview
- `GET /v1/api/admin/analytics/sales` - Sales analytics
- `GET /v1/api/admin/analytics/customers` - Customer analytics
- `GET /v1/api/admin/inventory/alerts` - Inventory alerts

## Database Models

### User
- Authentication and profile information
- Role-based access (admin/customer)
- Email verification and password reset tokens

### Product
- Product details with images
- Stock management
- Category association
- SEO fields

### Category
- Hierarchical structure
- Image support
- Status management

### Order
- Complete order information
- Order items with product details
- Shipping and billing addresses
- Payment and status tracking

### Cart & Wishlist
- User-specific cart and wishlist items
- Automatic total calculations

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- CORS configuration
- Error handling middleware

## File Upload

Images are uploaded to Cloudinary with automatic optimization:
- Automatic format conversion to WebP
- Image compression
- Size limits (5MB max)
- Multiple image support for products

## Error Handling

Comprehensive error handling with:
- Custom ApiError class
- MongoDB error handling
- Validation error formatting
- Development vs production error responses

## Sample Data

The seed script creates:
- 5 sample users (1 admin, 4 customers)
- 5 product categories
- 20+ sample products
- Various order statuses

## Environment Variables

Required environment variables:
- `MONGO_URI` - MongoDB connection string
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password
- `CLOUDINARY_*` - Cloudinary configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.