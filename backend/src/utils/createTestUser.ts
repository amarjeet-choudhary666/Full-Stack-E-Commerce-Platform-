import { User } from "../models/UserModel";
import { connectDB } from "../db";
import dotenv from "dotenv";

dotenv.config();

const createTestUser = async () => {
  try {
    await connectDB(process.env.MONGO_URI!);
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("Test user already exists");
      process.exit(0);
    }

    // Create test user
    await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "customer",
      isEmailVerified: true // Skip email verification for testing
    });

    console.log("Test user created successfully:");
    console.log("Email: test@example.com");
    console.log("Password: password123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
};

createTestUser();