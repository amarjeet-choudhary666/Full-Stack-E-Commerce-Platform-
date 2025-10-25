"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All cart routes require authentication
router.use(authMiddleware_1.authenticateUser);
router.get("/", cartController_1.getCart);
router.get("/summary", cartController_1.getCartSummary);
router.post("/add", cartController_1.addToCart);
router.put("/update", cartController_1.updateCartItem);
router.delete("/remove/:product_id", cartController_1.removeFromCart);
router.delete("/clear", cartController_1.clearCart);
router.post("/sync-prices", cartController_1.syncCartPrices);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map