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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount_price: { type: Number, min: 0 },
    category_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    stock_quantity: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    status: {
        type: String,
        enum: ["active", "inactive", "out_of_stock"],
        default: "active"
    },
    featured: { type: Boolean, default: false },
    specifications: { type: mongoose_1.Schema.Types.Mixed },
    weight: { type: Number },
    dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number }
    },
    tags: [{ type: String }],
    meta_title: { type: String },
    meta_description: { type: String }
}, { timestamps: true });
// Generate slug before saving
productSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
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
exports.Product = mongoose_1.default.model("Product", productSchema);
//# sourceMappingURL=ProductModel.js.map