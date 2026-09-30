const express = require("express");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.post("/", protect, adminOnly, createCategory);

router.put("/:id", protect, adminOnly, updateCategory);

router.delete("/:id", protect, adminOnly, deleteCategory);

router.patch("/:id/toggle-status", protect, adminOnly, toggleCategoryStatus);

module.exports = router;