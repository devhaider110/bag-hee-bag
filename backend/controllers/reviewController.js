const mongoose = require("mongoose");

const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// =====================================================
// HELPERS
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeRating = (rating) => {
  const value = Number(rating);

  if (!Number.isFinite(value)) {
    return null;
  }

  if (value < 1 || value > 5) {
    return null;
  }

  return Math.round(value);
};

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// =====================================================
// CHECK WHETHER USER PURCHASED PRODUCT
// =====================================================

const findEligibleOrder = async (
  userId,
  productId,
  orderId = null
) => {
  const query = {
    user: userId,
  };

  if (orderId) {
    query._id = orderId;
  }

  const orders = await Order.find(query)
    .select("_id user orderStatus paymentStatus items")
    .lean();

  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];

    const matchedItem = items.find((item) => {
      const itemProduct =
        item.product || item.productId || item.product?._id;

      if (!itemProduct) {
        return false;
      }

      return String(itemProduct) === String(productId);
    });

    if (!matchedItem) {
      continue;
    }

    if (order.orderStatus === "DELIVERED") {
      return order;
    }

    if (
      order.paymentStatus === "PAID" &&
      [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ].includes(order.orderStatus)
    ) {
      return order;
    }
  }

  return null;
};

// =====================================================
// CUSTOMER - CREATE REVIEW
// =====================================================

const createReview = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const { productId, orderId, rating, title, comment } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required.",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        message: "Review comment is required.",
      });
    }

    const normalizedRating = normalizeRating(rating);

    if (!normalizedRating) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const eligibleOrder = await findEligibleOrder(
      userId,
      productId,
      orderId || null
    );

    if (!eligibleOrder) {
      return res.status(403).json({
        message:
          "You can review this product only after purchasing it.",
      });
    }

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
      order: eligibleOrder._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message:
          "You have already reviewed this product for this order.",
        review: existingReview,
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      order: eligibleOrder._id,
      rating: normalizedRating,
      title: String(title || "").trim(),
      comment: String(comment).trim(),
      isVerifiedPurchase: true,
      status: "APPROVED",
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name username avatar profileImage")
      .populate("product", "name sku sellingPrice images")
      .lean();

    return res.status(201).json({
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already reviewed this product for this order.",
      });
    }

    return res.status(500).json({
      message: "Unable to create review.",
    });
  }
};

