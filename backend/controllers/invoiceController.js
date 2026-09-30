const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const User = require("../models/User");

const SHOP_DETAILS = {
  name: "BAG HEE BAG",
  tagline: "LUXURY • STYLE • EVERYDAY",
  address:
    "Kothari Milestone, Shop No. 2, S.V. Road, Malad West, Mumbai",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
};

const roundAmount = (value) => {
  return Number(
    Number(value || 0).toFixed(2)
  );
};

const createInvoiceNumber = () => {
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

  return `BHB-INV-${year}${month}${day}-${random}`;
};

const normalizeAddress = (address = {}) => {
  return {
    name: address.name || "",
    phone: address.phone || "",
    addressLine1:
      address.addressLine1 ||
      address.line1 ||
      address.address ||
      "",
    addressLine2:
      address.addressLine2 ||
      address.line2 ||
      "",
    city: address.city || "",
    state: address.state || "",
    postalCode:
      address.postalCode ||
      address.pincode ||
      address.zipCode ||
      "",
    country:
      address.country || "India",
  };
};

const getInvoiceStatus = (order) => {
  if (
    order.orderStatus === "REFUNDED" ||
    order.paymentStatus === "REFUNDED"
  ) {
    return "REFUNDED";
  }

  if (
    order.orderStatus === "CANCELLED"
  ) {
    return "CANCELLED";
  }

  if (
    order.paymentStatus === "PAID"
  ) {
    return "PAID";
  }

  return "GENERATED";
};

const buildInvoiceFromOrder = async (
  order
) => {
  if (!order) {
    throw new Error("Order not found.");
  }

  if (
    !order.user ||
    !mongoose.Types.ObjectId.isValid(
      order.user._id || order.user
    )
  ) {
    throw new Error(
      "Order customer information is invalid."
    );
  }

  const existingInvoice =
    await Invoice.findOne({
      order: order._id,
    });

  if (existingInvoice) {
    return existingInvoice;
  }

  const userId =
    order.user._id || order.user;

  const user =
    typeof order.user === "object" &&
    order.user.email !== undefined
      ? order.user
      : await User.findById(userId).lean();

  if (!user) {
    throw new Error(
      "Customer not found."
    );
  }

  const items = (
    order.orderItems || []
  ).map((item) => ({
    product:
      item.product || null,

    productName:
      item.productName ||
      "Product",

    productImage:
      item.productImage || "",

    variantId:
      item.variantId || null,

    variantName:
      item.variantName || "",

    sku:
      item.sku || "",

    quantity:
      Number(item.quantity || 0),

    price:
      roundAmount(item.price),

    discountPrice:
      roundAmount(
        item.discountPrice
      ),

    finalPrice:
      roundAmount(
        item.finalPrice ??
          item.discountPrice ??
          item.price
      ),

    total:
      roundAmount(
        item.total ??
          (
            Number(
              item.finalPrice ??
                item.discountPrice ??
                item.price ??
                0
            ) *
            Number(
              item.quantity || 0
            )
          )
      ),
  }));

  const taxRate =
    order.subtotal > 0
      ? roundAmount(
          (
            Number(order.tax || 0) /
            Number(
              order.subtotal || 1
            )
          ) *
            100
        )
      : 0;

  const invoice =
    await Invoice.create({
      invoiceNumber:
        createInvoiceNumber(),

      order: order._id,

      user: userId,

      customerSnapshot: {
        name: user.name || "",
        username:
          user.username || "",
        email: user.email || "",
        phone:
          user.phone ||
          user.mobile ||
          "",
      },

      billingAddress:
        normalizeAddress(
          order.shippingAddress
        ),

      shippingAddress:
        normalizeAddress(
          order.shippingAddress
        ),

      items,

      subtotal:
        roundAmount(order.subtotal),

      productDiscount:
        roundAmount(
          order.productDiscount
        ),

      couponCode:
        order.couponCode || "",

      couponDiscount:
        roundAmount(
          order.couponDiscount
        ),

      shippingCharge:
        roundAmount(
          order.shippingCharge
        ),

      tax:
        roundAmount(order.tax),

      taxRate,

      totalAmount:
        roundAmount(
          order.totalAmount
        ),

      paymentMethod:
        order.paymentMethod ||
        "COD",

      paymentStatus:
        order.paymentStatus ||
        "PENDING",

      orderStatus:
        order.orderStatus ||
        "PENDING",

      invoiceStatus:
        getInvoiceStatus(order),

      currency: "INR",

      issuedAt:
        order.createdAt ||
        new Date(),
    });

  return invoice;
};

/* =====================================================
   CUSTOMER - GET MY INVOICES
===================================================== */

