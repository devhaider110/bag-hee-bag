const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

/* =====================================================
   MODULE 20
   INVOICE & REPORT
===================================================== */

const invoiceRoutes =
  require("./routes/invoiceRoutes");

const reportRoutes =
  require("./routes/reportRoutes");

/* =====================================================
   AUTH & USER
===================================================== */

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

/* =====================================================
   CORE ROUTES
===================================================== */

const homeRoutes =
  require("./routes/homeRoutes");

const categoryRoutes =
  require("./routes/categoryRoutes");

const productRoutes =
  require("./routes/productRoutes");

const wishlistRoutes =
  require("./routes/wishlistRoutes");

const recentlyViewedRoutes =
  require("./routes/recentlyViewedRoutes");

const cartRoutes =
  require("./routes/cartRoutes");

const couponRoutes =
  require("./routes/couponRoutes");

const addressRoutes =
  require("./routes/addressRoutes");

const checkoutRoutes =
  require("./routes/checkoutRoutes");

const paymentRoutes =
  require("./routes/paymentRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const shippingRoutes =
  require("./routes/shippingRoutes");

const returnRoutes =
  require("./routes/returnRoutes");

const refundRoutes =
  require("./routes/refundRoutes");

const reviewRoutes =
  require("./routes/reviewRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

/* =====================================================
   ADMIN / MANAGEMENT ROUTES
===================================================== */

const customerRoutes =
  require("./routes/customerRoutes");

const inventoryRoutes =
  require("./routes/inventoryRoutes");

const adminDashboardRoutes =
  require("./routes/adminDashboardRoutes");

/* =====================================================
   MODULE 21
   BANNER & CONTENT
===================================================== */

const bannerRoutes =
  require("./routes/bannerRoutes");

/* =====================================================
   MODULE 22
   PHYSICAL STORE & OFFLINE
===================================================== */

const storeRoutes =
  require("./routes/storeRoutes");

const offlineSaleRoutes =
  require("./routes/offlineSaleRoutes");

/* =====================================================
   MODULE 23
   CONTACT & CUSTOMER SUPPORT
===================================================== */

const supportRoutes =
  require("./routes/supportRoutes");

/* =====================================================
   MODULE 24
   ADMIN, ROLES & SECURITY
===================================================== */

const adminSecurityRoutes =
  require("./routes/adminSecurityRoutes");

/* =====================================================
   MODULE 25
   SYSTEM SETTINGS & SEO
===================================================== */

const settingsRoutes =
  require("./routes/settingsRoutes");

const seoRoutes =
  require("./routes/seoRoutes");


const app = express();


/* =====================================================
   CORS
===================================================== */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS")
    );
  },
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};


/*
   IMPORTANT:
   CORS middleware must run before all API routes.
*/

app.use(
  cors(corsOptions)
);


/*
   Explicitly handle browser preflight requests.
   This is required for requests containing
   Authorization headers.
*/

app.options(
  /.* /,
  cors(corsOptions)
);


/* =====================================================
   BODY PARSERS
===================================================== */

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =====================================================
   MODULE 20
   INVOICE & REPORT
===================================================== */

app.use(
  "/api/invoices",
  invoiceRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);


/* =====================================================
   MODULE 21
   BANNER & CONTENT
===================================================== */

app.use(
  "/api/banners",
  bannerRoutes
);


/* =====================================================
   MODULE 24
   ADMIN SECURITY
===================================================== */

app.use(
  "/api/admin/security",
  adminSecurityRoutes
);


/* =====================================================
   MODULE 25
   SYSTEM SETTINGS
===================================================== */

app.use(
  "/api/settings",
  settingsRoutes
);


/* =====================================================
   MODULE 25
   SEO
===================================================== */

app.use(
  "/api/seo",
  seoRoutes
);


/* =====================================================
   AUTH ROUTES
===================================================== */

app.use(
  "/api/auth",
  authRoutes
);


/* =====================================================
   USER ROUTES
===================================================== */

app.use(
  "/api/user",
  userRoutes
);


/* =====================================================
   CORE ROUTES
===================================================== */

app.use(
  "/api/home",
  homeRoutes
);

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/recently-viewed",
  recentlyViewedRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/coupons",
  couponRoutes
);

app.use(
  "/api/addresses",
  addressRoutes
);

app.use(
  "/api/checkout",
  checkoutRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/shipping",
  shippingRoutes
);

app.use(
  "/api/returns",
  returnRoutes
);

app.use(
  "/api/refunds",
  refundRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);


/* =====================================================
   ADMIN / MANAGEMENT
===================================================== */

app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/inventory",
  inventoryRoutes
);


/* =====================================================
   MODULE 19
   ADMIN DASHBOARD
===================================================== */

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);


/* =====================================================
   MODULE 22
   PHYSICAL STORE & OFFLINE
===================================================== */

app.use(
  "/api/store",
  storeRoutes
);

app.use(
  "/api/offline-sales",
  offlineSaleRoutes
);


/* =====================================================
   MODULE 23
   CONTACT & CUSTOMER SUPPORT
===================================================== */

app.use(
  "/api/support",
  supportRoutes
);


/* =====================================================
   ROOT
===================================================== */

app.get(
  "/",
  (req, res) => {
    return res.status(200).json({
      message:
        "BAG HEE BAG API is running!",
    });
  }
);


/* =====================================================
   DATABASE
===================================================== */

connectDB();


/* =====================================================
   SERVER
===================================================== */

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);