const mongoose = require("mongoose");

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const StoreSetting = require("../models/StoreSetting");
const OfflineSale = require("../models/OfflineSale");

/* =====================================================
   HELPERS
===================================================== */

const generateSaleNumber = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `BHB-OFF-${year}${month}${day}-${random}`;
};

const getProductStock = (
  product,
  variantId = null
) => {
  if (variantId) {
    const variant =
      product.variants.id(variantId);

    if (!variant) {
      throw new Error(
        "Product variant not found."
      );
    }

    return {
      stock: Number(variant.stock || 0),
      variant,
    };
  }

  return {
    stock: Number(product.stock || 0),
    variant: null,
  };
};

const getDefaultStore = () => ({
  storeName: "BAG HEE BAG",

  address: {
    shopName: "Kothari Milestone",
    shopNumber: "Shop No. 2",
    street: "S.V. Road",
    area: "Malad West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "",
  },

  phone: "",
  whatsapp: "",
  email: "",
  googleMapsUrl: "",

  openingTime: "10:00",
  closingTime: "21:00",

  workingDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],

  isOpen: true,

  storeDescription:
    "Visit BAG HEE BAG at our physical store in Malad West, Mumbai.",
});

/* =====================================================
   GET STORE SETTINGS
   GET /api/physical-store/store
===================================================== */

const getStoreSettings = async (
  req,
  res
) => {
  try {
    let store =
      await StoreSetting.findOne().lean();

    if (!store) {
      store =
        await StoreSetting.create(
          getDefaultStore()
        );

      store =
        store.toObject();
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error(
      "Get store settings error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load store information.",
    });
  }
};

/* =====================================================
   UPDATE STORE SETTINGS
   PATCH /api/physical-store/admin/store
===================================================== */

const updateStoreSettings = async (
  req,
  res
) => {
  try {
    const allowedFields = [
      "storeName",
      "address",
      "phone",
      "whatsapp",
      "email",
      "googleMapsUrl",
      "openingTime",
      "closingTime",
      "workingDays",
      "isOpen",
      "storeDescription",
    ];

    const update = {};

    allowedFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        update[field] = req.body[field];
      }
    });

    update.updatedBy =
      req.user?._id || null;

    const store =
      await StoreSetting.findOneAndUpdate(
        {},
        {
          $set: update,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Store settings updated successfully.",
      store,
    });
  } catch (error) {
    console.error(
      "Update store settings error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to update store settings.",
    });
  }
};

/* =====================================================
   GET PRODUCTS FOR OFFLINE SALE
   GET /api/physical-store/admin/products
===================================================== */

const getStoreProducts = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 30,
    } = req.query;

    const currentPage = Math.max(
      1,
      Number(page) || 1
    );

    const perPage = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 30
      )
    );

    const filter = {
      isActive: true,
    };

    if (String(search).trim()) {
      const searchRegex =
        new RegExp(
          String(search).trim(),
          "i"
        );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          sku: searchRegex,
        },
        {
          "variants.name":
            searchRegex,
        },
        {
          "variants.sku":
            searchRegex,
        },
      ];
    }

    const total =
      await Product.countDocuments(
        filter
      );

    const products =
      await Product.find(filter)
        .select(
          "name sku image price discountPrice stock variants isActive"
        )
        .sort({
          name: 1,
        })
        .skip(
          (currentPage - 1) *
            perPage
        )
        .limit(perPage)
        .lean();

    const formatted =
      products.map(
        (product) => ({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          image:
            product.image || "",
          price:
            Number(product.price || 0),
          discountPrice:
            product.discountPrice ===
            null
              ? null
              : Number(
                  product.discountPrice ||
                    0
                ),
          stock:
            Number(product.stock || 0),

          variants: (
            product.variants || []
          )
            .filter(
              (variant) =>
                variant.isActive !==
                false
            )
            .map(
              (variant) => ({
                _id: variant._id,
                name:
                  variant.name || "",
                sku:
                  variant.sku || "",
                color:
                  variant.color || "",
                size:
                  variant.size || "",
                price:
                  variant.price ??
                  product.price ??
                  0,
                discountPrice:
                  variant.discountPrice ??
                  product.discountPrice ??
                  null,
                stock:
                  Number(
                    variant.stock || 0
                  ),
                images:
                  variant.images || [],
              })
            ),
        })
      );

    res.status(200).json({
      success: true,
      products: formatted,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages:
          Math.ceil(
            total / perPage
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get store products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load store products.",
    });
  }
};

/* =====================================================
   CREATE OFFLINE SALE
   POST /api/physical-store/admin/sales
===================================================== */

