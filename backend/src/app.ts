import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());


import userRoutes from "./routes/userRoutes"
import productRoutes from "./routes/productRoutes"
import categoryRoutes from "./routes/categoryRoutes"
import cartRoutes from "./routes/cartRoutes"
import orderRoutes from "./routes/orderRoutes"
import addressRoutes from "./routes/addressRoutes"
import wishlistRoutes from "./routes/wishlistRoutes"
import adminRoutes from "./routes/adminRoutes"
import reviewRoutes from "./routes/reviewRoutes"
import couponRoutes from "./routes/couponRoutes"

app.use("/v1/api/users", userRoutes)
app.use("/v1/api/products", productRoutes)
app.use("/v1/api/categories", categoryRoutes)
app.use("/v1/api/cart", cartRoutes)
app.use("/v1/api/orders", orderRoutes)
app.use("/v1/api/addresses", addressRoutes)
app.use("/v1/api/wishlist", wishlistRoutes)
app.use("/v1/api/admin", adminRoutes)
app.use("/v1/api/reviews", reviewRoutes)
app.use("/v1/api/coupons", couponRoutes)

// Error handling middleware
import { notFound, errorHandler } from "./middlewares/errorMiddleware";
app.use(notFound);
app.use(errorHandler);

export { app };
