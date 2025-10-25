import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  user_usage_limit: number;
  applicable_categories?: mongoose.Types.ObjectId[];
  applicable_products?: mongoose.Types.ObjectId[];
  start_date: Date;
  expiry_date: Date;
  status: "active" | "inactive" | "expired";
  created_by: mongoose.Types.ObjectId;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    discount_type: { type: String, enum: ["percentage", "fixed"], required: true },
    discount_value: { type: Number, required: true, min: 0 },
    min_purchase_amount: { type: Number, default: 0, min: 0 },
    max_discount_amount: { type: Number, min: 0 },
    usage_limit: { type: Number, default: 1, min: 1 },
    used_count: { type: Number, default: 0, min: 0 },
    user_usage_limit: { type: Number, default: 1, min: 1 },
    applicable_categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    applicable_products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    start_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive", "expired"], default: "active" },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// Update status based on dates and usage
couponSchema.pre<ICoupon>("save", function (next) {
  const now = new Date();
  
  if (now > this.expiry_date || this.used_count >= this.usage_limit) {
    this.status = "expired";
  } else if (now >= this.start_date && this.status !== "inactive") {
    this.status = "active";
  }
  
  next();
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ expiry_date: 1 });

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);