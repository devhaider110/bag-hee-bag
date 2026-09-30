const Order = require("../models/Order");
const User = require("../models/User");

const REVENUE_EXCLUDED_STATUSES = [
  "CANCELLED",
  "REFUNDED",
];

const roundAmount = (value) => {
  return Number(
    Number(value || 0).toFixed(2)
  );
};

const getDateRange = (
  range = "30d",
  customStart,
  customEnd
) => {
  const now = new Date();

  let startDate = new Date(now);
  let endDate = new Date(now);

  endDate.setHours(
    23,
    59,
    59,
    999
  );

  if (range === "today") {
    startDate.setHours(
      0,
      0,
      0,
      0
    );

    return {
      startDate,
      endDate,
    };
  }

  if (range === "7d") {
    startDate.setDate(
      startDate.getDate() - 6
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    return {
      startDate,
      endDate,
    };
  }

  if (range === "30d") {
    startDate.setDate(
      startDate.getDate() - 29
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    return {
      startDate,
      endDate,
    };
  }

  if (range === "6m") {
    startDate.setMonth(
      startDate.getMonth() - 5
    );

    startDate.setDate(1);

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    return {
      startDate,
      endDate,
    };
  }

  if (range === "1y") {
    startDate.setFullYear(
      startDate.getFullYear() - 1
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    return {
      startDate,
      endDate,
    };
  }

  if (
    range === "custom" &&
    customStart
  ) {
    const parsedStart =
      new Date(customStart);

    if (
      !Number.isNaN(
        parsedStart.getTime()
      )
    ) {
      startDate = parsedStart;

      startDate.setHours(
        0,
        0,
        0,
        0
      );
    }

    if (customEnd) {
      const parsedEnd =
        new Date(customEnd);

      if (
        !Number.isNaN(
          parsedEnd.getTime()
        )
      ) {
        endDate = parsedEnd;

        endDate.setHours(
          23,
          59,
          59,
          999
        );
      }
    }

    return {
      startDate,
      endDate,
    };
  }

  startDate.setDate(
    startDate.getDate() - 29
  );

  startDate.setHours(
    0,
    0,
    0,
    0
  );

  return {
    startDate,
    endDate,
  };
};

const getRevenueMatch = (
  startDate,
  endDate
) => {
  return {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },

    orderStatus: {
      $nin:
        REVENUE_EXCLUDED_STATUSES,
    },
  };
};

/* =====================================================
   REPORT SUMMARY
===================================================== */

const getReportSummary = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const [
      revenueData,
      orderData,
      discountData,
      taxData,
      shippingData,
      customers,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: {
                $ifNull: [
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },

        {
          $group: {
            _id: null,

            orders: {
              $sum: 1,
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $group: {
            _id: null,

            productDiscount: {
              $sum: {
                $ifNull: [
                  "$productDiscount",
                  0,
                ],
              },
            },

            couponDiscount: {
              $sum: {
                $ifNull: [
                  "$couponDiscount",
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $group: {
            _id: null,

            tax: {
              $sum: {
                $ifNull: [
                  "$tax",
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $group: {
            _id: null,

            shipping: {
              $sum: {
                $ifNull: [
                  "$shippingCharge",
                  0,
                ],
              },
            },
          },
        },
      ]),

      User.countDocuments({
        role: "customer",

        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }),
    ]);

    const revenue =
      revenueData?.[0]
        ?.revenue || 0;

    const orders =
      orderData?.[0]?.orders || 0;

    const productDiscount =
      discountData?.[0]
        ?.productDiscount || 0;

    const couponDiscount =
      discountData?.[0]
        ?.couponDiscount || 0;

    const tax =
      taxData?.[0]?.tax || 0;

    const shipping =
      shippingData?.[0]
        ?.shipping || 0;

    res.status(200).json({
      success: true,

      range,

      dateRange: {
        startDate,
        endDate,
      },

      summary: {
        revenue:
          roundAmount(revenue),

        orders,

        averageOrderValue:
          orders > 0
            ? roundAmount(
                revenue / orders
              )
            : 0,

        productDiscount:
          roundAmount(
            productDiscount
          ),

        couponDiscount:
          roundAmount(
            couponDiscount
          ),

        totalDiscount:
          roundAmount(
            Number(
              productDiscount
            ) +
              Number(
                couponDiscount
              )
          ),

        taxCollected:
          roundAmount(tax),

        shippingRevenue:
          roundAmount(shipping),

        newCustomers:
          customers,
      },
    });
  } catch (error) {
    console.error(
      "Report Summary Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load report summary.",
    });
  }
};

/* =====================================================
   SALES REPORT
===================================================== */

const getSalesReport = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const differenceInDays =
      Math.ceil(
        (endDate - startDate) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const groupByMonth =
      range === "6m" ||
      range === "1y" ||
      differenceInDays > 90;

    const dateFormat =
      groupByMonth
        ? "%Y-%m"
        : "%Y-%m-%d";

    const sales =
      await Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$createdAt",
              },
            },

            revenue: {
              $sum: {
                $ifNull: [
                  "$totalAmount",
                  0,
                ],
              },
            },

            orders: {
              $sum: 1,
            },

            tax: {
              $sum: {
                $ifNull: [
                  "$tax",
                  0,
                ],
              },
            },

            shipping: {
              $sum: {
                $ifNull: [
                  "$shippingCharge",
                  0,
                ],
              },
            },

            discounts: {
              $sum: {
                $add: [
                  {
                    $ifNull: [
                      "$productDiscount",
                      0,
                    ],
                  },

                  {
                    $ifNull: [
                      "$couponDiscount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]);

    res.status(200).json({
      success: true,

      range,

      groupBy:
        groupByMonth
          ? "month"
          : "day",

      sales: sales.map(
        (item) => ({
          date: item._id,

          revenue:
            roundAmount(
              item.revenue
            ),

          orders:
            item.orders || 0,

          tax:
            roundAmount(
              item.tax
            ),

          shipping:
            roundAmount(
              item.shipping
            ),

          discounts:
            roundAmount(
              item.discounts
            ),
        })
      ),
    });
  } catch (error) {
    console.error(
      "Sales Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load sales report.",
    });
  }
};

/* =====================================================
   PRODUCT REPORT
===================================================== */

const getProductReport = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const products =
      await Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $unwind:
            "$orderItems",
        },

        {
          $group: {
            _id:
              "$orderItems.product",

            name: {
              $first:
                "$orderItems.productName",
            },

            sku: {
              $first:
                "$orderItems.sku",
            },

            image: {
              $first:
                "$orderItems.productImage",
            },

            quantity: {
              $sum: {
                $ifNull: [
                  "$orderItems.quantity",
                  0,
                ],
              },
            },

            revenue: {
              $sum: {
                $multiply: [
                  {
                    $ifNull: [
                      "$orderItems.finalPrice",
                      "$orderItems.price",
                    ],
                  },

                  {
                    $ifNull: [
                      "$orderItems.quantity",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },

        {
          $limit: 50,
        },
      ]);

    res.status(200).json({
      success: true,

      range,

      products:
        products.map(
          (product) => ({
            productId:
              product._id,

            name:
              product.name ||
              "Unnamed Product",

            sku:
              product.sku || "",

            image:
              product.image || "",

            quantity:
              product.quantity || 0,

            revenue:
              roundAmount(
                product.revenue
              ),
          })
        ),
    });
  } catch (error) {
    console.error(
      "Product Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load product report.",
    });
  }
};

/* =====================================================
   CATEGORY REPORT
===================================================== */

const getCategoryReport = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const categories =
      await Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $unwind:
            "$orderItems",
        },

        {
          $lookup: {
            from: "products",

            localField:
              "orderItems.product",

            foreignField: "_id",

            as: "product",
          },
        },

        {
          $unwind: {
            path: "$product",

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $lookup: {
            from: "categories",

            localField:
              "product.category",

            foreignField: "_id",

            as: "category",
          },
        },

        {
          $unwind: {
            path: "$category",

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $group: {
            _id:
              "$category._id",

            name: {
              $first: {
                $ifNull: [
                  "$category.name",
                  "Uncategorized",
                ],
              },
            },

            quantity: {
              $sum: {
                $ifNull: [
                  "$orderItems.quantity",
                  0,
                ],
              },
            },

            revenue: {
              $sum: {
                $multiply: [
                  {
                    $ifNull: [
                      "$orderItems.finalPrice",
                      "$orderItems.price",
                    ],
                  },

                  {
                    $ifNull: [
                      "$orderItems.quantity",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },

        {
          $sort: {
            revenue: -1,
          },
        },
      ]);

    res.status(200).json({
      success: true,

      range,

      categories:
        categories.map(
          (category) => ({
            categoryId:
              category._id,

            name:
              category.name,

            quantity:
              category.quantity ||
              0,

            revenue:
              roundAmount(
                category.revenue
              ),
          })
        ),
    });
  } catch (error) {
    console.error(
      "Category Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load category report.",
    });
  }
};

/* =====================================================
   CUSTOMER REPORT
===================================================== */

const getCustomerReport = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const {
      startDate,
      endDate,
    } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const customers =
      await Order.aggregate([
        {
          $match:
            getRevenueMatch(
              startDate,
              endDate
            ),
        },

        {
          $group: {
            _id: "$user",

            orders: {
              $sum: 1,
            },

            spending: {
              $sum: {
                $ifNull: [
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            spending: -1,
          },
        },

        {
          $limit: 50,
        },

        {
          $lookup: {
            from: "users",

            localField: "_id",

            foreignField: "_id",

            as: "user",
          },
        },

        {
          $unwind: {
            path: "$user",

            preserveNullAndEmptyArrays:
              true,
          },
        },
      ]);

    res.status(200).json({
      success: true,

      range,

      customers:
        customers.map(
          (customer) => ({
            customerId:
              customer._id,

            name:
              customer.user?.name ||
              customer.user
                ?.username ||
              "Customer",

            email:
              customer.user
                ?.email || "",

            orders:
              customer.orders || 0,

            spending:
              roundAmount(
                customer.spending
              ),

            averageOrderValue:
              customer.orders > 0
                ? roundAmount(
                    customer.spending /
                      customer.orders
                  )
                : 0,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Customer Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load customer report.",
    });
  }
};

module.exports = {
  getReportSummary,
  getSalesReport,
  getProductReport,
  getCategoryReport,
  getCustomerReport,
};