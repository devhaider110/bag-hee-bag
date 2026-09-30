const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ==========================================
// GET USER CART
// ==========================================
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      match: {
        isActive: true,
      },
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    // Create cart if user doesn't have one
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });

      cart = await Cart.findById(cart._id).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });
    }

    return res.status(200).json({
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      message: "Failed to load cart.",
    });
  }
};

// ==========================================
// ADD PRODUCT TO CART
// ==========================================
const addToCart = async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      variantId = null,
    } = req.body;

    // --------------------------------------
    // VALIDATE PRODUCT ID
    // --------------------------------------
    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        message: "Valid product ID is required.",
      });
    }

    // --------------------------------------
    // VALIDATE QUANTITY
    // --------------------------------------
    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        message:
          "Quantity must be a whole number greater than 0.",
      });
    }

    // --------------------------------------
    // FIND ACTIVE PRODUCT
    // --------------------------------------
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unavailable.",
      });
    }

    // --------------------------------------
    // VALIDATE VARIANT
    // --------------------------------------
    let selectedVariant = null;

    if (variantId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          variantId
        )
      ) {
        return res.status(400).json({
          message: "Invalid variant ID.",
        });
      }

      selectedVariant = product.variants?.find(
        (variant) =>
          variant._id.toString() ===
          variantId.toString() &&
          variant.isActive !== false
      );

      if (!selectedVariant) {
        return res.status(404).json({
          message:
            "Selected product variant was not found.",
        });
      }
    }

    // --------------------------------------
    // DETERMINE AVAILABLE STOCK
    // --------------------------------------
    const availableStock = selectedVariant
      ? Number(selectedVariant.stock)
      : Number(product.stock);

    if (availableStock <= 0) {
      return res.status(400).json({
        message: "This product is currently out of stock.",
      });
    }

    if (requestedQuantity > availableStock) {
      return res.status(400).json({
        message: `Only ${availableStock} item${
          availableStock === 1 ? "" : "s"
        } available in stock.`,
      });
    }

    // --------------------------------------
    // FIND / CREATE CART
    // --------------------------------------
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product: productId,
            variantId: variantId || null,
            quantity: requestedQuantity,
          },
        ],
      });
    } else {
      // ------------------------------------
      // FIND SAME PRODUCT + SAME VARIANT
      // ------------------------------------
      const existingItem = cart.items.find(
        (item) => {
          const sameProduct =
            item.product.toString() ===
            productId.toString();

          const currentVariant =
            item.variantId
              ? item.variantId.toString()
              : null;

          const incomingVariant =
            variantId
              ? variantId.toString()
              : null;

          return (
            sameProduct &&
            currentVariant === incomingVariant
          );
        }
      );

      // ------------------------------------
      // EXISTING ITEM
      // ------------------------------------
      if (existingItem) {
        const newQuantity =
          existingItem.quantity +
          requestedQuantity;

        if (newQuantity > availableStock) {
          return res.status(400).json({
            message: `Only ${availableStock} item${
              availableStock === 1
                ? ""
                : "s"
            } available in stock.`,
          });
        }

        existingItem.quantity = newQuantity;
      }

      // ------------------------------------
      // NEW ITEM
      // ------------------------------------
      else {
        cart.items.push({
          product: productId,
          variantId: variantId || null,
          quantity: requestedQuantity,
        });
      }

      await cart.save();
    }

    // --------------------------------------
    // RETURN UPDATED CART
    // --------------------------------------
    const updatedCart =
      await Cart.findById(
        cart._id
      ).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    return res.status(200).json({
      message: "Product added to cart.",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add cart error:", error);

    return res.status(500).json({
      message: "Failed to add product to cart.",
    });
  }
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // --------------------------------------
    // VALIDATE ITEM ID
    // --------------------------------------
    if (
      !itemId ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        message: "Valid cart item ID is required.",
      });
    }

    // --------------------------------------
    // VALIDATE QUANTITY
    // --------------------------------------
    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        message:
          "Quantity must be a whole number greater than 0.",
      });
    }

    // --------------------------------------
    // FIND CART
    // --------------------------------------
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    // --------------------------------------
    // FIND CART ITEM
    // --------------------------------------
    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    // --------------------------------------
    // FIND PRODUCT
    // --------------------------------------
    const product = await Product.findOne({
      _id: cartItem.product,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        message:
          "This product is no longer available.",
      });
    }

    // --------------------------------------
    // FIND VARIANT
    // --------------------------------------
    let selectedVariant = null;

    if (cartItem.variantId) {
      selectedVariant = product.variants?.find(
        (variant) =>
          variant._id.toString() ===
            cartItem.variantId.toString() &&
          variant.isActive !== false
      );

      if (!selectedVariant) {
        return res.status(400).json({
          message:
            "Selected product variant is no longer available.",
        });
      }
    }

    // --------------------------------------
    // STOCK
    // --------------------------------------
    const availableStock = selectedVariant
      ? Number(selectedVariant.stock)
      : Number(product.stock);

    if (availableStock <= 0) {
      return res.status(400).json({
        message:
          "This product is currently out of stock.",
      });
    }

    if (requestedQuantity > availableStock) {
      return res.status(400).json({
        message: `Only ${availableStock} item${
          availableStock === 1
            ? ""
            : "s"
        } available in stock.`,
      });
    }

    // --------------------------------------
    // UPDATE
    // --------------------------------------
    cartItem.quantity = requestedQuantity;

    await cart.save();

    // --------------------------------------
    // RETURN UPDATED CART
    // --------------------------------------
    const updatedCart =
      await Cart.findById(
        cart._id
      ).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    return res.status(200).json({
      message: "Cart quantity updated.",
      cart: updatedCart,
    });
  } catch (error) {
    console.error(
      "Update cart item error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update cart quantity.",
    });
  }
};

// ==========================================
// REMOVE CART ITEM
// ==========================================
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (
      !itemId ||
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      return res.status(400).json({
        message: "Valid cart item ID is required.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    cartItem.deleteOne();

    await cart.save();

    const updatedCart =
      await Cart.findById(
        cart._id
      ).populate({
        path: "items.product",
        match: {
          isActive: true,
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    return res.status(200).json({
      message: "Product removed from cart.",
      cart: updatedCart,
    });
  } catch (error) {
    console.error(
      "Remove cart item error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to remove product from cart.",
    });
  }
};

// ==========================================
// CLEAR CART
// ==========================================
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty.",
        cart: {
          items: [],
        },
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully.",
      cart,
    });
  } catch (error) {
    console.error(
      "Clear cart error:",
      error
    );

    return res.status(500).json({
      message: "Failed to clear cart.",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};