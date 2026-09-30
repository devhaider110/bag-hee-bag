const express = require("express");

const {
  createSupportTicket,
  getMySupportTickets,
  getCustomerTicket,
  addCustomerSupportMessage,

  getAdminSupportSummary,
  getAdminSupportTickets,
  getAdminSupportTicket,
  addAdminSupportMessage,
  updateAdminSupportTicket,
} = require("../controllers/supportController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();


/* =====================================================
   CUSTOMER SUPPORT
===================================================== */

router.post(
  "/tickets",
  protect,
  createSupportTicket
);

router.get(
  "/tickets",
  protect,
  getMySupportTickets
);

router.get(
  "/tickets/:id",
  protect,
  getCustomerTicket
);

router.post(
  "/tickets/:id/messages",
  protect,
  addCustomerSupportMessage
);


/* =====================================================
   ADMIN SUPPORT
===================================================== */

router.get(
  "/admin/summary",
  protect,
  adminOnly,
  getAdminSupportSummary
);

router.get(
  "/admin/tickets",
  protect,
  adminOnly,
  getAdminSupportTickets
);

router.get(
  "/admin/tickets/:id",
  protect,
  adminOnly,
  getAdminSupportTicket
);

router.post(
  "/admin/tickets/:id/messages",
  protect,
  adminOnly,
  addAdminSupportMessage
);

router.patch(
  "/admin/tickets/:id",
  protect,
  adminOnly,
  updateAdminSupportTicket
);


module.exports = router;