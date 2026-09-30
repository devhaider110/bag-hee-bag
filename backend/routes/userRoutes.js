const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

const router =
  express.Router();

router.get(
  "/me",
  protect,
  getMe
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

module.exports = router;