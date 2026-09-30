const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.patch("/item/:itemId", protect, updateCartItem);

router.delete("/item/:itemId", protect, removeFromCart);

router.delete("/", protect, clearCart);

module.exports = router;