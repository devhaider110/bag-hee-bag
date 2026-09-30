const mongoose = require("mongoose");

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

/* =====================================================
   HELPERS
===================================================== */

const getStockTarget = (product, variantId) => {
  if (!variantId) {
    return {
      stock: product.stock,
      variant: null,
    };
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    throw new Error("Product variant not found.");
  }

  return {
    stock: variant.stock,
    variant,
  };
};

const sanitizeProduct = (product) => {
  if (!product) {
    return null;
  }

  const productObject =
    product.toObject
      ? product.toObject()
      : product;

  return {
    _id: productObject._id,
    name: productObject.name,
    sku: productObject.sku,
    image: productObject.image || "",
    price: productObject.price || 0,
    discountPrice:
      productObject.discountPrice || 0,
    stock: productObject.stock || 0,
    isActive:
      productObject.isActive !== false,
    category: productObject.category,
    variants: (
      productObject.variants || []
    ).map((variant) => ({
      _id: variant._id,
      name: variant.name || "",
      color: variant.color || "",
      size: variant.size || "",
      sku: variant.sku || "",
      stock: variant.stock || 0,
      price: variant.price || 0,
      discountPrice:
        variant.discountPrice || 0,
      isActive:
        variant.isActive !== false,
      images: variant.images || [],
    })),
  };
};

const getProductStockSummary = (product) => {
  const variants = product.variants || [];

  const variantStock = variants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  if (variants.length > 0) {
    return variantStock;
  }

  return Number(product.stock || 0);
};

/* =====================================================
   GET INVENTORY SUMMARY
   GET /api/inventory/admin/summary
===================================================== */

const getInventorySummary = async (
  req,
  res
) => {
  try {
    const products = await Product.find({})
      .select(
        "name sku stock variants isActive"
      )
      .lean();

    const lowStockThreshold = Math.max(
      0,
      Number(req.query.threshold) || 5
    );

    let totalProducts = products.length;
    let activeProducts = 0;
    let inactiveProducts = 0;
    let inStockProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalUnits = 0;

    products.forEach((product) => {
      const stock =
        getProductStockSummary(product);

      totalUnits += stock;

      if (product.isActive === false) {
        inactiveProducts += 1;
      } else {
        activeProducts += 1;
      }

      if (stock <= 0) {
        outOfStockProducts += 1;
      } else if (
        stock <= lowStockThreshold
      ) {
        lowStockProducts += 1;
      } else {
        inStockProducts += 1;
      }
    });

    const recentMovements =
      await Inventory.find({})
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .populate(
          "product",
          "name sku image"
        )
        .populate(
          "performedBy",
          "name username email"
        )
        .lean();

    res.status(200).json({
      success: true,

      summary: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        inStockProducts,
        lowStockProducts,
        outOfStockProducts,
        totalUnits,
        lowStockThreshold,
      },

      recentMovements,
    });
  } catch (error) {
    console.error(
      "Get inventory summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load inventory summary.",
    });
  }
};

/* =====================================================
   GET ALL INVENTORY
   GET /api/inventory/admin
===================================================== */

const getInventory = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      status = "all",
      threshold = 5,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(
      1,
      Number(page) || 1
    );

    const perPage = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 20
      )
    );

    const lowStockThreshold = Math.max(
      0,
      Number(threshold) || 5
    );

    const productFilter = {};

    if (search.trim()) {
      const searchRegex =
        new RegExp(
          search.trim(),
          "i"
        );

      productFilter.$or = [
        {
          name: searchRegex,
        },
        {
          sku: searchRegex,
        },
        {
          "variants.sku":
            searchRegex,
        },
        {
          "variants.name":
            searchRegex,
        },
      ];
    }

    const products =
      await Product.find(
        productFilter
      )
        .populate(
          "category",
          "name slug"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    const filteredProducts =
      products.filter(
        (product) => {
          const stock =
            getProductStockSummary(
              product
            );

          if (status === "in-stock") {
            return stock > lowStockThreshold;
          }

          if (status === "low-stock") {
            return (
              stock > 0 &&
              stock <= lowStockThreshold
            );
          }

          if (status === "out-of-stock") {
            return stock <= 0;
          }

          if (status === "inactive") {
            return (
              product.isActive === false
            );
          }

          if (status === "active") {
            return (
              product.isActive !== false
            );
          }

          return true;
        }
      );

    const total =
      filteredProducts.length;

    const totalPages =
      Math.ceil(
        total / perPage
      );

    const startIndex =
      (currentPage - 1) *
      perPage;

    const paginatedProducts =
      filteredProducts.slice(
        startIndex,
        startIndex + perPage
      );

    const inventory = paginatedProducts.map(
      (product) => {
        const stock =
          getProductStockSummary(
            product
          );

        let stockStatus = "IN_STOCK";

        if (stock <= 0) {
          stockStatus =
            "OUT_OF_STOCK";
        } else if (
          stock <= lowStockThreshold
        ) {
          stockStatus =
            "LOW_STOCK";
        }

        return {
          ...sanitizeProduct(product),
          category:
            product.category,
          totalStock: stock,
          stockStatus,
          lowStockThreshold,
        };
      }
    );

    res.status(200).json({
      success: true,

      inventory,

      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages,
      },

      filters: {
        search,
        status,
        threshold:
          lowStockThreshold,
      },
    });
  } catch (error) {
    console.error(
      "Get inventory error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load inventory.",
    });
  }
};

