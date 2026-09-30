const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

/* =====================================================
   MODULE 19
   ADMIN DASHBOARD & ANALYTICS
===================================================== */

/*
  Revenue rule:

  Cancelled orders are excluded.

  Refunded orders are also excluded from revenue because
  the amount has effectively been returned to the customer.
*/
const REVENUE_EXCLUDED_STATUSES = ["CANCELLED", "REFUNDED"];

/*
  These statuses represent orders which are useful for
  sales/revenue analytics.
*/
const ACTIVE_ORDER_STATUSES = [
  "PENDING",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
  "CANCELLED",
];

/* =====================================================
   DATE HELPERS
===================================================== */

const getDateRange = (range = "30d", customStart, customEnd) => {
  const now = new Date();

  let startDate = new Date(now);
  let endDate = new Date(now);

  endDate.setHours(23, 59, 59, 999);

  if (range === "today") {
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate,
      endDate,
    };
  }

  if (range === "7d") {
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate,
      endDate,
    };
  }

  if (range === "30d") {
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate,
      endDate,
    };
  }

  if (range === "6m") {
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate,
      endDate,
    };
  }

  if (range === "1y") {
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate,
      endDate,
    };
  }

  if (range === "custom" && customStart) {
    const parsedStart = new Date(customStart);

    if (!Number.isNaN(parsedStart.getTime())) {
      startDate = parsedStart;
      startDate.setHours(0, 0, 0, 0);
    }

    if (customEnd) {
      const parsedEnd = new Date(customEnd);

      if (!Number.isNaN(parsedEnd.getTime())) {
        endDate = parsedEnd;
        endDate.setHours(23, 59, 59, 999);
      }
    }

    return {
      startDate,
      endDate,
    };
  }

  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  return {
    startDate,
    endDate,
  };
};

/* =====================================================
   NUMBER HELPERS
===================================================== */

const roundNumber = (value, decimals = 2) => {
  const number = Number(value || 0);

  return Number(number.toFixed(decimals));
};

/* =====================================================
   REVENUE MATCH
===================================================== */

const getRevenueMatch = (startDate, endDate) => {
  return {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },

    orderStatus: {
      $nin: REVENUE_EXCLUDED_STATUSES,
    },
  };
};

/* =====================================================
   SUMMARY
===================================================== */

