const mongoose = require("mongoose");

const SupportTicket = require("../models/SupportTicket");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

const makeTicketNumber = () => {
  const now = new Date();

  const date =
    `${now.getFullYear()}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}`;

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `BHB-SUP-${date}-${random}`;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


/* =====================================================
   CUSTOMER
   CREATE TICKET
===================================================== */

const createSupportTicket = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      orderId,
      priority,
    } = req.body;

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, subject and message are required.",
      });
    }

    let order = null;

    if (orderId) {
      if (!isValidObjectId(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Order ID.",
        });
      }

      order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found for this account.",
        });
      }
    }

    const cleanMessage =
      String(message).trim();

    const ticket =
      await SupportTicket.create({
        ticketNumber: makeTicketNumber(),

        customer: req.user._id,

        name: String(name).trim(),

        email:
          String(email)
            .trim()
            .toLowerCase(),

        phone:
          String(phone || "").trim(),

        subject:
          String(subject).trim(),

        message: cleanMessage,

        order:
          order?._id || null,

        priority: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "URGENT",
        ].includes(priority)
          ? priority
          : "MEDIUM",

        messages: [
          {
            sender: req.user._id,
            senderRole: "customer",
            message: cleanMessage,
          },
        ],
      });

    return res.status(201).json({
      success: true,
      message:
        "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error(
      "Create support ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create support ticket.",
    });
  }
};


/* =====================================================
   CUSTOMER
   GET MY TICKETS
===================================================== */

const getMySupportTickets = async (
  req,
  res
) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const safePage =
      Math.max(Number(page) || 1, 1);

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 10,
          1
        ),
        50
      );

    const filter = {
      customer: req.user._id,
    };

    if (
      [
        "NEW",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ].includes(status)
    ) {
      filter.status = status;
    }

    const [
      tickets,
      total,
    ] = await Promise.all([
      SupportTicket.find(filter)
        .populate(
          "order",
          "_id orderStatus totalAmount createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit)
        .lean(),

      SupportTicket.countDocuments(
        filter
      ),
    ]);

    return res.json({
      success: true,

      tickets,

      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages:
          Math.ceil(
            total / safeLimit
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get my support tickets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load support tickets.",
    });
  }
};


/* =====================================================
   CUSTOMER
   GET SINGLE TICKET
===================================================== */

const getCustomerTicket = async (
  req,
  res
) => {
  try {
    const ticket =
      await SupportTicket.findOne({
        _id: req.params.id,
        customer: req.user._id,
      })
        .populate(
          "order",
          "_id orderStatus totalAmount createdAt"
        )
        .populate(
          "messages.sender",
          "name username role"
        )
        .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message:
          "Support ticket not found.",
      });
    }

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error(
      "Get customer support ticket error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load support ticket.",
    });
  }
};


/* =====================================================
   CUSTOMER
   ADD MESSAGE
===================================================== */

const addCustomerSupportMessage =
  async (req, res) => {
    try {
      const { message } =
        req.body;

      if (
        !message ||
        !String(message).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message is required.",
        });
      }

      const ticket =
        await SupportTicket.findOne({
          _id: req.params.id,
          customer: req.user._id,
        });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message:
            "Support ticket not found.",
        });
      }

      if (
        ticket.status === "CLOSED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This support ticket is closed.",
        });
      }

      ticket.messages.push({
        sender: req.user._id,
        senderRole: "customer",
        message:
          String(message).trim(),
      });

      ticket.lastRepliedAt =
        new Date();

      ticket.lastRepliedBy =
        req.user._id;

      if (
        ticket.status ===
        "RESOLVED"
      ) {
        ticket.status =
          "IN_PROGRESS";
      }

      await ticket.save();

      return res.json({
        success: true,
        message:
          "Reply added successfully.",
        ticket,
      });
    } catch (error) {
      console.error(
        "Customer support reply error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to add reply.",
      });
    }
  };


/* =====================================================
   ADMIN
   SUMMARY
===================================================== */

const getAdminSupportSummary =
  async (req, res) => {
    try {
      const [
        newCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        totalCount,
      ] = await Promise.all([
        SupportTicket.countDocuments({
          status: "NEW",
        }),

        SupportTicket.countDocuments({
          status: "IN_PROGRESS",
        }),

        SupportTicket.countDocuments({
          status: "RESOLVED",
        }),

        SupportTicket.countDocuments({
          status: "CLOSED",
        }),

        SupportTicket.countDocuments({}),
      ]);

      return res.json({
        success: true,

        summary: {
          total: totalCount,
          new: newCount,
          inProgress:
            inProgressCount,
          resolved:
            resolvedCount,
          closed:
            closedCount,
        },
      });
    } catch (error) {
      console.error(
        "Support summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load support summary.",
      });
    }
  };


/* =====================================================
   ADMIN
   GET TICKETS
===================================================== */

