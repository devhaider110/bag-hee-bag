const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 15,
    },

    house: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    street: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    landmark: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    pinCode: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
    },

    addressType: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", addressSchema);