const getDashboardSummary = async (req, res) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const { startDate, endDate } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const [
      totalCustomers,
      totalProducts,
      activeProducts,
      inactiveProducts,
      totalOrders,
      orderStatusCounts,
      revenueData,
      lowStockProducts,
      outOfStockProducts,
      totalUnitsData,
      newCustomers,
      previousRevenueData,
      previousOrders,
    ] = await Promise.all([
      User.countDocuments({
        role: "customer",
      }),

      Product.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      Product.countDocuments({
        isActive: false,
      }),

      Order.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }),

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
            _id: "$orderStatus",

            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: getRevenueMatch(
            startDate,
            endDate
          ),
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Product.countDocuments({
        isActive: true,

        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      Product.countDocuments({
        isActive: true,

        stock: {
          $lte: 0,
        },
      }),

      Product.aggregate([
        {
          $match: {
            isActive: true,
          },
        },

        {
          $group: {
            _id: null,

            totalUnits: {
              $sum: {
                $ifNull: ["$stock", 0],
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

      /*
        Previous period revenue.

        IMPORTANT:
        $lte MUST be inside createdAt.
        Keeping it at the $match top level causes:

        MongoServerError:
        unknown top level operator: $lte
      */
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                startDate.getTime() -
                  (endDate.getTime() -
                    startDate.getTime() +
                    1)
              ),

              $lte: new Date(
                startDate.getTime() - 1
              ),
            },

            orderStatus: {
              $nin: REVENUE_EXCLUDED_STATUSES,
            },
          },
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Order.countDocuments({
        createdAt: {
          $gte: new Date(
            startDate.getTime() -
              (endDate.getTime() -
                startDate.getTime() +
                1)
          ),

          $lte: new Date(
            startDate.getTime() - 1
          ),
        },
      }),
    ]);

    const revenue = roundNumber(
      revenueData?.[0]?.revenue || 0
    );

    const previousRevenue = roundNumber(
      previousRevenueData?.[0]?.revenue || 0
    );

    const revenueGrowth =
      previousRevenue === 0
        ? revenue > 0
          ? 100
          : 0
        : roundNumber(
            ((revenue - previousRevenue) /
              previousRevenue) *
              100
          );

    const orderGrowth =
      previousOrders === 0
        ? totalOrders > 0
          ? 100
          : 0
        : roundNumber(
            ((totalOrders - previousOrders) /
              previousOrders) *
              100
          );

    const statusMap = {};

    orderStatusCounts.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    res.status(200).json({
      success: true,

      range,

      dateRange: {
        startDate,
        endDate,
      },

      summary: {
        totalCustomers,

        totalProducts,

        activeProducts,

        inactiveProducts,

        totalOrders,

        totalRevenue: revenue,

        pendingOrders:
          (statusMap.PENDING || 0) +
          (statusMap.PLACED || 0),

        processingOrders:
          (statusMap.CONFIRMED || 0) +
          (statusMap.PROCESSING || 0),

        shippedOrders:
          (statusMap.SHIPPED || 0) +
          (statusMap.OUT_FOR_DELIVERY || 0),

        deliveredOrders:
          statusMap.DELIVERED || 0,

        cancelledOrders:
          statusMap.CANCELLED || 0,

        returnedOrders:
          (statusMap.RETURN_REQUESTED || 0) +
          (statusMap.RETURNED || 0),

        refundedOrders:
          statusMap.REFUNDED || 0,

        lowStockProducts,

        outOfStockProducts,

        totalUnits:
          totalUnitsData?.[0]?.totalUnits || 0,

        newCustomers,

        revenueGrowth,

        orderGrowth,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Summary Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load dashboard summary.",
    });
  }
};

/* =====================================================
   SALES ANALYTICS
===================================================== */

const getSalesAnalytics = async (req, res) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const { startDate, endDate } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const differenceInDays =
      Math.ceil(
        (endDate - startDate) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    /*
      For short periods use daily analytics.
      For 6 months / 1 year use monthly analytics.
    */

    const groupByMonth =
      range === "6m" ||
      range === "1y" ||
      differenceInDays > 90;

    const dateFormat = groupByMonth
      ? "%Y-%m"
      : "%Y-%m-%d";

    const sales = await Order.aggregate([
      {
        $match: getRevenueMatch(
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
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },

          items: {
            $sum: {
              $reduce: {
                input: "$orderItems",

                initialValue: 0,

                in: {
                  $add: [
                    "$$value",

                    {
                      $ifNull: [
                        "$$this.quantity",
                        0,
                      ],
                    },
                  ],
                },
              },
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

    const formattedSales = sales.map(
      (item) => ({
        date: item._id,

        revenue: roundNumber(
          item.revenue
        ),

        orders: item.orders,

        items: item.items,
      })
    );

    res.status(200).json({
      success: true,

      range,

      dateRange: {
        startDate,
        endDate,
      },

      groupBy: groupByMonth
        ? "month"
        : "day",

      sales: formattedSales,
    });
  } catch (error) {
    console.error(
      "Sales Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load sales analytics.",
    });
  }
};

/* =====================================================
   ORDER STATUS ANALYTICS
===================================================== */

const getOrderAnalytics = async (req, res) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const { startDate, endDate } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const analytics = await Order.aggregate([
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
          _id: "$orderStatus",

          count: {
            $sum: 1,
          },

          amount: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const orders = analytics.map(
      (item) => ({
        status: item._id,

        count: item.count,

        amount: roundNumber(
          item.amount
        ),
      })
    );

    res.status(200).json({
      success: true,

      range,

      orders,
    });
  } catch (error) {
    console.error(
      "Order Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load order analytics.",
    });
  }
};

/* =====================================================
   TOP PRODUCTS
===================================================== */

const getProductAnalytics = async (req, res) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const { startDate, endDate } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const products = await Order.aggregate([
      {
        $match: getRevenueMatch(
          startDate,
          endDate
        ),
      },

      {
        $unwind: "$orderItems",
      },

      {
        $group: {
          _id: "$orderItems.product",

          productName: {
            $first:
              "$orderItems.productName",
          },

          productImage: {
            $first:
              "$orderItems.productImage",
          },

          quantity: {
            $sum:
              "$orderItems.quantity",
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

                "$orderItems.quantity",
              ],
            },
          },
        },
      },

      {
        $sort: {
          quantity: -1,
          revenue: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,

      range,

      products: products.map(
        (product) => ({
          productId: product._id,

          name:
            product.productName ||
            "Unnamed Product",

          image:
            product.productImage || "",

          quantity:
            product.quantity || 0,

          revenue:
            roundNumber(
              product.revenue
            ),
        })
      ),
    });
  } catch (error) {
    console.error(
      "Product Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load product analytics.",
    });
  }
};

/* =====================================================
   CATEGORY ANALYTICS
===================================================== */

const getCategoryAnalytics = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const { startDate, endDate } = getDateRange(
      range,
      customStart,
      customEnd
    );

    const categories = await Order.aggregate([
      {
        $match: getRevenueMatch(
          startDate,
          endDate
        ),
      },

      {
        $unwind: "$orderItems",
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

          preserveNullAndEmptyArrays: true,
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

          preserveNullAndEmptyArrays: true,
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
            $sum:
              "$orderItems.quantity",
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

                "$orderItems.quantity",
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
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,

      range,

      categories: categories.map(
        (category) => ({
          categoryId:
            category._id,

          name:
            category.name,

          quantity:
            category.quantity || 0,

          revenue:
            roundNumber(
              category.revenue
            ),
        })
      ),
    });
  } catch (error) {
    console.error(
      "Category Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load category analytics.",
    });
  }
};

