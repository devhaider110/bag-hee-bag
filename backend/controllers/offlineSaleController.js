const mongoose = require("mongoose");

const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const OfflineSale = require("../models/OfflineSale");
const StoreSetting = require("../models/StoreSetting");

const createSaleNumber = () => {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(
      2,
      "0"
    ),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `BHB-OFF-${date}-${random}`;
};

const getEffectivePrice = (
  product,
  variant
) => {
  if (variant) {
    if (
      Number(variant.discountPrice) > 0 &&
      Number(variant.discountPrice) <
        Number(variant.price)
    ) {
      return Number(variant.discountPrice);
    }

    return Number(variant.price || 0);
  }

  if (
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) <
      Number(product.price)
  ) {
    return Number(product.discountPrice);
  }

  return Number(product.price || 0);
};

const getVariantName = (variant) => {
  if (!variant) {
    return "";
  }

  return [
    variant.name,
    variant.color,
    variant.size,
  ]
    .filter(Boolean)
    .join(" / ");
};

const getStock = (
  product,
  variantId
) => {
  if (product.variants?.length) {
    if (!variantId) {
      return null;
    }

    const variant =
      product.variants.id(variantId);

    if (!variant) {
      return null;
    }

    return Number(variant.stock || 0);
  }

  return Number(product.stock || 0);
};

const getProductForItem = async (
  productId,
  variantId,
  session
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      productId
    )
  ) {
    throw new Error(
      "Invalid product ID."
    );
  }

  const product =
    await Product.findById(productId).session(
      session
    );

  if (!product) {
    throw new Error(
      "Product not found."
    );
  }

  if (!product.isActive) {
    throw new Error(
      `${product.name} is inactive.`
    );
  }

  let variant = null;

  if (product.variants?.length) {
    if (!variantId) {
      throw new Error(
        `Please select a variant for ${product.name}.`
      );
    }

    variant =
      product.variants.id(variantId);

    if (!variant) {
      throw new Error(
        `Selected variant for ${product.name} was not found.`
      );
    }

    if (variant.isActive === false) {
      throw new Error(
        `Selected variant for ${product.name} is inactive.`
      );
    }
  }

  return {
    product,
    variant,
  };
};

