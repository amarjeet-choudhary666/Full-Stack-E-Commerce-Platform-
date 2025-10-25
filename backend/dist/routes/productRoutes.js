"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileUpload_1 = require("../utils/fileUpload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", productController_1.getProducts);
router.get("/featured", productController_1.getFeaturedProducts);
router.get("/search", productController_1.searchProducts);
router.get("/category/:categoryId", productController_1.getProductsByCategory);
router.get("/:id", productController_1.getProduct);
// Admin only routes
router.post("/", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), (0, fileUpload_1.uploadMultiple)("images", 5), productController_1.createProduct);
router.put("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), (0, fileUpload_1.uploadMultiple)("images", 5), productController_1.updateProduct);
router.delete("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), productController_1.deleteProduct);
router.patch("/:id/stock", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), productController_1.updateProductStock);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map