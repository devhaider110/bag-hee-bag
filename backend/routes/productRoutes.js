const express = require("express");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,

  uploadProductVideo,
  deleteProductVideo,
  setPrimaryVideo,

  addVariant,
  updateVariant,
  deleteVariant,
} = require("../controllers/productController");

const upload = require("../middleware/upload");

const router = express.Router();

// ==========================================
// PRODUCTS
// ==========================================

router.get(
  "/",
  getProducts
);

router.get(
  "/:id",
  getProductById
);

router.post(
  "/",
  createProduct
);

router.put(
  "/:id",
  updateProduct
);

router.delete(
  "/:id",
  deleteProduct
);

// ==========================================
// PRODUCT IMAGES
// ==========================================

router.post(
  "/:id/images",
  upload.single("image"),
  uploadProductImage
);

router.delete(
  "/:id/images/:imageId",
  deleteProductImage
);

router.patch(
  "/:id/images/:imageId/primary",
  setPrimaryImage
);

// ==========================================
// PRODUCT VIDEOS
// ==========================================

router.post(
  "/:id/videos",
  upload.single("video"),
  uploadProductVideo
);

router.delete(
  "/:id/videos/:videoId",
  deleteProductVideo
);

router.patch(
  "/:id/videos/:videoId/primary",
  setPrimaryVideo
);

// ==========================================
// PRODUCT VARIANTS
// ==========================================
// Variant APIs remain here.
// UI will be moved to ProductForm.

router.post(
  "/:id/variants",
  addVariant
);

router.put(
  "/:id/variants/:variantId",
  updateVariant
);

router.delete(
  "/:id/variants/:variantId",
  deleteVariant
);

module.exports = router;