const getMyInvoices = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      Number(req.query.page || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit || 10),
        1
      ),
      50
    );

    const skip =
      (page - 1) * limit;

    const filter = {
      user: req.user._id,
    };

    const [
      invoices,
      total,
    ] = await Promise.all([
      Invoice.find(filter)
        .sort({
          issuedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate(
          "order",
          "_id orderStatus paymentStatus totalAmount createdAt"
        )
        .lean(),

      Invoice.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,

      invoices,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get My Invoices Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load your invoices.",
    });
  }
};

/* =====================================================
   CUSTOMER - GET SINGLE INVOICE
===================================================== */

const getMyInvoiceByOrder = async (
  req,
  res
) => {
  try {
    const {
      orderId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: req.user._id,
      })
        .populate(
          "user",
          "name username email phone mobile"
        )
        .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    const invoice =
      await buildInvoiceFromOrder(
        order
      );

    res.status(200).json({
      success: true,

      shop: SHOP_DETAILS,

      invoice,
    });
  } catch (error) {
    console.error(
      "Get Invoice Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load invoice.",
    });
  }
};

/* =====================================================
   CUSTOMER - PRINT DATA
===================================================== */

const getInvoicePrintData = async (
  req,
  res
) => {
  try {
    const {
      orderId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: req.user._id,
      })
        .populate(
          "user",
          "name username email phone mobile"
        )
        .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    const invoice =
      await buildInvoiceFromOrder(
        order
      );

    res.status(200).json({
      success: true,
      shop: SHOP_DETAILS,
      invoice,
    });
  } catch (error) {
    console.error(
      "Invoice Print Data Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to prepare invoice.",
    });
  }
};

/* =====================================================
   ADMIN - GET ALL INVOICES
===================================================== */

const getAllInvoices = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      Number(req.query.page || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit || 20),
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const {
      search = "",
      status = "",
      paymentStatus = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const filter = {};

    if (status) {
      filter.invoiceStatus =
        status.toUpperCase();
    }

    if (paymentStatus) {
      filter.paymentStatus =
        paymentStatus.toUpperCase();
    }

    if (startDate || endDate) {
      filter.issuedAt = {};

      if (startDate) {
        const start =
          new Date(startDate);

        if (
          !Number.isNaN(
            start.getTime()
          )
        ) {
          start.setHours(
            0,
            0,
            0,
            0
          );

          filter.issuedAt.$gte =
            start;
        }
      }

      if (endDate) {
        const end =
          new Date(endDate);

        if (
          !Number.isNaN(
            end.getTime()
          )
        ) {
          end.setHours(
            23,
            59,
            59,
            999
          );

          filter.issuedAt.$lte =
            end;
        }
      }

      if (
        Object.keys(
          filter.issuedAt
        ).length === 0
      ) {
        delete filter.issuedAt;
      }
    }

    if (search.trim()) {
      const searchRegex =
        new RegExp(
          search.trim(),
          "i"
        );

      const users =
        await User.find({
          $or: [
            {
              name: searchRegex,
            },
            {
              username:
                searchRegex,
            },
            {
              email:
                searchRegex,
            },
          ],
        })
          .select("_id")
          .lean();

      const userIds =
        users.map(
          (user) => user._id
        );

      filter.$or = [
        {
          invoiceNumber:
            searchRegex,
        },
        {
          user: {
            $in: userIds,
          },
        },
      ];
    }

    const [
      invoices,
      total,
    ] = await Promise.all([
      Invoice.find(filter)
        .sort({
          issuedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate(
          "user",
          "name username email phone"
        )
        .populate(
          "order",
          "_id orderStatus paymentStatus totalAmount createdAt"
        )
        .lean(),

      Invoice.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,

      invoices,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get All Invoices Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load invoices.",
    });
  }
};

/* =====================================================
   ADMIN - GET SINGLE INVOICE
===================================================== */

const getAdminInvoiceByOrder =
  async (
    req,
    res
  ) => {
    try {
      const {
        orderId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID.",
        });
      }

      const order =
        await Order.findById(
          orderId
        )
          .populate(
            "user",
            "name username email phone mobile"
          )
          .lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      const invoice =
        await buildInvoiceFromOrder(
          order
        );

      res.status(200).json({
        success: true,

        shop: SHOP_DETAILS,

        invoice,
      });
    } catch (error) {
      console.error(
        "Get Admin Invoice Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load invoice.",
      });
    }
  };

module.exports = {
  getMyInvoices,
  getMyInvoiceByOrder,
  getInvoicePrintData,
  getAllInvoices,
  getAdminInvoiceByOrder,
};