import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: mongoose.Types.ObjectId;
  stock_quantity: number;
  images: string[];
  status: "active" | "inactive" | "out_of_stock";
  featured: boolean;
  specifications?: Record<string, any>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount_price: { type: Number, min: 0 },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock_quantity: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    status: { 
      type: String, 
      enum: ["active", "inactive", "out_of_stock"], 
      default: "active" 
    },
    featured: { type: Boolean, default: false },
    specifications: { type: Schema.Types.Mixed },
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    tags: [{ type: String }],
    meta_title: { type: String },
    meta_description: { type: String }
  },
  { timestamps: true }
);

// Generate slug before saving
productSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Auto-update status based on stock
  if (this.stock_quantity === 0 && this.status === "active") {
    this.status = "out_of_stock";
  }
  
  next();
});

// Indexes for better performance
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category_id: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model<IProduct>("Product", productSchema);