/* =====================================================
   GET PRODUCT INVENTORY DETAILS
   GET /api/inventory/admin/:productId
===================================================== */

const getInventoryByProduct = async (
  req,
  res
) => {
  try {
    const {
      productId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findById(
        productId
      ).populate(
        "category",
        "name slug"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    const movements =
      await Inventory.find({
        product: productId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .populate(
          "performedBy",
          "name username email"
        )
        .lean();

    res.status(200).json({
      success: true,

      product: {
        ...sanitizeProduct(product),
        category:
          product.category,
        totalStock:
          getProductStockSummary(
            product
          ),
      },

      movements,
    });
  } catch (error) {
    console.error(
      "Get inventory by product error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load product inventory.",
    });
  }
};

/* =====================================================
   UPDATE STOCK
   PATCH /api/inventory/admin/:productId/stock
===================================================== */

const updateStock = async (
  req,
  res
) => {
  try {
    const {
      productId,
    } = req.params;

    const {
      variantId = null,
      quantity,
      operation = "adjust",
      reason = "",
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        parsedQuantity
      ) ||
      parsedQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a valid positive number.",
      });
    }

    if (
      variantId &&
      !mongoose.Types.ObjectId.isValid(
        variantId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid variant ID.",
      });
    }

    const allowedOperations = [
      "restock",
      "remove",
      "adjust",
    ];

    if (
      !allowedOperations.includes(
        operation
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid stock operation.",
      });
    }

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    const {
      stock: previousStock,
      variant,
    } = getStockTarget(
      product,
      variantId
    );

    let newStock =
      previousStock;

    let inventoryType =
      "ADJUSTMENT";

    if (
      operation === "restock"
    ) {
      newStock =
        previousStock +
        parsedQuantity;

      inventoryType =
        "RESTOCK";
    }

    if (
      operation === "remove"
    ) {
      if (
        parsedQuantity >
        previousStock
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot remove more stock than available.",
        });
      }

      newStock =
        previousStock -
        parsedQuantity;

      inventoryType =
        "ADJUSTMENT";
    }

    if (
      operation === "adjust"
    ) {
      newStock =
        parsedQuantity;

      inventoryType =
        "ADJUSTMENT";
    }

    if (variant) {
      variant.stock =
        newStock;
    } else {
      product.stock =
        newStock;
    }

    await product.save();

    const movement =
      await Inventory.create({
        product:
          product._id,

        variantId:
          variant
            ? variant._id
            : null,

        type:
          inventoryType,

        quantity:
          Math.abs(
            newStock -
              previousStock
          ),

        previousStock,

        newStock,

        reason:
          String(
            reason || ""
          ).trim(),

        referenceType:
          "MANUAL",

        performedBy:
          req.user?._id || null,
      });

    const updatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    res.status(200).json({
      success: true,

      message:
        "Stock updated successfully.",

      product: {
        ...sanitizeProduct(
          updatedProduct
        ),
        category:
          updatedProduct.category,
        totalStock:
          getProductStockSummary(
            updatedProduct
          ),
      },

      movement,
    });
  } catch (error) {
    console.error(
      "Update stock error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to update stock.",
    });
  }
};

/* =====================================================
   GET INVENTORY MOVEMENTS
   GET /api/inventory/admin/movements
===================================================== */

const getInventoryMovements =
  async (req, res) => {
    try {
      const {
        type = "all",
        page = 1,
        limit = 25,
      } = req.query;

      const currentPage = Math.max(
        1,
        Number(page) || 1
      );

      const perPage = Math.min(
        100,
        Math.max(
          1,
          Number(limit) || 25
        )
      );

      const filter = {};

      if (
        type !== "all"
      ) {
        const allowedTypes = [
          "INITIAL",
          "RESTOCK",
          "SALE",
          "RETURN",
          "CANCELLATION",
          "ADJUSTMENT",
        ];

        if (
          !allowedTypes.includes(
            type
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid movement type.",
          });
        }

        filter.type = type;
      }

      const total =
        await Inventory.countDocuments(
          filter
        );

      const movements =
        await Inventory.find(
          filter
        )
          .sort({
            createdAt: -1,
          })
          .skip(
            (currentPage - 1) *
              perPage
          )
          .limit(perPage)
          .populate(
            "product",
            "name sku image"
          )
          .populate(
            "performedBy",
            "name username email"
          )
          .lean();

      res.status(200).json({
        success: true,

        movements,

        pagination: {
          page: currentPage,
          limit: perPage,
          total,
          totalPages:
            Math.ceil(
              total /
                perPage
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get inventory movements error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load inventory movements.",
      });
    }
  };

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  getInventorySummary,
  getInventory,
  getInventoryByProduct,
  updateStock,
  getInventoryMovements,
};