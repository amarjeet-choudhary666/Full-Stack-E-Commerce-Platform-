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
exports.Coupon = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const couponSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    discount_type: { type: String, enum: ["percentage", "fixed"], required: true },
    discount_value: { type: Number, required: true, min: 0 },
    min_purchase_amount: { type: Number, default: 0, min: 0 },
    max_discount_amount: { type: Number, min: 0 },
    usage_limit: { type: Number, default: 1, min: 1 },
    used_count: { type: Number, default: 0, min: 0 },
    user_usage_limit: { type: Number, default: 1, min: 1 },
    applicable_categories: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Category" }],
    applicable_products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product" }],
    start_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive", "expired"], default: "active" },
    created_by: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
// Update status based on dates and usage
couponSchema.pre("save", function (next) {
    const now = new Date();
    if (now > this.expiry_date || this.used_count >= this.usage_limit) {
        this.status = "expired";
    }
    else if (now >= this.start_date && this.status !== "inactive") {
        this.status = "active";
    }
    next();
});
// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ expiry_date: 1 });
exports.Coupon = mongoose_1.default.model("Coupon", couponSchema);
//# sourceMappingURL=CouponModel.js.map