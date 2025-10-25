import { Router } from "express";
import {
  createAddress,
  getUserAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
} from "../controllers/addressController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = Router();

// All address routes require authentication
router.use(authenticateUser);

router.get("/", getUserAddresses);
router.get("/default", getDefaultAddress);
router.get("/:id", getAddress);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.patch("/:id/set-default", setDefaultAddress);

export default router;