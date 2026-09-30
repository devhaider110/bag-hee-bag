import { useEffect, useState } from "react";
import { getMyOrders } from "../services/orderService";

const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const getStatusClass = (status) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

    case "SHIPPED":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";

    case "PROCESSING":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

    case "CONFIRMED":
      return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";

    case "CANCELLED":
      return "bg-red-500/15 text-red-400 border-red-500/30";

    case "REFUNDED":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";

    default:
      return "bg-white/10 text-gray-300 border-white/10";
  }
};

const getPaymentClass = (status) => {
  switch (status) {
    case "PAID":
      return "text-emerald-400";

    case "FAILED":
      return "text-red-400";

    default:
      return "text-yellow-400";
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();

        setOrders(data.orders || []);
      } catch (err) {
        console.error("My orders error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            BAG HEE BAG
          </p>

          <h1 className="text-3xl font-semibold sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            View your purchases and order details.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-4 h-5 w-40 rounded bg-white/10" />
                <div className="mb-3 h-4 w-64 rounded bg-white/10" />
                <div className="h-4 w-32 rounded bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-red-400">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-2xl">
              🛍️
            </div>

            <h2 className="text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Your purchases will appear here.
            </p>

            <button
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition hover:border-[#d4af37]/30"
              >
                {/* Top */}
                <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-gray-200">
                      #{String(order._id).slice(-10).toUpperCase()}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus || "PENDING"}
                    </span>

                    <span
                      className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs ${getPaymentClass(
                        order.paymentStatus
                      )}`}
                    >
                      Payment: {order.paymentStatus || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">

                    <div className="space-y-3">
                      {(order.orderItems || [])
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={`${item.product}-${index}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name || "Product"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">
                                  👜
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {item.name || "Product"}
                              </p>

                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity || 1}
                              </p>
                            </div>
                          </div>
                        ))}

                      {(order.orderItems || []).length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{" "}
                          {(order.orderItems || []).length - 3} more
                          item(s)
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <div>
                        <p className="text-xs text-gray-500">
                          Total
                        </p>

                        <p className="text-xl font-semibold text-[#d4af37]">
                          {formatAmount(order.totalAmount)}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/orders/${order._id}`)
                        }
                        className="rounded-xl border border-[#d4af37]/40 px-5 py-2.5 text-sm font-medium text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                      >
                        View Details
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;