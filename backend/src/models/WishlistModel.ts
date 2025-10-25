import mongoose, { Schema, Document } from "mongoose";

export interface IWishlistItem {
  product_id: mongoose.Types.ObjectId;
  added_at: Date;
}

export interface IWishlist extends Document {
  user_id: mongoose.Types.ObjectId;
  items: IWishlistItem[];
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  added_at: { type: Date, default: Date.now }
});

const wishlistSchema = new Schema<IWishlist>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [wishlistItemSchema]
  },
  { timestamps: true }
);

// Index for better performance (removed unique constraint to avoid conflicts)
wishlistSchema.index({ user_id: 1 });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);