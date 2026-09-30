const mongoose = require("mongoose");

const ADMIN_PERMISSIONS = [
  "dashboard",
  "products",
  "inventory",
  "orders",
  "customers",
  "returns",
  "refunds",
  "invoices",
  "reports",
  "banners",
  "physical_store",
  "support",
  "security",
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    permissions: {
      type: [
        {
          type: String,
          enum: ADMIN_PERMISSIONS,
        },
      ],
      default: [],
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    sessionVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  role: 1,
  isActive: 1,
});

module.exports = mongoose.model("User", userSchema);

module.exports.ADMIN_PERMISSIONS = ADMIN_PERMISSIONS;