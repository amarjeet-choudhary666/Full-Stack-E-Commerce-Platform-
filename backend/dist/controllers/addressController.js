"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultAddress = exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.getAddress = exports.getUserAddresses = exports.createAddress = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const AddressModel_1 = require("../models/AddressModel");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
// Create address
exports.createAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { address_line1, address_line2, city, state, pincode, country = "India", phone, is_default = false, address_type = "home", landmark } = req.body;
    if (!address_line1 || !city || !state || !pincode) {
        throw new apiError_1.ApiError(400, "Address line 1, city, state, and pincode are required");
    }
    const address = await AddressModel_1.Address.create({
        user_id: userId,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        country,
        phone,
        is_default,
        address_type,
        landmark
    });
    return res.status(201).json(new apiResponse_1.ApiResponse(201, address, "Address created successfully"));
});
// Get user's addresses
exports.getUserAddresses = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const addresses = await AddressModel_1.Address.find({ user_id: userId }).sort({
        is_default: -1,
        createdAt: -1
    });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, addresses, "Addresses fetched successfully"));
});
// Get single address
exports.getAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const address = await AddressModel_1.Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new apiError_1.ApiError(404, "Address not found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, address, "Address fetched successfully"));
});
// Update address
exports.updateAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;
    const address = await AddressModel_1.Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new apiError_1.ApiError(404, "Address not found");
    }
    const updatedAddress = await AddressModel_1.Address.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, updatedAddress, "Address updated successfully"));
});
// Delete address
exports.deleteAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const address = await AddressModel_1.Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new apiError_1.ApiError(404, "Address not found");
    }
    // If deleting default address, make another address default
    if (address.is_default) {
        const otherAddress = await AddressModel_1.Address.findOne({
            user_id: userId,
            _id: { $ne: id }
        });
        if (otherAddress) {
            otherAddress.is_default = true;
            await otherAddress.save();
        }
    }
    await AddressModel_1.Address.findByIdAndDelete(id);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Address deleted successfully"));
});
// Set default address
exports.setDefaultAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const address = await AddressModel_1.Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new apiError_1.ApiError(404, "Address not found");
    }
    // Remove default from all other addresses
    await AddressModel_1.Address.updateMany({ user_id: userId, _id: { $ne: id } }, { is_default: false });
    // Set this address as default
    address.is_default = true;
    await address.save();
    return res.status(200).json(new apiResponse_1.ApiResponse(200, address, "Default address updated successfully"));
});
// Get default address
exports.getDefaultAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const defaultAddress = await AddressModel_1.Address.findOne({
        user_id: userId,
        is_default: true
    });
    if (!defaultAddress) {
        // If no default address, get the first address
        const firstAddress = await AddressModel_1.Address.findOne({ user_id: userId });
        if (firstAddress) {
            firstAddress.is_default = true;
            await firstAddress.save();
            return res.status(200).json(new apiResponse_1.ApiResponse(200, firstAddress, "Default address fetched successfully"));
        }
        throw new apiError_1.ApiError(404, "No addresses found");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, defaultAddress, "Default address fetched successfully"));
});
//# sourceMappingURL=addressController.js.map