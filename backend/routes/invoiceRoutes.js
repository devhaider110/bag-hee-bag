const express = require("express");

const {
  getMyInvoices,
  getMyInvoiceByOrder,
  getInvoicePrintData,
  getAllInvoices,
  getAdminInvoiceByOrder,
} = require("../controllers/invoiceController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN INVOICE ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/list",
  protect,
  adminOnly,
  getAllInvoices
);

router.get(
  "/admin/:orderId",
  protect,
  adminOnly,
  getAdminInvoiceByOrder
);

/*
|--------------------------------------------------------------------------
| CUSTOMER INVOICE ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getMyInvoices
);

router.get(
  "/:orderId/print",
  protect,
  getInvoicePrintData
);

router.get(
  "/:orderId",
  protect,
  getMyInvoiceByOrder
);

module.exports = router;