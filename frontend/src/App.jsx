import { useEffect, useState } from "react";

// ==============================
// PUBLIC / CUSTOMER PAGES
// ==============================

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/admin/Categories";
import Products from "./pages/admin/Products";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Account from "./pages/account/Account";

import Contact from "./pages/Contact";
import Offers from "./pages/Offers";
// ==============================
// CUSTOMER ACCOUNT / SHOPPING
// ==============================

import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Coupons from "./pages/admin/Coupons";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";

import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";

import ReturnRequest from "./pages/ReturnRequest";
import RefundStatus from "./pages/RefundStatus";

import MyReviews from "./pages/MyReviews";
import Notifications from "./pages/Notifications";

import MyInvoices from "./pages/MyInvoices";
import Invoice from "./pages/Invoice";

// ==============================
// CUSTOMER SUPPORT
// ==============================

import MySupportTickets from "./pages/MySupportTickets";
import SupportTicketDetails from "./pages/SupportTicketDetails";
import SupportTickets from "./pages/SupportTickets";

// ==============================
// ADMIN PAGES - ADMIN FOLDER
// ==============================

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminReports from "./pages/admin/AdminReports";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminPhysicalStore from "./pages/admin/AdminPhysicalStore";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSupportDetails from "./pages/admin/AdminSupportDetails";

// ==============================
// MODULE 24 — ADMIN SECURITY
// ==============================

import AdminSecurity from "./pages/admin/AdminSecurity";

// ==============================
// ADMIN PAGES - ROOT PAGES FOLDER
// ==============================

import AdminCustomers from "./pages/AdminCustomers";
import AdminCustomerDetails from "./pages/AdminCustomerDetails";

import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";

import AdminRefunds from "./pages/AdminRefunds";
import AdminReturns from "./pages/AdminReturns";
import AdminReturnDetails from "./pages/AdminReturnDetails";

// ==============================
// COMPONENTS
// ==============================

import HomeBanner from "./components/HomeBanner";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSEO from "./pages/admin/AdminSEO";
import Footer from "./components/Footer";

// =====================================================
// APP
// =====================================================

