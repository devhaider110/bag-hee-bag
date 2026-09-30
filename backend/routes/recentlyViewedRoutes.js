const express = require("express");

const {
  getRecentlyViewed,
  addRecentlyViewed,
  clearRecentlyViewed,
} = require("../controllers/recentlyViewedController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getRecentlyViewed);

router.post("/", protect, addRecentlyViewed);

router.delete("/", protect, clearRecentlyViewed);

module.exports = router;