import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent_id?: mongoose.Types.ObjectId;
  image?: string;
  status: "active" | "inactive";
  description?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    parent_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

// Generate slug before saving
categorySchema.pre<ICategory>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Index for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent_id: 1 });
categorySchema.index({ status: 1 });

export const Category = mongoose.model<ICategory>("Category", categorySchema);