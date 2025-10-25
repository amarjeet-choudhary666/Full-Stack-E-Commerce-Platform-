"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = exports.deleteFromCloudinary = exports.uploadMultipleToCloudinary = exports.uploadToCloudinary = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Multer configuration for memory storage
const storage = multer_1.default.memoryStorage();
// File filter function
const fileFilter = (_req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
};
// Multer upload configuration
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter,
});
// Upload single image to Cloudinary
const uploadToCloudinary = async (buffer, folder = "ecommerce") => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload_stream({
            folder: folder,
            resource_type: "image",
            transformation: [
                { width: 1000, height: 1000, crop: "limit" },
                { quality: "auto" },
                { format: "webp" }
            ]
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result.secure_url);
            }
        }).end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
// Upload multiple images to Cloudinary
const uploadMultipleToCloudinary = async (files, folder = "ecommerce") => {
    const uploadPromises = files.map(file => (0, exports.uploadToCloudinary)(file.buffer, folder));
    return Promise.all(uploadPromises);
};
exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;
// Delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
    try {
        // Extract public_id from URL
        const urlParts = imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;
        await cloudinary_1.v2.uploader.destroy(fullPublicId);
    }
    catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
// Middleware for single file upload
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
// Middleware for multiple fields
const uploadFields = (fields) => exports.upload.fields(fields);
exports.uploadFields = uploadFields;
//# sourceMappingURL=fileUpload.js.map