// =====================================================
// CUSTOMER - GET PRODUCT REVIEWS
// =====================================================

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const filter = {
      product: productId,
      status: "APPROVED",
    };

    const [reviews, totalReviews, stats] = await Promise.all([
      Review.find(filter)
        .populate("user", "name username avatar profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Review.countDocuments(filter),

      Review.aggregate([
        {
          $match: {
            product: new mongoose.Types.ObjectId(productId),
            status: "APPROVED",
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            total: { $sum: 1 },
            five: {
              $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
            },
            four: {
              $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
            },
            three: {
              $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
            },
            two: {
              $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
            },
            one: {
              $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const rawStats = stats[0] || {
      averageRating: 0,
      total: 0,
      five: 0,
      four: 0,
      three: 0,
      two: 0,
      one: 0,
    };

    const averageRating = Number(rawStats.averageRating || 0);

    return res.status(200).json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
      },
      stats: {
        averageRating: Math.round(averageRating * 10) / 10,
        total: rawStats.total || 0,
        distribution: {
          5: rawStats.five || 0,
          4: rawStats.four || 0,
          3: rawStats.three || 0,
          2: rawStats.two || 0,
          1: rawStats.one || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error);

    return res.status(500).json({
      message: "Unable to load product reviews.",
    });
  }
};

// =====================================================
// CUSTOMER - GET MY REVIEW FOR PRODUCT
// =====================================================

const getMyProductReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const review = await Review.findOne({
      user: userId,
      product: productId,
    })
      .sort({ createdAt: -1 })
      .populate("product", "name sku sellingPrice images")
      .lean();

    return res.status(200).json({
      review: review || null,
    });
  } catch (error) {
    console.error("Get my product review error:", error);

    return res.status(500).json({
      message: "Unable to load your review.",
    });
  }
};

// =====================================================
// CUSTOMER - GET MY REVIEWS
// =====================================================

const getMyReviews = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const reviews = await Review.find({ user: userId })
      .populate("product", "name sku sellingPrice images")
      .populate("order", "_id orderStatus createdAt totalAmount")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get my reviews error:", error);

    return res.status(500).json({
      message: "Unable to load your reviews.",
    });
  }
};

// =====================================================
// CUSTOMER - UPDATE REVIEW
// =====================================================

const updateReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOne({
      _id: id,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    if (review.status === "REJECTED") {
      return res.status(400).json({
        message: "Rejected reviews cannot be edited.",
      });
    }

    if (rating !== undefined && rating !== null) {
      const normalizedRating = normalizeRating(rating);

      if (!normalizedRating) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5.",
        });
      }

      review.rating = normalizedRating;
    }

    if (title !== undefined) {
      review.title = String(title || "").trim();
    }

    if (comment !== undefined) {
      const cleanComment = String(comment || "").trim();

      if (!cleanComment) {
        return res.status(400).json({
          message: "Review comment cannot be empty.",
        });
      }

      review.comment = cleanComment;
    }

    review.status = "APPROVED";
    review.adminNote = "";

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name username avatar profileImage")
      .populate("product", "name sku sellingPrice images")
      .lean();

    return res.status(200).json({
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      message: "Unable to update review.",
    });
  }
};

// =====================================================
// CUSTOMER - DELETE REVIEW
// =====================================================

const deleteReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      message: "Unable to delete review.",
    });
  }
};

// =====================================================
// ADMIN - GET ALL REVIEWS
// =====================================================

const getAllReviews = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      rating = "",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const filter = {};

    if (
      status &&
      ["PENDING", "APPROVED", "REJECTED"].includes(status)
    ) {
      filter.status = status;
    }

    if (rating) {
      const ratingNumber = Number(rating);

      if (
        Number.isInteger(ratingNumber) &&
        ratingNumber >= 1 &&
        ratingNumber <= 5
      ) {
        filter.rating = ratingNumber;
      }
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      const [matchingProducts, matchingUsers] = await Promise.all([
        Product.find({
          $or: [{ name: regex }, { sku: regex }],
        }).select("_id"),

        mongoose
          .model("User")
          .find({
            $or: [
              { name: regex },
              { username: regex },
              { email: regex },
            ],
          })
          .select("_id"),
      ]);

      filter.$or = [
        { comment: regex },
        { title: regex },
        {
          product: {
            $in: matchingProducts.map((item) => item._id),
          },
        },
        {
          user: {
            $in: matchingUsers.map((item) => item._id),
          },
        },
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate(
          "user",
          "name username email phone avatar profileImage"
        )
        .populate("product", "name sku sellingPrice images")
        .populate(
          "order",
          "_id orderStatus paymentStatus totalAmount"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      reviews,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      message: "Unable to load reviews.",
    });
  }
};

// =====================================================
// ADMIN - UPDATE REVIEW STATUS
// =====================================================

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid review status.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    review.status = status;

    if (adminNote !== undefined) {
      review.adminNote = String(adminNote || "").trim();
    }

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate(
        "user",
        "name username email avatar profileImage"
      )
      .populate("product", "name sku sellingPrice images")
      .lean();

    return res.status(200).json({
      message: "Review status updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review status error:", error);

    return res.status(500).json({
      message: "Unable to update review status.",
    });
  }
};

// =====================================================
// ADMIN - DELETE REVIEW
// =====================================================

const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Admin delete review error:", error);

    return res.status(500).json({
      message: "Unable to delete review.",
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getMyProductReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
  adminDeleteReview,
};