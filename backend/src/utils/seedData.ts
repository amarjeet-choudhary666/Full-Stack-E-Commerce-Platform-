import { User } from "../models/UserModel";
import { Category } from "../models/CategoryModel";
import { Product } from "../models/ProductModel";
import { connectDB } from "../db";
import dotenv from "dotenv";

dotenv.config();

const sampleCategories = [
  {
    name: "Electronics",
    description: "Electronic devices and gadgets",
    status: "active"
  },
  {
    name: "Clothing",
    description: "Fashion and apparel",
    status: "active"
  },
  {
    name: "Home & Garden",
    description: "Home improvement and garden supplies",
    status: "active"
  },
  {
    name: "Books",
    description: "Books and educational materials",
    status: "active"
  },
  {
    name: "Sports & Fitness",
    description: "Sports equipment and fitness gear",
    status: "active"
  }
];

const sampleProducts = [
  {
    name: "Smartphone Pro Max",
    sku: "SPM001",
    description: "Latest smartphone with advanced features",
    price: 79999,
    discount_price: 74999,
    stock_quantity: 50,
    featured: true,
    images: ["https://via.placeholder.com/400x400/007bff/ffffff?text=Phone"],
    specifications: {
      "Display": "6.7 inch OLED",
      "Storage": "256GB",
      "RAM": "8GB",
      "Camera": "108MP Triple Camera"
    }
  },
  {
    name: "Wireless Headphones",
    sku: "WH001",
    description: "Premium wireless headphones with noise cancellation",
    price: 15999,
    discount_price: 12999,
    stock_quantity: 100,
    featured: true,
    images: ["https://via.placeholder.com/400x400/28a745/ffffff?text=Headphones"]
  },
  {
    name: "Cotton T-Shirt",
    sku: "CTS001",
    description: "Comfortable cotton t-shirt for daily wear",
    price: 799,
    stock_quantity: 200,
    featured: false,
    images: ["https://via.placeholder.com/400x400/dc3545/ffffff?text=T-Shirt"]
  },
  {
    name: "Laptop Backpack",
    sku: "LB001",
    description: "Durable laptop backpack with multiple compartments",
    price: 2499,
    discount_price: 1999,
    stock_quantity: 75,
    featured: false,
    images: ["https://via.placeholder.com/400x400/ffc107/000000?text=Backpack"]
  },
  {
    name: "Fitness Tracker",
    sku: "FT001",
    description: "Smart fitness tracker with heart rate monitor",
    price: 4999,
    discount_price: 3999,
    stock_quantity: 80,
    featured: true,
    images: ["https://via.placeholder.com/400x400/17a2b8/ffffff?text=Tracker"]
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@ecommerce.com",
    password: "admin123",
    role: "admin",
    isEmailVerified: true
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "customer",
    isEmailVerified: true
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "customer",
    isEmailVerified: true
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "password123",
    role: "customer",
    isEmailVerified: true
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "password123",
    role: "customer",
    isEmailVerified: true
  }
];

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Create users
    const users = await User.create(sampleUsers);
    console.log(`👥 Created ${users.length} users`);

    // Create categories
    const categories = await Category.create(sampleCategories);
    console.log(`📂 Created ${categories.length} categories`);

    // Create products with category references
    const productsWithCategories = sampleProducts.map((product, index) => ({
      ...product,
      category_id: categories[index % categories.length]._id
    }));

    const products = await Product.create(productsWithCategories);
    console.log(`📦 Created ${products.length} products`);

    console.log("✅ Database seeding completed successfully!");
    
    return {
      users: users.length,
      categories: categories.length,
      products: products.length
    };

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  connectDB(process.env.MONGO_URI!)
    .then(() => seedDatabase())
    .then((result) => {
      console.log("Seeding result:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}