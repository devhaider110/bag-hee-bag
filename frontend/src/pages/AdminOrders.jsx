import { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../services/orderService";

const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "DELIVERED":
    case "PAID":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

    case "SHIPPED":
    case "PROCESSING":
    case "CONFIRMED":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";

    case "CANCELLED":
    case "FAILED":
    case "REFUNDED":
      return "bg-red-500/15 text-red-400 border-red-500/30";

    case "RETURN_REQUESTED":
    case "RETURNED":
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";

    default:
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  }
};

const getOrderId = (order) => {
  return order?._id || order?.id || "";
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllOrders({
        search: search.trim(),
        orderStatus: orderStatusFilter,
        paymentStatus: paymentStatusFilter,
        page,
        limit: 10,
      });

      const fetchedOrders =
        response?.orders ||
        response?.data?.orders ||
        response?.data ||
        [];

      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);

      const fetchedPagination =
        response?.pagination ||
        response?.data?.pagination ||
        {};

      setPagination({
        page: Number(fetchedPagination.page || page),
        pages: Number(fetchedPagination.pages || 1),
        total: Number(fetchedPagination.total || fetchedOrders.length || 0),
      });
    } catch (err) {
      console.error("Admin orders error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load orders."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadOrders();
      } else {
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleViewOrder = (order) => {
    const orderId = getOrderId(order);

    // IMPORTANT:
    // Never navigate using "/admin/orders/orders".
    // Only the actual MongoDB order _id is allowed here.
    if (!orderId) {
      setError("This order does not have a valid order ID.");
      return;
    }

    navigate(`/admin/orders/${orderId}`);
  };

  const handleOrderStatusChange = async (order, newStatus) => {
    const orderId = getOrderId(order);

    if (!orderId || !newStatus) return;

    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await updateOrderStatus(orderId, newStatus);

      const updatedOrder =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        null;

      setOrders((prevOrders) =>
        prevOrders.map((item) => {
          if (getOrderId(item) !== orderId) {
            return item;
          }

          return {
            ...item,
            ...(updatedOrder || {}),
            orderStatus: newStatus,
          };
        })
      );
    } catch (err) {
      console.error("Update order status error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusChange = async (order, newStatus) => {
    const orderId = getOrderId(order);

    if (!orderId || !newStatus) return;

    try {
      setUpdatingPaymentId(orderId);
      setError("");

      const response = await updatePaymentStatus(orderId, newStatus);

      const updatedOrder =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        null;

      setOrders((prevOrders) =>
        prevOrders.map((item) => {
          if (getOrderId(item) !== orderId) {
            return item;
          }

          return {
            ...item,
            ...(updatedOrder || {}),
            paymentStatus: newStatus,
          };
        })
      );
    } catch (err) {
      console.error("Update payment status error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update payment status."
      );
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.pages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-500/80 mb-2">
              BAG HEE BAG
            </p>

            <h1 className="text-2xl sm:text-3xl font-semibold">
              Order Management
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Manage customer orders, payment status and fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-gray-500">
                Total Orders
              </p>

              <p className="text-lg font-semibold text-yellow-400">
                {pagination.total}
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-200 hover:bg-white/[0.08] disabled:opacity-50 transition"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-xs text-gray-500 mb-2">
                Search Orders
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order ID, name, email..."
                className="w-full rounded-xl bg-[#111] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-yellow-500/50 transition"
              />
            </div>

            {/* Order Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Order Status
              </label>

              <select
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl bg-[#111] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/50 transition"
              >
                <option value="">All Order Statuses</option>

                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Payment Status
              </label>

              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl bg-[#111] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/50 transition"
              >
                <option value="">All Payment Statuses</option>

                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-400">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-5xl mb-4">
              🛍️
            </div>

            <h2 className="text-xl font-semibold mb-2">
              No Orders Found
            </h2>

            <p className="text-sm text-gray-500">
              No orders match the current filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Order
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Customer
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Amount
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Payment
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {orders.map((order, index) => {
                      const orderId = getOrderId(order);

                      return (
                        <tr
                          key={orderId || index}
                          className="hover:bg-white/[0.025] transition"
                        >
                          {/* Order */}
                          <td className="px-5 py-5">
                            <div className="max-w-[180px]">
                              <p className="text-sm font-medium text-white truncate">
                                #{orderId || "N/A"}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {Array.isArray(order.orderItems)
                                  ? order.orderItems.length
                                  : 0}{" "}
                                item
                                {Array.isArray(order.orderItems) &&
                                order.orderItems.length !== 1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-5">
                            <div>
                              <p className="text-sm text-gray-200">
                                {order?.user?.name || "Unknown Customer"}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 break-all">
                                {order?.user?.email || "—"}
                              </p>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-5">
                            <p className="text-sm text-gray-300">
                              {formatDate(order.createdAt)}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-yellow-400">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-5">
                            <select
                              value={order.orderStatus || "PENDING"}
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order,
                                  e.target.value
                                )
                              }
                              disabled={updatingOrderId === orderId}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium outline-none bg-[#111] ${getStatusClass(
                                order.orderStatus
                              )} disabled:opacity-50`}
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-[#111] text-white"
                                >
                                  {status.replaceAll("_", " ")}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Payment */}
                          <td className="px-5 py-5">
                            <select
                              value={order.paymentStatus || "PENDING"}
                              onChange={(e) =>
                                handlePaymentStatusChange(
                                  order,
                                  e.target.value
                                )
                              }
                              disabled={updatingPaymentId === orderId}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium outline-none bg-[#111] ${getStatusClass(
                                order.paymentStatus
                              )} disabled:opacity-50`}
                            >
                              {PAYMENT_STATUSES.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-[#111] text-white"
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleViewOrder(order)}
                              disabled={!orderId}
                              className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="lg:hidden space-y-4">
              {orders.map((order, index) => {
                const orderId = getOrderId(order);

                return (
                  <div
                    key={orderId || index}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                          Order
                        </p>

                        <p className="text-sm font-medium text-white break-all">
                          #{orderId || "N/A"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          Amount
                        </p>

                        <p className="text-lg font-semibold text-yellow-400">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="rounded-xl bg-black/20 border border-white/5 p-4 mb-4">
                      <p className="text-xs text-gray-500 mb-1">
                        Customer
                      </p>

                      <p className="text-sm text-gray-200">
                        {order?.user?.name || "Unknown Customer"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 break-all">
                        {order?.user?.email || "—"}
                      </p>

                      {order?.user?.phone && (
                        <p className="text-xs text-gray-500 mt-1">
                          {order.user.phone}
                        </p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Date
                        </p>

                        <p className="text-xs text-gray-300">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Items
                        </p>

                        <p className="text-xs text-gray-300">
                          {Array.isArray(order.orderItems)
                            ? order.orderItems.length
                            : 0}
                        </p>
                      </div>
                    </div>

                    {/* Status Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Order Status
                        </label>

                        <select
                          value={order.orderStatus || "PENDING"}
                          onChange={(e) =>
                            handleOrderStatusChange(
                              order,
                              e.target.value
                            )
                          }
                          disabled={updatingOrderId === orderId}
                          className={`w-full rounded-xl border px-3 py-3 text-xs font-medium outline-none bg-[#111] ${getStatusClass(
                            order.orderStatus
                          )} disabled:opacity-50`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-[#111] text-white"
                            >
                              {status.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Payment
                        </label>

                        <select
                          value={order.paymentStatus || "PENDING"}
                          onChange={(e) =>
                            handlePaymentStatusChange(
                              order,
                              e.target.value
                            )
                          }
                          disabled={updatingPaymentId === orderId}
                          className={`w-full rounded-xl border px-3 py-3 text-xs font-medium outline-none bg-[#111] ${getStatusClass(
                            order.paymentStatus
                          )} disabled:opacity-50`}
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-[#111] text-white"
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => handleViewOrder(order)}
                      disabled={!orderId}
                      className="w-full rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      View Order Details
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">

            <p className="text-sm text-gray-500">
              Page{" "}
              <span className="text-gray-300">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="text-gray-300">
                {pagination.pages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={page <= 1}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={page >= pagination.pages}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}