const getAdminProducts = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      limit = 30,
    } = req.query;

    const safeLimit = Math.min(
      Math.max(Number(limit) || 30, 1),
      50
    );

    const searchText = String(
      search
    ).trim();

    const query = {
      isActive: true,
    };

    if (searchText) {
      query.$or = [
        {
          name: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "variants.sku": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "variants.name": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "variants.color": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "variants.size": {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const products =
      await Product.find(query)
        .select(
          "name sku price discountPrice stock image images variants isActive"
        )
        .sort({
          createdAt: -1,
        })
        .limit(safeLimit)
        .lean();

    const normalizedProducts =
      products.map((product) => {
        const variants =
          Array.isArray(product.variants)
            ? product.variants
                .filter(
                  (variant) =>
                    variant.isActive !== false
                )
                .map((variant) => ({
                  _id: variant._id,
                  name: variant.name || "",
                  color:
                    variant.color || "",
                  size:
                    variant.size || "",
                  sku:
                    variant.sku || "",
                  price:
                    Number(
                      variant.price || 0
                    ),
                  discountPrice:
                    Number(
                      variant.discountPrice ||
                        0
                    ),
                  stock:
                    Number(
                      variant.stock || 0
                    ),
                  images:
                    variant.images || [],
                  image:
                    variant.images?.[0]
                      ?.url || "",
                  variantName:
                    getVariantName(
                      variant
                    ),
                }))
            : [];

        return {
          _id: product._id,
          name: product.name,
          sku: product.sku || "",
          image:
            product.image ||
            product.images?.find(
              (image) => image.isPrimary
            )?.url ||
            product.images?.[0]?.url ||
            "",
          price: Number(
            product.price || 0
          ),
          discountPrice: Number(
            product.discountPrice || 0
          ),
          stock: Number(
            product.stock || 0
          ),
          hasVariants:
            variants.length > 0,
          variants,
        };
      });

    return res.status(200).json({
      products:
        normalizedProducts,
    });
  } catch (error) {
    console.error(
      "Get offline-sale products error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load products.",
    });
  }
};

const createOfflineSale = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    let createdSale = null;

    await session.withTransaction(
      async () => {
        const {
          items,
          customer = {},
          discount = 0,
          paymentMethod = "CASH",
          paymentStatus = "PAID",
          notes = "",
        } = req.body;

        if (
          !Array.isArray(items) ||
          items.length === 0
        ) {
          throw new Error(
            "At least one product is required."
          );
        }

        const store =
          (await StoreSetting.findOne({
            key: "main",
          }).session(session)) ||
          (await StoreSetting.create(
            [
              {
                key: "main",
              },
            ],
            {
              session,
            }
          ).then(
            (result) => result[0]
          ));

        const saleItems = [];

        let subtotal = 0;

        for (const rawItem of items) {
          const productId =
            rawItem.productId ||
            rawItem.product;

          const variantId =
            rawItem.variantId || null;

          const quantity = Math.floor(
            Number(rawItem.quantity)
          );

          if (
            !productId ||
            !quantity ||
            quantity < 1
          ) {
            throw new Error(
              "Each sale item must have a valid product and quantity."
            );
          }

          const {
            product,
            variant,
          } =
            await getProductForItem(
              productId,
              variantId,
              session
            );

          const currentStock =
            getStock(
              product,
              variantId
            );

          if (
            currentStock === null
          ) {
            throw new Error(
              `Variant is required for ${product.name}.`
            );
          }

          if (
            currentStock < quantity
          ) {
            throw new Error(
              `Insufficient stock for ${product.name}. Available stock: ${currentStock}.`
            );
          }

          const unitPrice =
            getEffectivePrice(
              product,
              variant
            );

          if (unitPrice <= 0) {
            throw new Error(
              `${product.name} has an invalid selling price.`
            );
          }

          const lineTotal =
            unitPrice * quantity;

          subtotal += lineTotal;

          const previousStock =
            currentStock;

          const newStock =
            currentStock - quantity;

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

                quantity,

                previousStock,

                newStock,

                reason:
                  "Offline physical store sale",

                referenceType:
                  "MANUAL",

                performedBy:
                  req.user._id,
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

            variantName:
              getVariantName(
                variant
              ),

            sku:
              variant?.sku ||
              product.sku ||
              "",

            image:
              variant?.images?.[0]
                ?.url ||
              product.image ||
              product.images?.find(
                (image) =>
                  image.isPrimary
              )?.url ||
              product.images?.[0]
                ?.url ||
              "",

            quantity,

            unitPrice,

            lineTotal,
          });
        }

        const safeDiscount = Math.min(
          Math.max(
            Number(discount) || 0,
            0
          ),
          subtotal
        );

        const taxableAmount =
          Math.max(
            subtotal -
              safeDiscount,
            0
          );

        const taxRate =
          Number(
            store.defaultTaxRate
          ) || 0;

        const tax = Number(
          (
            taxableAmount *
            (taxRate / 100)
          ).toFixed(2)
        );

        const grandTotal = Number(
          (
            taxableAmount + tax
          ).toFixed(2)
        );

        if (
          ![
            "CASH",
            "UPI",
            "CARD",
            "OTHER",
          ].includes(paymentMethod)
        ) {
          throw new Error(
            "Invalid payment method."
          );
        }

        if (
          ![
            "PAID",
            "PENDING",
          ].includes(paymentStatus)
        ) {
          throw new Error(
            "Invalid payment status."
          );
        }

        const address = [
          store.addressLine1,
          store.addressLine2,
          store.city,
          store.state,
          store.pincode,
          store.country,
        ]
          .filter(Boolean)
          .join(", ");

        const saleNumber =
          createSaleNumber();

        const created =
          await OfflineSale.create(
            [
              {
                saleNumber,

                customer: {
                  user:
                    customer.user ||
                    null,

                  name:
                    String(
                      customer.name ||
                        "Walk-in Customer"
                    ).trim(),

                  phone:
                    String(
                      customer.phone ||
                        ""
                    ).trim(),

                  email:
                    String(
                      customer.email ||
                        ""
                    )
                      .trim()
                      .toLowerCase(),
                },

                items: saleItems,

                subtotal,

                discount:
                  safeDiscount,

                taxableAmount,

                taxRate,

                tax,

                grandTotal,

                paymentMethod,

                paymentStatus,

                notes:
                  String(
                    notes || ""
                  ).trim(),

                soldBy:
                  req.user._id,

                storeSnapshot: {
                  storeName:
                    store.storeName,

                  phone:
                    store.phone,

                  address,

                  gstin:
                    store.gstin,
                },
              },
            ],
            {
              session,
            }
          );

        createdSale =
          created[0];
      }
    );

    const populatedSale =
      await OfflineSale.findById(
        createdSale._id
      )
        .populate(
          "soldBy",
          "name username email"
        )
        .lean();

    return res.status(201).json({
      message:
        "Offline sale created successfully.",
      sale:
        populatedSale,
    });
  } catch (error) {
    console.error(
      "Create offline sale error:",
      error
    );

    return res.status(400).json({
      message:
        error.message ||
        "Unable to create offline sale.",
    });
  } finally {
    await session.endSession();
  }
};

