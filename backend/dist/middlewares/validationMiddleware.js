"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCartItem = exports.validateOrder = exports.validateAddress = exports.validateCategory = exports.validateProduct = exports.validateUserLogin = exports.validateUserRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const apiError_1 = require("../utils/apiError");
// Handle validation errors
const handleValidationErrors = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        throw new apiError_1.ApiError(400, "Validation failed", errorMessages);
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// User validation rules
exports.validateUserRegistration = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    exports.handleValidationErrors
];
exports.validateUserLogin = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required"),
    exports.handleValidationErrors
];
// Product validation rules
exports.validateProduct = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage("Product name must be between 2 and 200 characters"),
    (0, express_validator_1.body)("sku")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("SKU must be between 3 and 50 characters"),
    (0, express_validator_1.body)("description")
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("stock_quantity")
        .isInt({ min: 0 })
        .withMessage("Stock quantity must be a non-negative integer"),
    (0, express_validator_1.body)("category_id")
        .isMongoId()
        .withMessage("Please provide a valid category ID"),
    exports.handleValidationErrors
];
// Category validation rules
exports.validateCategory = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters"),
    (0, express_validator_1.body)("parent_id")
        .optional()
        .isMongoId()
        .withMessage("Parent ID must be a valid MongoDB ObjectId"),
    exports.handleValidationErrors
];
// Address validation rules
exports.validateAddress = [
    (0, express_validator_1.body)("address_line1")
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Address line 1 must be between 5 and 200 characters"),
    (0, express_validator_1.body)("city")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("City must be between 2 and 50 characters"),
    (0, express_validator_1.body)("state")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("State must be between 2 and 50 characters"),
    (0, express_validator_1.body)("pincode")
        .trim()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Please provide a valid 6-digit pincode"),
    (0, express_validator_1.body)("phone")
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Please provide a valid 10-digit mobile number"),
    exports.handleValidationErrors
];
// Order validation rules
exports.validateOrder = [
    (0, express_validator_1.body)("shipping_address_id")
        .isMongoId()
        .withMessage("Please provide a valid shipping address ID"),
    (0, express_validator_1.body)("payment_method")
        .isIn(["cod", "online", "wallet"])
        .withMessage("Payment method must be cod, online, or wallet"),
    exports.handleValidationErrors
];
// Cart validation rules
exports.validateCartItem = [
    (0, express_validator_1.body)("product_id")
        .isMongoId()
        .withMessage("Please provide a valid product ID"),
    (0, express_validator_1.body)("quantity")
        .isInt({ min: 1, max: 10 })
        .withMessage("Quantity must be between 1 and 10"),
    exports.handleValidationErrors
];
//# sourceMappingURL=validationMiddleware.js.map