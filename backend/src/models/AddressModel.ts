import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user_id: mongoose.Types.ObjectId;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: "home" | "work" | "other";
  landmark?: string;
}

const addressSchema = new Schema<IAddress>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address_line1: { type: String, required: true, trim: true },
    address_line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
    phone: { type: String, trim: true },
    is_default: { type: Boolean, default: false },
    address_type: { type: String, enum: ["home", "work", "other"], default: "home" },
    landmark: { type: String, trim: true }
  },
  { timestamps: true }
);

// Ensure only one default address per user
addressSchema.pre<IAddress>("save", async function (next) {
  if (this.is_default) {
    await mongoose.model("Address").updateMany(
      { user_id: this.user_id, _id: { $ne: this._id } },
      { is_default: false }
    );
  }
  next();
});

// Indexes
addressSchema.index({ user_id: 1 });
addressSchema.index({ user_id: 1, is_default: 1 });

export const Address = mongoose.model<IAddress>("Address", addressSchema);