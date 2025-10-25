"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlistController_1 = require("../controllers/wishlistController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All wishlist routes require authentication
router.use(authMiddleware_1.authenticateUser);
router.get("/", wishlistController_1.getWishlist);
router.get("/summary", wishlistController_1.getWishlistSummary);
router.get("/check/:product_id", wishlistController_1.checkWishlistItem);
router.post("/add", wishlistController_1.addToWishlist);
router.delete("/remove/:product_id", wishlistController_1.removeFromWishlist);
router.delete("/clear", wishlistController_1.clearWishlist);
router.post("/move-to-cart", wishlistController_1.moveToCart);
exports.default = router;
//# sourceMappingURL=wishlistRoutes.js.map