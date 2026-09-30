import Products from "./Products";

/*
=====================================================
MODULE 3 - PRODUCT MANAGEMENT
=====================================================

This file is a compatibility wrapper for App.jsx.

The actual Product Management implementation
already exists in:

./Products.jsx

App.jsx can safely import:

import AdminProducts from "./pages/admin/AdminProducts";

without creating a second Product Management page.
=====================================================
*/

export default function AdminProducts() {
  return <Products />;
}