/* =====================================================
   CUSTOMER GROWTH
===================================================== */

const getCustomerAnalytics = async (
  req,
  res
) => {
  try {
    const {
      range = "30d",
      startDate: customStart,
      endDate: customEnd,
    } = req.query;

    const { startDate, endDate } = getDateRange(
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

    const dateFormat = groupByMonth
      ? "%Y-%m"
      : "%Y-%m-%d";

    const customers = await User.aggregate([
      {
        $match: {
          role: "customer",

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$createdAt",
            },
          },

          customers: {
            $sum: 1,
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

      groupBy: groupByMonth
        ? "month"
        : "day",

      customers: customers.map(
        (item) => ({
          date: item._id,

          customers:
            item.customers,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Customer Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load customer analytics.",
    });
  }
};

/* =====================================================
   RECENT ACTIVITY
===================================================== */

const getDashboardActivity = async (
  req,
  res
) => {
  try {
    const [
      recentOrders,
      recentCustomers,
      recentProducts,
    ] = await Promise.all([
      Order.find()
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .select(
          "_id orderStatus totalAmount paymentStatus createdAt user"
        )
        .populate(
          "user",
          "name username email"
        )
        .lean(),

      User.find({
        role: "customer",
      })
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .select(
          "_id name username email createdAt"
        )
        .lean(),

      Product.find()
        .sort({
          createdAt: -1,
        })
        .limit(8)
        .select(
          "_id name price discountPrice stock createdAt isActive"
        )
        .lean(),
    ]);

    const activities = [];

    recentOrders.forEach((order) => {
      activities.push({
        id: `order-${order._id}`,

        type: "order",

        title: "New order activity",

        description: `${
          order.user?.name ||
          order.user?.username ||
          "Customer"
        } placed an order.`,

        status:
          order.orderStatus,

        amount:
          roundNumber(
            order.totalAmount
          ),

        createdAt:
          order.createdAt,
      });
    });

    recentCustomers.forEach(
      (customer) => {
        activities.push({
          id: `customer-${customer._id}`,

          type: "customer",

          title:
            "New customer registered",

          description:
            `${
              customer.name ||
              customer.username ||
              "Customer"
            } joined BHB.`,

          status: "NEW",

          createdAt:
            customer.createdAt,
        });
      }
    );

    recentProducts.forEach(
      (product) => {
        activities.push({
          id: `product-${product._id}`,

          type: "product",

          title:
            "Product added",

          description:
            `${product.name} was added to the store.`,

          status:
            product.isActive
              ? "ACTIVE"
              : "INACTIVE",

          createdAt:
            product.createdAt,
        });
      }
    );

    activities.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,

      activities:
        activities.slice(0, 15),
    });
  } catch (error) {
    console.error(
      "Dashboard Activity Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load recent activity.",
    });
  }
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  getDashboardSummary,
  getSalesAnalytics,
  getOrderAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getCustomerAnalytics,
  getDashboardActivity,
};