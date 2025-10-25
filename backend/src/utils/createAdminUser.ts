import { User } from "../models/UserModel";
import { connectDB } from "../db";
import dotenv from "dotenv";

dotenv.config();

const createAdminUser = async () => {
  try {
    await connectDB(process.env.MONGO_URI!);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@shopease.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    await User.create({
      name: "Admin User",
      email: "admin@shopease.com",
      password: "admin123",
      role: "admin",
      isEmailVerified: true // Skip email verification for testing
    });

    console.log("Admin user created successfully:");
    console.log("Email: admin@shopease.com");
    console.log("Password: admin123");
    console.log("Role: admin");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();