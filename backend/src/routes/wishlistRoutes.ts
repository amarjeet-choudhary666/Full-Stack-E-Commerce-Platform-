import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistItem,
  getWishlistSummary,
  moveToCart
} from "../controllers/wishlistController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = Router();

// All wishlist routes require authentication
router.use(authenticateUser);

router.get("/", getWishlist);
router.get("/summary", getWishlistSummary);
router.get("/check/:product_id", checkWishlistItem);
router.post("/add", addToWishlist);
router.delete("/remove/:product_id", removeFromWishlist);
router.delete("/clear", clearWishlist);
router.post("/move-to-cart", moveToCart);

export default router;