const getAdminSupportTickets =
  async (req, res) => {
    try {
      const {
        search = "",
        status,
        priority,
        page = 1,
        limit = 15,
      } = req.query;

      const safePage =
        Math.max(Number(page) || 1, 1);

      const safeLimit =
        Math.min(
          Math.max(
            Number(limit) || 15,
            1
          ),
          100
        );

      const filter = {};

      if (
        [
          "NEW",
          "IN_PROGRESS",
          "RESOLVED",
          "CLOSED",
        ].includes(status)
      ) {
        filter.status = status;
      }

      if (
        [
          "LOW",
          "MEDIUM",
          "HIGH",
          "URGENT",
        ].includes(priority)
      ) {
        filter.priority = priority;
      }

      if (
        String(search).trim()
      ) {
        const value =
          String(search).trim();

        filter.$or = [
          {
            ticketNumber: {
              $regex: value,
              $options: "i",
            },
          },
          {
            name: {
              $regex: value,
              $options: "i",
            },
          },
          {
            email: {
              $regex: value,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: value,
              $options: "i",
            },
          },
          {
            subject: {
              $regex: value,
              $options: "i",
            },
          },
        ];
      }

      const [
        tickets,
        total,
      ] = await Promise.all([
        SupportTicket.find(filter)
          .populate(
            "customer",
            "name username email phone"
          )
          .populate(
            "order",
            "_id orderStatus totalAmount paymentStatus createdAt"
          )
          .sort({
            createdAt: -1,
          })
          .skip(
            (safePage - 1) *
              safeLimit
          )
          .limit(safeLimit)
          .lean(),

        SupportTicket.countDocuments(
          filter
        ),
      ]);

      return res.json({
        success: true,

        tickets,

        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages:
            Math.ceil(
              total / safeLimit
            ),
        },
      });
    } catch (error) {
      console.error(
        "Admin support tickets error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load support tickets.",
      });
    }
  };


/* =====================================================
   ADMIN
   GET SINGLE TICKET
===================================================== */

const getAdminSupportTicket =
  async (req, res) => {
    try {
      const ticket =
        await SupportTicket.findById(
          req.params.id
        )
          .populate(
            "customer",
            "name username email phone"
          )
          .populate(
            "order",
            "_id orderStatus totalAmount paymentStatus shippingAddress createdAt"
          )
          .populate(
            "messages.sender",
            "name username role"
          )
          .lean();

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message:
            "Support ticket not found.",
        });
      }

      return res.json({
        success: true,
        ticket,
      });
    } catch (error) {
      console.error(
        "Admin support ticket details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load support ticket.",
      });
    }
  };


/* =====================================================
   ADMIN
   ADD REPLY
===================================================== */

const addAdminSupportMessage =
  async (req, res) => {
    try {
      const { message } =
        req.body;

      if (
        !message ||
        !String(message).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message is required.",
        });
      }

      const ticket =
        await SupportTicket.findById(
          req.params.id
        );

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message:
            "Support ticket not found.",
        });
      }

      if (
        ticket.status === "CLOSED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This support ticket is closed.",
        });
      }

      ticket.messages.push({
        sender: req.user._id,
        senderRole: "admin",
        message:
          String(message).trim(),
      });

      ticket.lastRepliedAt =
        new Date();

      ticket.lastRepliedBy =
        req.user._id;

      ticket.status =
        "IN_PROGRESS";

      await ticket.save();

      await Notification.create({
        user: ticket.customer,

        type: "SYSTEM",

        title:
          "Support ticket updated",

        message:
          `Admin replied to your support ticket ${ticket.ticketNumber}.`,

        icon: "🎧",

        link:
          `/support/tickets/${ticket._id}`,
      });

      return res.json({
        success: true,
        message:
          "Admin reply added successfully.",
        ticket,
      });
    } catch (error) {
      console.error(
        "Admin support reply error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to add admin reply.",
      });
    }
  };


/* =====================================================
   ADMIN
   UPDATE STATUS / PRIORITY / NOTES
===================================================== */

const updateAdminSupportTicket =
  async (req, res) => {
    try {
      const {
        status,
        priority,
        internalNotes,
      } = req.body;

      const ticket =
        await SupportTicket.findById(
          req.params.id
        );

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message:
            "Support ticket not found.",
        });
      }

      const allowedStatuses = [
        "NEW",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ];

      const allowedPriorities = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ];

      if (
        status !== undefined
      ) {
        if (
          !allowedStatuses.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid support ticket status.",
          });
        }

        ticket.status =
          status;
      }

      if (
        priority !== undefined
      ) {
        if (
          !allowedPriorities.includes(
            priority
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid support ticket priority.",
          });
        }

        ticket.priority =
          priority;
      }

      if (
        internalNotes !==
        undefined
      ) {
        ticket.internalNotes =
          String(
            internalNotes
          ).trim();
      }

      await ticket.save();

      await Notification.create({
        user: ticket.customer,

        type: "SYSTEM",

        title:
          "Support ticket status updated",

        message:
          `Your support ticket ${ticket.ticketNumber} is now ${ticket.status.replaceAll(
            "_",
            " "
          )}.`,

        icon: "🎧",

        link:
          `/support/tickets/${ticket._id}`,
      });

      return res.json({
        success: true,

        message:
          "Support ticket updated successfully.",

        ticket,
      });
    } catch (error) {
      console.error(
        "Update admin support ticket error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update support ticket.",
      });
    }
  };


module.exports = {
  createSupportTicket,
  getMySupportTickets,
  getCustomerTicket,
  addCustomerSupportMessage,

  getAdminSupportSummary,
  getAdminSupportTickets,
  getAdminSupportTicket,
  addAdminSupportMessage,
  updateAdminSupportTicket,
};