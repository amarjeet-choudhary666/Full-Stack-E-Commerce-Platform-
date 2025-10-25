"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    product_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    product_name: { type: String, required: true },
    product_image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
});
const addressSubSchema = new mongoose_1.Schema({
    address_line1: { type: String, required: true },
    address_line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    phone: { type: String }
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
}, { timestamps: true });
// Generate order number before saving
orderSchema.pre("save", function (next) {
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
exports.Order = mongoose_1.default.model("Order", orderSchema);
//# sourceMappingURL=OrderModel.js.map