import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  added_at: Date;
}

export interface ICart extends Document {
  user_id: mongoose.Types.ObjectId;
  items: ICartItem[];
  total_amount: number;
  total_items: number;
}

const cartItemSchema = new Schema<ICartItem>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 },
  added_at: { type: Date, default: Date.now }
});

const cartSchema = new Schema<ICart>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    total_amount: { type: Number, default: 0, min: 0 },
    total_items: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// Calculate totals before saving
cartSchema.pre<ICart>("save", function (next) {
  this.total_items = this.items.reduce((total, item) => total + item.quantity, 0);
  this.total_amount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

// Indexes
cartSchema.index({ user_id: 1 });

export const Cart = mongoose.model<ICart>("Cart", cartSchema);