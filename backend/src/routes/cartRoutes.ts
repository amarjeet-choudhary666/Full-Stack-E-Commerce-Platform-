import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  syncCartPrices
} from "../controllers/cartController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = Router();

// All cart routes require authentication
router.use(authenticateUser);

router.get("/", getCart);
router.get("/summary", getCartSummary);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:product_id", removeFromCart);
router.delete("/clear", clearCart);
router.post("/sync-prices", syncCartPrices);

export default router;