const getOfflineSales = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      paymentMethod = "",
      page = 1,
      limit = 20,
    } = req.query;

    const safePage = Math.max(
      Number(page) || 1,
      1
    );

    const safeLimit = Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

    const query = {};

    if (paymentMethod) {
      query.paymentMethod =
        paymentMethod;
    }

    const searchText =
      String(search).trim();

    if (searchText) {
      query.$or = [
        {
          saleNumber: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "customer.name": {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          "customer.phone": {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const total =
      await OfflineSale.countDocuments(
        query
      );

    const sales =
      await OfflineSale.find(query)
        .populate(
          "soldBy",
          "name username email"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit)
        .lean();

    return res.status(200).json({
      sales,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(
          total / safeLimit
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get offline sales error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load offline sales.",
    });
  }
};

const getOfflineSaleById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid sale ID.",
      });
    }

    const sale =
      await OfflineSale.findById(id)
        .populate(
          "soldBy",
          "name username email"
        )
        .populate(
          "items.product",
          "name sku"
        )
        .lean();

    if (!sale) {
      return res.status(404).json({
        message:
          "Offline sale not found.",
      });
    }

    return res.status(200).json({
      sale,
    });
  } catch (error) {
    console.error(
      "Get offline sale details error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load sale details.",
    });
  }
};

const getOfflineSummary = async (
  req,
  res
) => {
  try {
    const requestedDate =
      String(
        req.query.date || ""
      ).trim();

    let dateText =
      requestedDate;

    if (!dateText) {
      const now = new Date();

      dateText = [
        now.getFullYear(),
        String(
          now.getMonth() + 1
        ).padStart(2, "0"),
        String(
          now.getDate()
        ).padStart(2, "0"),
      ].join("-");
    }

    const start = new Date(
      `${dateText}T00:00:00+05:30`
    );

    const end = new Date(
      `${dateText}T00:00:00+05:30`
    );

    end.setDate(
      end.getDate() + 1
    );

    const [
      salesSummary,
      paymentBreakdown,
      recentSales,
    ] = await Promise.all([
      OfflineSale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lt: end,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalSales: {
              $sum: 1,
            },

            totalRevenue: {
              $sum: "$grandTotal",
            },

            totalDiscount: {
              $sum: "$discount",
            },

            totalTax: {
              $sum: "$tax",
            },

            itemsSold: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      "$$this.quantity",
                    ],
                  },
                },
              },
            },
          },
        },
      ]),

      OfflineSale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lt: end,
            },
          },
        },

        {
          $group: {
            _id: "$paymentMethod",

            amount: {
              $sum: "$grandTotal",
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

      OfflineSale.find({
        createdAt: {
          $gte: start,
          $lt: end,
        },
      })
        .populate(
          "soldBy",
          "name username"
        )
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .lean(),
    ]);

    const summary =
      salesSummary[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        totalTax: 0,
        itemsSold: 0,
      };

    return res.status(200).json({
      date: dateText,

      summary: {
        totalSales:
          summary.totalSales || 0,

        totalRevenue:
          summary.totalRevenue || 0,

        totalDiscount:
          summary.totalDiscount || 0,

        totalTax:
          summary.totalTax || 0,

        itemsSold:
          summary.itemsSold || 0,
      },

      paymentBreakdown,

      recentSales,
    });
  } catch (error) {
    console.error(
      "Get offline summary error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load store sales summary.",
    });
  }
};

module.exports = {
  getAdminProducts,
  createOfflineSale,
  getOfflineSales,
  getOfflineSaleById,
  getOfflineSummary,
};