import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  updateProductStock
} from "../controllers/productController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";
import { uploadMultiple } from "../utils/fileUpload";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProduct);

// Admin only routes
router.post("/", 
  authenticateUser, 
  authorizeRoles("admin"), 
  uploadMultiple("images", 5), 
  createProduct
);

router.put("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  uploadMultiple("images", 5), 
  updateProduct
);

router.delete("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  deleteProduct
);

router.patch("/:id/stock", 
  authenticateUser, 
  authorizeRoles("admin"), 
  updateProductStock
);

export default router;