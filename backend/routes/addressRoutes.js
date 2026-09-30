const express = require("express");

const {
  getAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAddresses);

router.get("/:id", protect, getAddressById);

router.post("/", protect, addAddress);

router.put("/:id", protect, updateAddress);

router.patch("/:id/default", protect, setDefaultAddress);

router.delete("/:id", protect, deleteAddress);

module.exports = router;