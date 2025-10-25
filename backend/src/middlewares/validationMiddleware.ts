import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

// Handle validation errors
export const handleValidationErrors = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ApiError(400, "Validation failed", errorMessages);
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  handleValidationErrors
];

export const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors
];

// Product validation rules
export const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),
  body("sku")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("SKU must be between 3 and 50 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("stock_quantity")
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),
  body("category_id")
    .isMongoId()
    .withMessage("Please provide a valid category ID"),
  handleValidationErrors
];

// Category validation rules
export const validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("parent_id")
    .optional()
    .isMongoId()
    .withMessage("Parent ID must be a valid MongoDB ObjectId"),
  handleValidationErrors
];

// Address validation rules
export const validateAddress = [
  body("address_line1")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address line 1 must be between 5 and 200 characters"),
  body("city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("pincode")
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Please provide a valid 6-digit pincode"),
  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please provide a valid 10-digit mobile number"),
  handleValidationErrors
];

// Order validation rules
export const validateOrder = [
  body("shipping_address_id")
    .isMongoId()
    .withMessage("Please provide a valid shipping address ID"),
  body("payment_method")
    .isIn(["cod", "online", "wallet"])
    .withMessage("Payment method must be cod, online, or wallet"),
  handleValidationErrors
];

// Cart validation rules
export const validateCartItem = [
  body("product_id")
    .isMongoId()
    .withMessage("Please provide a valid product ID"),
  body("quantity")
    .isInt({ min: 1, max: 10 })
    .withMessage("Quantity must be between 1 and 10"),
  handleValidationErrors
];