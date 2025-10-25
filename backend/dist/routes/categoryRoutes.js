"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileUpload_1 = require("../utils/fileUpload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", categoryController_1.getCategories);
router.get("/tree", categoryController_1.getCategoryTree);
router.get("/popular", categoryController_1.getPopularCategories);
router.get("/:id", categoryController_1.getCategory);
// Admin only routes
router.post("/", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), (0, fileUpload_1.uploadSingle)("image"), categoryController_1.createCategory);
router.put("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), (0, fileUpload_1.uploadSingle)("image"), categoryController_1.updateCategory);
router.delete("/:id", authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)("admin"), categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map