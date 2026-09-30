const mongoose = require("mongoose");
const Address = require("../models/Address");

// ==============================
// GET ALL USER ADDRESSES
// ==============================
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses.",
    });
  }
};

// ==============================
// GET SINGLE ADDRESS
// ==============================
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Get address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch address.",
    });
  }
};

// ==============================
// ADD ADDRESS
// ==============================
const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      house,
      street,
      landmark,
      city,
      state,
      pinCode,
      addressType,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !house ||
      !street ||
      !city ||
      !state ||
      !pinCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields.",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number.",
      });
    }

    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code.",
      });
    }

    const existingAddress = await Address.findOne({
      user: req.user._id,
    });

    const shouldBeDefault =
      Boolean(isDefault) || !existingAddress;

    if (shouldBeDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      house: house.trim(),
      street: street.trim(),
      landmark: landmark?.trim() || "",
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      addressType: addressType || "Home",
      isDefault: shouldBeDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address,
    });
  } catch (error) {
    console.error("Add address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add address.",
    });
  }
};

// ==============================
// UPDATE ADDRESS
// ==============================
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const {
      fullName,
      phone,
      house,
      street,
      landmark,
      city,
      state,
      pinCode,
      addressType,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !house ||
      !street ||
      !city ||
      !state ||
      !pinCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields.",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number.",
      });
    }

    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code.",
      });
    }

    if (Boolean(isDefault)) {
      await Address.updateMany(
        {
          user: req.user._id,
          _id: { $ne: id },
        },
        { $set: { isDefault: false } }
      );
    }

    address.fullName = fullName.trim();
    address.phone = phone.trim();
    address.house = house.trim();
    address.street = street.trim();
    address.landmark = landmark?.trim() || "";
    address.city = city.trim();
    address.state = state.trim();
    address.pinCode = pinCode.trim();
    address.addressType = addressType || "Home";
    address.isDefault = Boolean(isDefault);

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update address.",
    });
  }
};

// ==============================
// DELETE ADDRESS
// ==============================
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const wasDefault = address.isDefault;

    await address.deleteOne();

    if (wasDefault) {
      const nextAddress = await Address.findOne({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete address.",
    });
  }
};

// ==============================
// SET DEFAULT ADDRESS
// ==============================
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    await Address.updateMany(
      {
        user: req.user._id,
        _id: { $ne: id },
      },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to set default address.",
    });
  }
};

module.exports = {
  getAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};