const createOfflineSale =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const {
        items = [],
        customer = {},
        discount = 0,
        tax = 0,
        shipping = 0,
        paymentMethod = "CASH",
        paymentStatus = "PAID",
        notes = "",
      } = req.body;

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one product is required.",
        });
      }

      const allowedPaymentMethods = [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "OTHER",
      ];

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method.",
        });
      }

      const normalizedItems = items.map(
        (item) => ({
          productId:
            item.productId ||
            item.product,

          variantId:
            item.variantId || null,

          quantity:
            Number(item.quantity),

          unitPrice:
            Number(item.unitPrice),
        })
      );

      for (const item of normalizedItems) {
        if (
          !mongoose.Types.ObjectId.isValid(
            item.productId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product ID.",
          });
        }

        if (
          !Number.isInteger(
            item.quantity
          ) ||
          item.quantity <= 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Quantity must be a positive whole number.",
          });
        }

        if (
          !Number.isFinite(
            item.unitPrice
          ) ||
          item.unitPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product price.",
          });
        }

        if (
          item.variantId &&
          !mongoose.Types.ObjectId.isValid(
            item.variantId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid variant ID.",
          });
        }
      }

      const parsedDiscount =
        Number(discount) || 0;

      const parsedTax =
        Number(tax) || 0;

      const parsedShipping =
        Number(shipping) || 0;

      if (
        parsedDiscount < 0 ||
        parsedTax < 0 ||
        parsedShipping < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Discount, tax and shipping cannot be negative.",
        });
      }

      session.startTransaction();

      const saleItems = [];

      let subtotal = 0;

      for (const item of normalizedItems) {
        const product =
          await Product.findById(
            item.productId
          ).session(session);

        if (!product) {
          throw new Error(
            `Product not found: ${item.productId}`
          );
        }

        if (
          product.isActive === false
        ) {
          throw new Error(
            `${product.name} is inactive.`
          );
        }

        const {
          stock: previousStock,
          variant,
        } = getProductStock(
          product,
          item.variantId
        );

        if (
          item.quantity >
          previousStock
        ) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${previousStock}`
          );
        }

        let unitPrice =
          item.unitPrice;

        if (
          !Number.isFinite(unitPrice)
        ) {
          unitPrice =
            variant?.discountPrice ??
            variant?.price ??
            product.discountPrice ??
            product.price ??
            0;
        }

        const itemTotal =
          unitPrice *
          item.quantity;

        subtotal += itemTotal;

        const newStock =
          previousStock -
          item.quantity;

        if (variant) {
          variant.stock =
            newStock;
        } else {
          product.stock =
            newStock;
        }

        await product.save({
          session,
        });

        await Inventory.create(
          [
            {
              product:
                product._id,

              variantId:
                variant
                  ? variant._id
                  : null,

              type: "SALE",

              quantity:
                item.quantity,

              previousStock,

              newStock,

              reason:
                "Physical store offline sale",

              referenceType:
                "OFFLINE_SALE",

              performedBy:
                req.user?._id ||
                null,
            },
          ],
          {
            session,
          }
        );

        saleItems.push({
          product:
            product._id,

          variantId:
            variant
              ? variant._id
              : null,

          productName:
            product.name,

          sku:
            variant?.sku ||
            product.sku ||
            "",

          variantName:
            variant?.name || "",

          quantity:
            item.quantity,

          unitPrice,

          discount: 0,

          total: itemTotal,
        });
      }

      const grandTotal =
        Math.max(
          0,
          subtotal -
            parsedDiscount +
            parsedTax +
            parsedShipping
        );

      let saleNumber =
        generateSaleNumber();

      while (
        await OfflineSale.exists({
          saleNumber,
        })
      ) {
        saleNumber =
          generateSaleNumber();
      }

      const createdSales =
        await OfflineSale.create(
          [
            {
              saleNumber,

              items: saleItems,

              customer: {
                name:
                  String(
                    customer.name ||
                      "Walk-in Customer"
                  ).trim(),

                phone:
                  String(
                    customer.phone || ""
                  ).trim(),

                email:
                  String(
                    customer.email || ""
                  )
                    .trim()
                    .toLowerCase(),
              },

              subtotal,

              discount:
                parsedDiscount,

              tax: parsedTax,

              shipping:
                parsedShipping,

              grandTotal,

              paymentMethod,

              paymentStatus,

              notes:
                String(
                  notes || ""
                ).trim(),

              soldBy:
                req.user._id,

              status:
                "COMPLETED",
            },
          ],
          {
            session,
          }
        );

      await session.commitTransaction();

      const populatedSale =
        await OfflineSale.findById(
          createdSales[0]._id
        )
          .populate(
            "soldBy",
            "name username email"
          )
          .populate(
            "items.product",
            "name sku image"
          )
          .lean();

      res.status(201).json({
        success: true,

        message:
          "Offline sale recorded successfully and stock updated.",

        sale: populatedSale,
      });
    } catch (error) {
      try {
        await session.abortTransaction();
      } catch (_) {}

      console.error(
        "Create offline sale error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to record offline sale.",
      });
    } finally {
      await session.endSession();
    }
  };

/* =====================================================
   GET OFFLINE SALES
   GET /api/physical-store/admin/sales
===================================================== */

const getOfflineSales =
  async (req, res) => {
    try {
      const {
        search = "",
        paymentMethod = "all",
        status = "all",
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

      const filter = {};

      if (
        paymentMethod !== "all"
      ) {
        filter.paymentMethod =
          paymentMethod;
      }

      if (status !== "all") {
        filter.status = status;
      }

      if (String(search).trim()) {
        const searchRegex =
          new RegExp(
            String(search).trim(),
            "i"
          );

        filter.$or = [
          {
            saleNumber:
              searchRegex,
          },
          {
            "customer.name":
              searchRegex,
          },
          {
            "customer.phone":
              searchRegex,
          },
        ];
      }

      const total =
        await OfflineSale.countDocuments(
          filter
        );

      const sales =
        await OfflineSale.find(
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
            "soldBy",
            "name username email"
          )
          .populate(
            "items.product",
            "name sku image"
          )
          .lean();

      res.status(200).json({
        success: true,

        sales,

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
        "Get offline sales error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load offline sales.",
      });
    }
  };

/* =====================================================
   GET SINGLE OFFLINE SALE
   GET /api/physical-store/admin/sales/:id
===================================================== */

const getOfflineSaleById =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid sale ID.",
        });
      }

      const sale =
        await OfflineSale.findById(
          id
        )
          .populate(
            "soldBy",
            "name username email"
          )
          .populate(
            "items.product",
            "name sku image price discountPrice"
          )
          .lean();

      if (!sale) {
        return res.status(404).json({
          success: false,
          message:
            "Offline sale not found.",
        });
      }

      res.status(200).json({
        success: true,
        sale,
      });
    } catch (error) {
      console.error(
        "Get offline sale error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load offline sale.",
      });
    }
  };

/* =====================================================
   DASHBOARD
   GET /api/physical-store/admin/dashboard
===================================================== */

const getPhysicalStoreDashboard =
  async (req, res) => {
    try {
      const startOfToday =
        new Date();

      startOfToday.setHours(
        0,
        0,
        0,
        0
      );

      const startOfMonth =
        new Date();

      startOfMonth.setDate(1);
      startOfMonth.setHours(
        0,
        0,
        0,
        0
      );

      const completedFilter = {
        status: "COMPLETED",
      };

      const [
        todaySales,
        monthSales,
        totalSales,
        todayRevenueResult,
        monthRevenueResult,
        paymentBreakdown,
        recentSales,
        lowStockProducts,
      ] =
        await Promise.all([
          OfflineSale.countDocuments({
            ...completedFilter,
            createdAt: {
              $gte:
                startOfToday,
            },
          }),

          OfflineSale.countDocuments({
            ...completedFilter,
            createdAt: {
              $gte:
                startOfMonth,
            },
          }),

          OfflineSale.countDocuments(
            completedFilter
          ),

          OfflineSale.aggregate([
            {
              $match: {
                ...completedFilter,
                createdAt: {
                  $gte:
                    startOfToday,
                },
              },
            },
            {
              $group: {
                _id: null,
                revenue: {
                  $sum:
                    "$grandTotal",
                },
              },
            },
          ]),

          OfflineSale.aggregate([
            {
              $match: {
                ...completedFilter,
                createdAt: {
                  $gte:
                    startOfMonth,
                },
              },
            },
            {
              $group: {
                _id: null,
                revenue: {
                  $sum:
                    "$grandTotal",
                },
              },
            },
          ]),

          OfflineSale.aggregate([
            {
              $match:
                completedFilter,
            },
            {
              $group: {
                _id:
                  "$paymentMethod",
                amount: {
                  $sum:
                    "$grandTotal",
                },
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $sort: {
                amount: -1,
              },
            },
          ]),

          OfflineSale.find(
            completedFilter
          )
            .sort({
              createdAt: -1,
            })
            .limit(8)
            .populate(
              "soldBy",
              "name username"
            )
            .populate(
              "items.product",
              "name sku image"
            )
            .lean(),

          Product.find({
            isActive: true,
            stock: {
              $lte: 5,
            },
          })
            .select(
              "name sku image stock"
            )
            .sort({
              stock: 1,
            })
            .limit(10)
            .lean(),
        ]);

      res.status(200).json({
        success: true,

        dashboard: {
          todaySales,
          monthSales,
          totalSales,

          todayRevenue:
            Number(
              todayRevenueResult[0]
                ?.revenue || 0
            ),

          monthRevenue:
            Number(
              monthRevenueResult[0]
                ?.revenue || 0
            ),

          paymentBreakdown,

          recentSales,

          lowStockProducts,
        },
      });
    } catch (error) {
      console.error(
        "Physical store dashboard error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load physical store dashboard.",
      });
    }
  };

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  getStoreSettings,
  updateStoreSettings,
  getStoreProducts,
  createOfflineSale,
  getOfflineSales,
  getOfflineSaleById,
  getPhysicalStoreDashboard,
};