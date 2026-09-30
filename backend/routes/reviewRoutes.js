const express = require("express");

const {
  createReview,
  getProductReviews,
  getMyProductReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
  adminDeleteReview,
} = require("../controllers/reviewController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// Get approved reviews for a product
router.get(
  "/product/:productId",
  getProductReviews
);


/*
|--------------------------------------------------------------------------
| CUSTOMER ROUTES
|--------------------------------------------------------------------------
*/

// Create a review
router.post(
  "/",
  protect,
  createReview
);

// Get logged-in user's reviews
router.get(
  "/my",
  protect,
  getMyReviews
);

// Get logged-in user's review for one product
router.get(
  "/product/:productId/my",
  protect,
  getMyProductReview
);

// Update own review
router.patch(
  "/:id",
  protect,
  updateReview
);

// Delete own review
router.delete(
  "/:id",
  protect,
  deleteReview
);


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

// Get all reviews
router.get(
  "/admin",
  protect,
  adminOnly,
  getAllReviews
);

// Update review status
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateReviewStatus
);

// Delete review as admin
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  adminDeleteReview
);

module.exports = router;