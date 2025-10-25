import { asyncHandler } from "../utils/asyncHandler";
import { Address } from "../models/AddressModel";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

// Create address
export const createAddress = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;
  const {
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    country = "India",
    phone,
    is_default = false,
    address_type = "home",
    landmark
  } = req.body;

  if (!address_line1 || !city || !state || !pincode) {
    throw new ApiError(400, "Address line 1, city, state, and pincode are required");
  }

  const address = await Address.create({
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

  return res.status(201).json(
    new ApiResponse(201, address, "Address created successfully")
  );
});

// Get user's addresses
export const getUserAddresses = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const addresses = await Address.find({ user_id: userId }).sort({ 
    is_default: -1, 
    createdAt: -1 
  });

  return res.status(200).json(
    new ApiResponse(200, addresses, "Addresses fetched successfully")
  );
});

// Get single address
export const getAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const address = await Address.findOne({ _id: id, user_id: userId });
  
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return res.status(200).json(
    new ApiResponse(200, address, "Address fetched successfully")
  );
});

// Update address
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user._id;
  const updateData = req.body;

  const address = await Address.findOne({ _id: id, user_id: userId });
  
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  const updatedAddress = await Address.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedAddress, "Address updated successfully")
  );
});

// Delete address
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const address = await Address.findOne({ _id: id, user_id: userId });
  
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // If deleting default address, make another address default
  if (address.is_default) {
    const otherAddress = await Address.findOne({ 
      user_id: userId, 
      _id: { $ne: id } 
    });
    
    if (otherAddress) {
      otherAddress.is_default = true;
      await otherAddress.save();
    }
  }

  await Address.findByIdAndDelete(id);

  return res.status(200).json(
    new ApiResponse(200, {}, "Address deleted successfully")
  );
});

// Set default address
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user._id;

  const address = await Address.findOne({ _id: id, user_id: userId });
  
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Remove default from all other addresses
  await Address.updateMany(
    { user_id: userId, _id: { $ne: id } },
    { is_default: false }
  );

  // Set this address as default
  address.is_default = true;
  await address.save();

  return res.status(200).json(
    new ApiResponse(200, address, "Default address updated successfully")
  );
});

// Get default address
export const getDefaultAddress = asyncHandler(async (req, res) => {
  const userId = (req as any).user._id;

  const defaultAddress = await Address.findOne({ 
    user_id: userId, 
    is_default: true 
  });

  if (!defaultAddress) {
    // If no default address, get the first address
    const firstAddress = await Address.findOne({ user_id: userId });
    
    if (firstAddress) {
      firstAddress.is_default = true;
      await firstAddress.save();
      
      return res.status(200).json(
        new ApiResponse(200, firstAddress, "Default address fetched successfully")
      );
    }
    
    throw new ApiError(404, "No addresses found");
  }

  return res.status(200).json(
    new ApiResponse(200, defaultAddress, "Default address fetched successfully")
  );
});