const express = require("express");

const {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  updateCustomerVerification,
} = require("../controllers/customerController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CUSTOMER MANAGEMENT - ADMIN ONLY
// ==========================================

// GET ALL CUSTOMERS
router.get("/admin", protect, adminOnly, getAllCustomers);

// GET CUSTOMER DETAILS
router.get("/admin/:id", protect, adminOnly, getCustomerById);

// ACTIVATE / DEACTIVATE CUSTOMER
router.patch("/admin/:id/status", protect, adminOnly, updateCustomerStatus);

// VERIFY / UNVERIFY CUSTOMER
router.patch("/admin/:id/verification", protect, adminOnly, updateCustomerVerification);

module.exports = router;