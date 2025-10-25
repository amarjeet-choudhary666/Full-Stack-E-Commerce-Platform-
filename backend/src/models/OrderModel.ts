import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product_id: mongoose.Types.ObjectId;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder extends Document {
  user_id: mongoose.Types.ObjectId;
  order_number: string;
  items: IOrderItem[];
  total_amount: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  final_amount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  payment_method: "cod" | "online" | "wallet";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_id?: string;
  shipping_address: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone?: string;
  };
  billing_address?: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone?: string;
  };
  coupon_code?: string;
  tracking_number?: string;
  estimated_delivery?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  notes?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  product_name: { type: String, required: true },
  product_image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
});

const addressSubSchema = new Schema({
  address_line1: { type: String, required: true },
  address_line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  phone: { type: String }
}, { _id: false });

const orderSchema = new Schema<IOrder>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order_number: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    total_amount: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    shipping_amount: { type: Number, default: 0, min: 0 },
    tax_amount: { type: Number, default: 0, min: 0 },
    final_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending"
    },
    payment_method: {
      type: String,
      enum: ["cod", "online", "wallet"],
      required: true
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    payment_id: { type: String },
    shipping_address: { type: addressSubSchema, required: true },
    billing_address: { type: addressSubSchema },
    coupon_code: { type: String },
    tracking_number: { type: String },
    estimated_delivery: { type: Date },
    delivered_at: { type: Date },
    cancelled_at: { type: Date },
    cancellation_reason: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre<IOrder>("save", function (next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.order_number = `ORD${timestamp}${random}`;
  }
  next();
});

// Indexes
orderSchema.index({ user_id: 1 });
orderSchema.index({ order_number: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);