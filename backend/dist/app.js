"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express_1.default.json({ limit: "16kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use((0, cookie_parser_1.default)());
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
app.use("/v1/api/users", userRoutes_1.default);
app.use("/v1/api/products", productRoutes_1.default);
app.use("/v1/api/categories", categoryRoutes_1.default);
app.use("/v1/api/cart", cartRoutes_1.default);
app.use("/v1/api/orders", orderRoutes_1.default);
app.use("/v1/api/addresses", addressRoutes_1.default);
app.use("/v1/api/wishlist", wishlistRoutes_1.default);
app.use("/v1/api/admin", adminRoutes_1.default);
app.use("/v1/api/reviews", reviewRoutes_1.default);
app.use("/v1/api/coupons", couponRoutes_1.default);
// Error handling middleware
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
//# sourceMappingURL=app.js.map