const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate({
      path: "products",
      match: { isActive: true },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });

      wishlist = await Wishlist.findById(wishlist._id).populate({
        path: "products",
        match: { isActive: true },
        populate: {
          path: "category",
          select: "name slug",
        },
      });
    }

    return res.status(200).json({
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      message: "Failed to load wishlist.",
    });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      const alreadyAdded = wishlist.products.some(
        (id) => id.toString() === productId.toString()
      );

      if (alreadyAdded) {
        return res.status(400).json({
          message: "Product is already in your wishlist.",
        });
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    const updatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate({
      path: "products",
      match: { isActive: true },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    return res.status(200).json({
      message: "Product added to wishlist.",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      message: "Failed to add product to wishlist.",
    });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found.",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate({
      path: "products",
      match: { isActive: true },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    return res.status(200).json({
      message: "Product removed from wishlist.",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      message: "Failed to remove product from wishlist.",
    });
  }
};

// Check whether product is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    const isWishlisted = wishlist
      ? wishlist.products.some(
          (id) => id.toString() === productId.toString()
        )
      : false;

    return res.status(200).json({
      isWishlisted,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);

    return res.status(500).json({
      message: "Failed to check wishlist.",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};