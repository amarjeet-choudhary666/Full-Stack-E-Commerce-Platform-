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
exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    parent_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", default: null },
    image: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    description: { type: String, trim: true }
}, { timestamps: true });
// Generate slug before saving
categorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = (0, slugify_1.default)(this.name, { lower: true, strict: true });
    }
    next();
});
// Index for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent_id: 1 });
categorySchema.index({ status: 1 });
exports.Category = mongoose_1.default.model("Category", categorySchema);
//# sourceMappingURL=CategoryModel.js.map