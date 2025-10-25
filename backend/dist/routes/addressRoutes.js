"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const addressController_1 = require("../controllers/addressController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// All address routes require authentication
router.use(authMiddleware_1.authenticateUser);
router.get("/", addressController_1.getUserAddresses);
router.get("/default", addressController_1.getDefaultAddress);
router.get("/:id", addressController_1.getAddress);
router.post("/", addressController_1.createAddress);
router.put("/:id", addressController_1.updateAddress);
router.delete("/:id", addressController_1.deleteAddress);
router.patch("/:id/set-default", addressController_1.setDefaultAddress);
exports.default = router;
//# sourceMappingURL=addressRoutes.js.map