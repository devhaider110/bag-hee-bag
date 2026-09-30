const RecentlyViewed = require("../models/RecentlyViewed");
const Product = require("../models/Product");

// Get recently viewed products
const getRecentlyViewed = async (req, res) => {
  try {
    const recentlyViewed = await RecentlyViewed.findOne({
      user: req.user._id,
    }).populate({
      path: "products.product",
      match: { isActive: true },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    if (!recentlyViewed) {
      return res.status(200).json({
        recentlyViewed: [],
      });
    }

    const products = recentlyViewed.products
      .filter((item) => item.product)
      .sort(
        (a, b) =>
          new Date(b.viewedAt) - new Date(a.viewedAt)
      );

    return res.status(200).json({
      recentlyViewed: products,
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);

    return res.status(500).json({
      message: "Failed to load recently viewed products.",
    });
  }
};

// Add/update recently viewed product
const addRecentlyViewed = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required.",
      });
    }

    // Validate product ID
    if (!require("mongoose").Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    // Make sure product exists and is active
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    }).select("_id");

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const now = new Date();

    /*
     * IMPORTANT:
     * Do not use findOne() + save() here.
     *
     * Multiple requests can arrive at the same time for the
     * same user. Using save() after reading the document can
     * cause a Mongoose VersionError because another request
     * may have already modified the document.
     *
     * Instead, use one atomic MongoDB update.
     */

    await RecentlyViewed.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $pull: {
          products: {
            product: productId,
          },
        },
      },
      {
        new: false,
      }
    );

    await RecentlyViewed.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $push: {
          products: {
            $each: [
              {
                product: productId,
                viewedAt: now,
              },
            ],
            $position: 0,
            $slice: 12,
          },
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Recently viewed updated.",
    });
  } catch (error) {
    console.error("Add recently viewed error:", error);

    return res.status(500).json({
      message: "Failed to update recently viewed.",
    });
  }
};

// Clear recently viewed
const clearRecentlyViewed = async (req, res) => {
  try {
    await RecentlyViewed.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $set: {
          products: [],
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: "Recently viewed products cleared.",
    });
  } catch (error) {
    console.error("Clear recently viewed error:", error);

    return res.status(500).json({
      message: "Failed to clear recently viewed products.",
    });
  }
};

module.exports = {
  getRecentlyViewed,
  addRecentlyViewed,
  clearRecentlyViewed,
};