function App() {
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  // ===================================================
  // CUSTOM NAVIGATION
  // ===================================================

  const navigate = (path) => {
    window.history.pushState({}, "", path);

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  };

  // ===================================================
  // CURRENT PATH
  // ===================================================

  const path = currentPath;

  /* =====================================================
     MODULE 25
     SYSTEM SETTINGS & SEO
  ===================================================== */

  if (path === "/admin/settings") {
    return (
      <ProtectedAdminRoute>
        <>
          <Navbar />
          <AdminSettings />
        </>
      </ProtectedAdminRoute>
    );
  }

  if (path === "/admin/seo") {
    return (
      <ProtectedAdminRoute>
        <>
          <Navbar />
          <AdminSEO />
        </>
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // MODULE 24
  // ADMIN SECURITY
  // ===================================================

  if (path === "/admin/security") {
    return (
      <ProtectedAdminRoute permission="security">
        <>
          <Navbar navigate={navigate} />

          <AdminSecurity
            navigate={navigate}
          />
        </>
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // AUTH PAGES
  // ===================================================

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  // ===================================================
  // HOME
  // ===================================================

  if (path === "/") {
    return (
      <>
        <Navbar navigate={navigate} />

        <HomeBanner />

        <Home navigate={navigate} />
      </>
    );
  }

  // ===================================================
  // SHOP
  // ===================================================

  if (path === "/shop") {
    return (
      <>
        <Navbar navigate={navigate} />

        <Shop navigate={navigate} />
      </>
    );
  }
  // ===================================================
  // OFFERS
  // ===================================================
  // ===================================================
  // OFFERS
  // ===================================================

  if (path === "/offers") {
    return (
      <>
        <Navbar navigate={navigate} />

        <Offers
          navigate={navigate}
        />
      </>
    );
  }
  // ===================================================
  // CATEGORY SHOP
  //
  // /bags/ladies
  // /bags/men
  // /bags/travel
  // /bags/school-college
  // /bags/wedding-party
  // ===================================================

  if (path.startsWith("/bags/")) {
    const categorySlug =
      path.split("/")[2] || "";

    return (
      <>
        <Navbar navigate={navigate} />

        <Shop
          categorySlug={categorySlug}
          navigate={navigate}
        />
      </>
    );
  }

  // ===================================================
  // PRODUCT DETAILS
  // /product/:id
  // ===================================================

  if (path.startsWith("/product/")) {
    const productId =
      path.split("/")[2];

    return (
      <>
        <Navbar navigate={navigate} />

        <ProductDetails
          productId={productId}
          navigate={navigate}
        />
      </>
    );
  }

  // ===================================================
  // CONTACT
  // ===================================================

  if (path === "/contact") {
    return (
      <>
        <Navbar navigate={navigate} />

        <Contact
          navigate={navigate}
        />
      </>
    );
  }

  // ===================================================
  // CUSTOMER ACCOUNT
  // ===================================================

  if (path === "/account") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Account
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // WISHLIST
  // ===================================================

  if (path === "/wishlist") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Wishlist
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CART
  // ===================================================

  if (path === "/cart") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Cart
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // ADDRESSES
  // ===================================================

  if (path === "/addresses") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Addresses
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CHECKOUT
  // ===================================================

  if (path === "/checkout") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Checkout
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // ORDER SUCCESS
  // /order-success
  // /order-success/:id
  // ===================================================

  if (
    path === "/order-success" ||
    path.startsWith("/order-success/")
  ) {
    const orderId =
      path.split("/")[2];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <OrderSuccess
          orderId={orderId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER ORDERS
  // ===================================================

  if (path === "/orders") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <MyOrders
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER ORDER DETAILS
  // /orders/:id
  // ===================================================

  if (path.startsWith("/orders/")) {
    const orderId =
      path.split("/")[2];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <OrderDetails
          orderId={orderId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // ORDER TRACKING
  // /order-tracking/:id
  // ===================================================

  if (path.startsWith("/order-tracking/")) {
    const orderId =
      path.split("/")[2];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <OrderTracking
          orderId={orderId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // RETURN REQUEST
  // /return-request/:id
  // ===================================================

  if (path.startsWith("/return-request/")) {
    const orderId =
      path.split("/")[2];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <ReturnRequest
          orderId={orderId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // REFUND STATUS
  // /refund-status/:id
  // ===================================================

  if (path.startsWith("/refund-status/")) {
    const orderId =
      path.split("/")[2];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <RefundStatus
          orderId={orderId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER REVIEWS
  // ===================================================

  if (path === "/reviews") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <MyReviews
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER NOTIFICATIONS
  // ===================================================

  if (path === "/notifications") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Notifications
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER INVOICES
  // ===================================================

  if (path === "/invoices") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <MyInvoices
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER INVOICE DETAILS
  // /invoice/:id
  // ===================================================

  if (path.startsWith("/invoice/")) {
    const invoiceId =
      path.split("/")[2];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <Invoice
          invoiceId={invoiceId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER SUPPORT TICKETS
  // ===================================================

  if (path === "/support/tickets") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <MySupportTickets
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // CUSTOMER SUPPORT TICKET DETAILS
  // /support/tickets/:id
  // ===================================================

  if (path.startsWith("/support/tickets/")) {
    const ticketId =
      path.split("/")[3];

    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <SupportTicketDetails
          ticketId={ticketId}
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // ===================================================
  // SUPPORT FALLBACK
  // ===================================================

  if (path === "/support") {
    return (
      <ProtectedRoute>
        <Navbar navigate={navigate} />

        <SupportTickets
          navigate={navigate}
        />
      </ProtectedRoute>
    );
  }

  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  if (path === "/admin") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminDashboard
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN CATEGORY MANAGEMENT
  // ===================================================

  if (path === "/admin/categories") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <Categories
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN COUPONS & OFFERS
  // ===================================================

  if (path === "/admin/coupons") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <Coupons
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN PRODUCTS
  // ===================================================

  if (path === "/admin/products") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminProducts
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN CUSTOMERS
  // ===================================================

  if (path === "/admin/customers") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminCustomers
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN CUSTOMER DETAILS
  // /admin/customers/:id
  // ===================================================

  if (path.startsWith("/admin/customers/")) {
    const customerId =
      path.split("/")[3];

    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminCustomerDetails
          customerId={customerId}
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN ORDERS
  // ===================================================

  if (path === "/admin/orders") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminOrders
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN ORDER DETAILS
  // /admin/orders/:id
  // ===================================================

  if (path.startsWith("/admin/orders/")) {
    const orderId =
      path.split("/")[3];

    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminOrderDetails
          orderId={orderId}
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN INVENTORY
  // ===================================================

  if (path === "/admin/inventory") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminInventory
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN REFUNDS
  // ===================================================

  if (path === "/admin/refunds") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminRefunds
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN RETURNS
  // ===================================================

  if (path === "/admin/returns") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminReturns
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN RETURN DETAILS
  // /admin/returns/:id
  // ===================================================

  if (path.startsWith("/admin/returns/")) {
    const returnId =
      path.split("/")[3];

    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminReturnDetails
          returnId={returnId}
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN INVOICES
  // ===================================================

  if (path === "/admin/invoices") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminInvoices
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN REPORTS
  // ===================================================

  if (path === "/admin/reports") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminReports
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN BANNERS
  // ===================================================

  if (path === "/admin/banners") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminBanners
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN PHYSICAL STORE
  // ===================================================

  if (path === "/admin/physical-store") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminPhysicalStore
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN REVIEWS
  // ===================================================

  if (path === "/admin/reviews") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminReviews
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN SUPPORT
  // ===================================================

  if (path === "/admin/support") {
    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminSupport
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // ADMIN SUPPORT DETAILS
  // /admin/support/:id
  // ===================================================

  if (path.startsWith("/admin/support/")) {
    const ticketId =
      path.split("/")[3];

    return (
      <ProtectedAdminRoute>
        <Navbar navigate={navigate} />

        <AdminSupportDetails
          ticketId={ticketId}
          navigate={navigate}
        />
      </ProtectedAdminRoute>
    );
  }

  // ===================================================
  // FALLBACK
  // ===================================================

  return (
    <>
      <Navbar navigate={navigate} />

      <Home
        navigate={navigate}
      />
    </>
  );
}

export default App;