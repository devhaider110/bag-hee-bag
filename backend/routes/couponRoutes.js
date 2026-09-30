// const express = require("express");

// const {
//   getCoupons,
//   createCoupon,
//   updateCoupon,
//   toggleCoupon,
//   deleteCoupon,
//   validateCoupon,
// } = require("../controllers/couponController");

// const { protect, adminOnly } = require("../middleware/authMiddleware");

// const router = express.Router();

// // ==========================================
// // CUSTOMER - VALIDATE COUPON
// // ==========================================
// router.post("/validate", protect, validateCoupon);

// // ==========================================
// // ADMIN - GET ALL COUPONS
// // ==========================================
// router.get("/", protect, adminOnly, getCoupons);

// // ==========================================
// // ADMIN - CREATE COUPON
// // ==========================================
// router.post("/", protect, adminOnly, createCoupon);

// // ==========================================
// // ADMIN - UPDATE COUPON
// // ==========================================
// router.put("/:id", protect, adminOnly, updateCoupon);

// // ==========================================
// // ADMIN - TOGGLE COUPON
// // ==========================================
// router.patch("/:id/toggle", protect, adminOnly, toggleCoupon);

// // ==========================================
// // ADMIN - DELETE COUPON
// // ==========================================
// router.delete("/:id", protect, adminOnly, deleteCoupon);

// module.exports = router;

const express = require("express");

const {
  getActiveOffers,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC - ACTIVE OFFERS
// ==========================================
router.get("/active", getActiveOffers);

// ==========================================
// CUSTOMER - VALIDATE COUPON
// ==========================================
router.post(
  "/validate",
  protect,
  validateCoupon
);

// ==========================================
// ADMIN - GET ALL COUPONS
// ==========================================
router.get(
  "/",
  protect,
  adminOnly,
  getCoupons
);

// ==========================================
// ADMIN - CREATE COUPON
// ==========================================
router.post(
  "/",
  protect,
  adminOnly,
  createCoupon
);

// ==========================================
// ADMIN - UPDATE COUPON
// ==========================================
router.put(
  "/:id",
  protect,
  adminOnly,
  updateCoupon
);

// ==========================================
// ADMIN - TOGGLE COUPON
// ==========================================
router.patch(
  "/:id/toggle",
  protect,
  adminOnly,
  toggleCoupon
);

// ==========================================
// ADMIN - DELETE COUPON
// ==========================================
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCoupon
);

module.exports = router;