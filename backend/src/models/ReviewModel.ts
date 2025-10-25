import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  product_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  verified_purchase: boolean;
  helpful_count: number;
  status: "pending" | "approved" | "rejected";
}

const reviewSchema = new Schema<IReview>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    verified_purchase: { type: Boolean, default: false },
    helpful_count: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

// Ensure one review per user per product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });
reviewSchema.index({ product_id: 1, status: 1 });
reviewSchema.index({ user_id: 1 });

export const Review = mongoose.model<IReview>("Review", reviewSchema);