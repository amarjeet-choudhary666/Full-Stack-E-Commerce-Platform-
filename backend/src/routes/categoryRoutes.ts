import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getPopularCategories
} from "../controllers/categoryController";
import { authenticateUser, authorizeRoles } from "../middlewares/authMiddleware";
import { uploadSingle } from "../utils/fileUpload";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/tree", getCategoryTree);
router.get("/popular", getPopularCategories);
router.get("/:id", getCategory);

// Admin only routes
router.post("/", 
  authenticateUser, 
  authorizeRoles("admin"), 
  uploadSingle("image"), 
  createCategory
);

router.put("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  uploadSingle("image"), 
  updateCategory
);

router.delete("/:id", 
  authenticateUser, 
  authorizeRoles("admin"), 
  deleteCategory
);

export default router;