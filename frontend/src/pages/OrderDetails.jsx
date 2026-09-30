import { useEffect, useState } from "react";

import { getMyOrderById } from "../services/orderService";

// ============================================================
// NAVIGATION
// ============================================================

const navigate = (path) => {
  window.history.pushState({}, "", path);

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
};

// ============================================================
// HELPERS
// ============================================================

const formatAmount = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// OBJECT ID
// ============================================================

const isValidObjectId = (value) => {
  return /^[a-f\d]{24}$/i.test(
    String(value || "")
  );
};

// ============================================================
// SAFE ORDER ID
// ============================================================

const getOrderIdFromPath = () => {
  const parts = window.location.pathname
    .split("/")
    .filter(Boolean);

  /*
   * Only accept:
   *
   * /orders/:orderId
   */

  if (
    parts[0] !== "orders" ||
    parts.length !== 2
  ) {
    return "";
  }

  const id = parts[1];

  if (!isValidObjectId(id)) {
    return "";
  }

  return id;
};

// ============================================================
// TRACKING URL HELPERS
// ============================================================

const isGenericDelhiveryUrl = (url) => {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) {
    return false;
  }

  try {
    const parsed = new URL(cleanUrl);

    const hostname =
      parsed.hostname.toLowerCase();

    const pathname =
      parsed.pathname.replace(/\/+$/, "");

    const isDelhivery =
      hostname === "www.delhivery.com" ||
      hostname === "delhivery.com";

    if (!isDelhivery) {
      return false;
    }

    return (
      pathname === "" ||
      pathname === "/404" ||
      pathname === "/track" ||
      pathname === "/track/package"
    );
  } catch {
    return false;
  }
};

const getEffectiveTrackingUrl = ({
  carrier,
  trackingNumber,
  trackingUrl,
}) => {
  const normalizedCarrier =
    String(carrier || "")
      .trim()
      .toLowerCase();

  const normalizedTrackingNumber =
    String(trackingNumber || "").trim();

  const savedUrl =
    String(trackingUrl || "").trim();

  /*
   * IMPORTANT:
   *
   * We DO NOT automatically generate:
   *
   * https://www.delhivery.com/track/package/AWB
   *
   * because random/test AWBs can result in 404.
   *
   * A real courier tracking URL should be
   * manually saved by admin.
   */

  if (
    normalizedCarrier.includes("delhivery") &&
    normalizedTrackingNumber &&
    isGenericDelhiveryUrl(savedUrl)
  ) {
    return "";
  }

  /*
   * No saved URL = no external courier button.
   */

  if (!savedUrl) {
    return "";
  }

  /*
   * Keep a real custom tracking URL.
   */

  return savedUrl;
};

// ============================================================
// ORDER STATUS
// ============================================================

const getStatusClass = (status) => {
  switch (status) {
    case "DELIVERED":
      return "text-emerald-400";

    case "SHIPPED":
      return "text-blue-400";

    case "OUT_FOR_DELIVERY":
      return "text-cyan-400";

    case "PROCESSING":
      return "text-yellow-400";

    case "CONFIRMED":
      return "text-cyan-400";

    case "CANCELLED":
      return "text-red-400";

    case "REFUNDED":
      return "text-purple-400";

    case "RETURN_REQUESTED":
      return "text-orange-400";

    case "RETURNED":
      return "text-orange-400";

    case "PENDING":
    case "PLACED":
      return "text-yellow-400";

    default:
      return "text-gray-300";
  }
};

// ============================================================
// SHIPPING STATUS
// ============================================================

const getShippingStatus = (order) => {
  const shipping =
    order?.shipping || {};

  if (shipping.shippingStatus) {
    return shipping.shippingStatus;
  }

  if (
    order?.orderStatus ===
    "DELIVERED"
  ) {
    return "DELIVERED";
  }

  if (
    order?.orderStatus ===
    "OUT_FOR_DELIVERY"
  ) {
    return "OUT_FOR_DELIVERY";
  }

  if (
    order?.orderStatus ===
    "SHIPPED"
  ) {
    return "SHIPPED";
  }

  if (
    order?.orderStatus ===
    "PROCESSING"
  ) {
    return "PROCESSING";
  }

  if (
    order?.orderStatus ===
    "CONFIRMED"
  ) {
    return "PACKED";
  }

  return "NOT_SHIPPED";
};

// ============================================================
// SHIPPING LABEL
// ============================================================

const getShippingStatusLabel = (status) => {
  switch (status) {
    case "NOT_SHIPPED":
      return "Preparing Order";

    case "PACKED":
      return "Order Packed";

    case "SHIPPED":
      return "Shipped";

    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";

    case "DELIVERED":
      return "Delivered";

    default:
      return (
        status?.replaceAll("_", " ") ||
        "Preparing Order"
      );
  }
};

// ============================================================
// SHIPPING PROGRESS
// ============================================================

const getShippingProgress = (status) => {
  const steps = [
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  if (
    status === "NOT_SHIPPED"
  ) {
    return 0;
  }

  const index =
    steps.indexOf(status);

  return index === -1
    ? 0
    : index + 1;
};

// ============================================================
// TRACKING STEP
// ============================================================

const TrackingStep = ({
  title,
  description,
  date,
  active,
  completed,
  last,
}) => {
  return (
    <div className="relative flex gap-4">

      {!last && (
        <div
          className={`absolute left-[11px] top-7 h-[calc(100%-4px)] w-px ${
            completed
              ? "bg-[#d4af37]"
              : "bg-white/10"
          }`}
        />
      )}

      <div
        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          completed || active
            ? "border-[#d4af37] bg-[#d4af37] text-black"
            : "border-white/15 bg-[#111] text-gray-600"
        }`}
      >
        {completed
          ? "✓"
          : active
          ? "•"
          : ""}
      </div>

      <div className="pb-7">

        <p
          className={`text-sm font-semibold ${
            active || completed
              ? "text-white"
              : "text-gray-500"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>

        {date && (
          <p className="mt-2 text-xs text-gray-400">
            {formatDate(date)}
          </p>
        )}

      </div>
    </div>
  );
};

// ============================================================
// RETURN / CANCELLATION ELIGIBILITY
// MODULE 14
// ============================================================

const canCancelOrder = (order) => {
  const status =
    order?.orderStatus;

  return [
    "PENDING",
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
  ].includes(status);
};

const canRequestReturn = (order) => {
  return (
    order?.orderStatus ===
    "DELIVERED"
  );
};

// ============================================================
// COMPONENT
// ============================================================

const OrderDetails = () => {
  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const orderId =
    getOrderIdFromPath();

  // ==========================================================
  // LOAD ORDER
  // ==========================================================

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        if (!orderId) {
          setError(
            "Invalid order ID."
          );

          setLoading(false);
          return;
        }

        const data =
          await getMyOrderById(
            orderId
          );

        setOrder(data.order);
      } catch (err) {
        console.error(
          "Order details error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load order details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl animate-pulse">

          <div className="mb-6 h-8 w-48 rounded bg-white/10" />

          <div className="h-64 rounded-2xl bg-white/5" />

        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] px-4 py-16 text-white">

        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">

          <h1 className="text-xl font-semibold">
            Unable to load order
          </h1>

          <p className="mt-2 text-sm text-red-300">
            {error ||
              "Order not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
            className="mt-6 rounded-xl border border-white/10 px-5 py-2.5 text-sm transition hover:bg-white/10"
          >
            Back to Orders
          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ORDER DATA
  // ==========================================================

  const address =
    order.shippingAddress || {};

  const shipping =
    order.shipping || {};

  const shippingStatus =
    getShippingStatus(order);

  const progress =
    getShippingProgress(
      shippingStatus
    );

  const trackingNumber =
    shipping.trackingNumber ||
    order.trackingNumber ||
    order.awbNumber ||
    "";

  const carrier =
    shipping.carrier ||
    order.shippingCarrier ||
    order.courierName ||
    "";

  const estimatedDelivery =
    shipping.estimatedDelivery ||
    order.estimatedDelivery;

  const shippedAt =
    shipping.shippedAt ||
    order.shippedAt;

  const outForDeliveryAt =
    shipping.outForDeliveryAt ||
    order.outForDeliveryAt;

  const deliveredAt =
    shipping.deliveredAt ||
    order.deliveredAt;

  const savedTrackingUrl =
    shipping.trackingUrl ||
    order.trackingUrl ||
    "";

  const trackingUrl =
    getEffectiveTrackingUrl({
      carrier,
      trackingNumber,
      trackingUrl:
        savedTrackingUrl,
    });

  const cancellable =
    canCancelOrder(order);

  const returnable =
    canRequestReturn(order);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white sm:px-6 lg:px-10">

      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-7">

          {/* BACK + INVOICE ACTIONS */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={() =>
                navigate("/orders")
              }
              className="text-sm text-gray-400 transition hover:text-white"
            >
              ← Back to My Orders
            </button>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(`/invoice/${orderId}`)
                }
                className="inline-flex items-center justify-center rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-2.5 text-sm font-medium text-[#d4af37] transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/20"
              >
                🖨 Print Invoice
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(`/invoice/${orderId}`)
                }
                className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
              >
                ↓ Download Invoice
              </button>

            </div>
          </div>

          {/* ORDER HEADING */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                ORDER DETAILS
              </p>

              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                #
                {String(order._id)
                  .slice(-10)
                  .toUpperCase()}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Placed on{" "}
                {formatDate(
                  order.createdAt
                )}
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <span
                className={`rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium ${getStatusClass(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus ||
                  "PENDING"}
              </span>

              <span
                className={`rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium ${
                  order.paymentStatus ===
                  "PAID"
                    ? "text-emerald-400"
                    : order.paymentStatus ===
                      "FAILED"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {order.paymentStatus ||
                  "PENDING"}
              </span>

            </div>

          </div>

        </div>

        <div className="space-y-5">

          {/* ==================================================
              SHIPPING & TRACKING
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/10 via-white/[0.03] to-transparent p-5 sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                  SHIPPING & TRACKING
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {getShippingStatusLabel(
                    shippingStatus
                  )}
                </h2>

                {estimatedDelivery && (
                  <p className="mt-2 text-sm text-gray-400">
                    Estimated delivery:{" "}
                    <span className="text-white">
                      {formatDateOnly(
                        estimatedDelivery
                      )}
                    </span>
                  </p>
                )}

              </div>

              {trackingNumber && (
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:min-w-[220px]">

                  <p className="text-[10px] uppercase tracking-wider text-gray-500">
                    Tracking Number
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-white">
                    {trackingNumber}
                  </p>

                </div>
              )}

            </div>

            {carrier && (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">

                <span className="text-gray-500">
                  Courier:
                </span>

                <span className="font-medium text-white">
                  {carrier}
                </span>

              </div>
            )}

            {order.orderStatus ===
            "CANCELLED" ? (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4">

                <p className="text-sm font-medium text-red-400">
                  This order has been cancelled.
                </p>

              </div>
            ) : (
              <div className="mt-7">

                <TrackingStep
                  title="Order Packed"
                  description="Your order has been packed and is ready for dispatch."
                  date={shipping.packedAt}
                  completed={
                    progress >= 1
                  }
                  active={
                    progress === 0
                  }
                />

                <TrackingStep
                  title="Shipped"
                  description="Your order has left our store."
                  date={shippedAt}
                  completed={
                    progress >= 2
                  }
                  active={
                    progress === 1
                  }
                />

                <TrackingStep
                  title="Out for Delivery"
                  description="Your order is on the way to your address."
                  date={
                    outForDeliveryAt
                  }
                  completed={
                    progress >= 3
                  }
                  active={
                    progress === 2
                  }
                />

                <TrackingStep
                  title="Delivered"
                  description="Your order has been delivered successfully."
                  date={deliveredAt}
                  completed={
                    progress >= 4
                  }
                  active={
                    progress === 3
                  }
                  last
                />

              </div>
            )}

            {/* INTERNAL TRACKING */}

            <div className="mt-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/orders/${orderId}/tracking`
                  )
                }
                className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
              >
                Track Shipment →
              </button>

            </div>

            {/* EXTERNAL COURIER */}

            {trackingUrl &&
            trackingNumber ? (
              <div className="mt-4">

                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-xl border border-[#d4af37]/30 px-5 py-3 text-sm font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10"
                >
                  Track on{" "}
                  {carrier ||
                    "Courier"}{" "}
                  →
                </a>

              </div>
            ) : trackingNumber ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">

                <p className="text-xs leading-5 text-gray-500">
                  Courier tracking will become
                  available once a valid courier
                  tracking link is added.
                </p>

              </div>
            ) : null}

          </section>

          {/* ==================================================
              MODULE 14 - CANCELLATION / RETURN
          ================================================== */}

          {(cancellable ||
            returnable ||
            order.orderStatus ===
              "CANCELLED" ||
            order.orderStatus ===
              "RETURN_REQUESTED" ||
            order.orderStatus ===
              "RETURNED" ||
            order.orderStatus ===
              "REFUNDED") && (
            <section className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6">

              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                ORDER SUPPORT
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Cancellation, Return & Refund
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Need to cancel your order, request
                a return, or check your refund status?
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

                {cancellable && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/orders/${orderId}/return`
                      )
                    }
                    className="rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    Cancel Order
                  </button>
                )}

                {returnable && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/orders/${orderId}/return`
                      )
                    }
                    className="rounded-xl border border-orange-400/30 bg-orange-400/5 px-5 py-3 text-sm font-medium text-orange-300 transition hover:bg-orange-400/10"
                  >
                    Request Return
                  </button>
                )}

                {(order.orderStatus ===
                  "CANCELLED" ||
                  order.orderStatus ===
                    "RETURN_REQUESTED" ||
                  order.orderStatus ===
                    "RETURNED" ||
                  order.orderStatus ===
                    "REFUNDED") && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/orders/${orderId}/refund`
                      )
                    }
                    className="rounded-xl border border-purple-400/30 bg-purple-400/5 px-5 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-400/10"
                  >
                    View Refund Status
                  </button>
                )}

              </div>

            </section>
          )}

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Ordered Items
            </h2>

            <div className="space-y-4">

              {(order.orderItems || []).map(
                (item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">

                      {item.productImage ||
                      item.image ? (
                        <img
                          src={
                            item.productImage ||
                            item.image
                          }
                          alt={
                            item.productName ||
                            item.name ||
                            "Product"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          👜
                        </span>
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-medium">
                        {item.productName ||
                          item.name ||
                          "Product"}
                      </h3>

                      {item.variantName && (
                        <p className="mt-1 text-xs text-gray-400">
                          {item.variantName}
                        </p>
                      )}

                      {item.sku && (
                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {item.sku}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-gray-400">
                        Qty:{" "}
                        {item.quantity || 1}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="font-semibold">
                        {formatAmount(
                          item.finalPrice ??
                            item.discountPrice ??
                            item.price ??
                            0
                        )}
                      </p>

                      {item.quantity > 1 && (
                        <p className="mt-1 text-xs text-gray-500">
                          Total:{" "}
                          {formatAmount(
                            item.total
                          )}
                        </p>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

          </section>

          {/* ==================================================
              ADDRESS + SHIPPING
          ================================================== */}

          <div className="grid gap-5 lg:grid-cols-2">

            {/* ADDRESS */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Delivery Address
              </h2>

              <div className="space-y-1 text-sm text-gray-400">

                <p className="font-medium text-white">
                  {address.fullName ||
                    "—"}
                </p>

                <p>
                  {address.phone ||
                    "—"}
                </p>

                <p className="pt-2">
                  {address.house ||
                    ""}

                  {address.street
                    ? `, ${address.street}`
                    : ""}
                </p>

                {address.landmark && (
                  <p>
                    {address.landmark}
                  </p>
                )}

                <p>
                  {address.city ||
                    ""}

                  {address.state
                    ? `, ${address.state}`
                    : ""}
                </p>

                <p>
                  {address.pinCode ||
                    ""}
                </p>

                {address.country && (
                  <p>
                    {address.country}
                  </p>
                )}

              </div>

            </section>

            {/* SHIPPING INFORMATION */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Shipping Information
              </h2>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Status
                  </span>

                  <span
                    className={getStatusClass(
                      shippingStatus
                    )}
                  >
                    {getShippingStatusLabel(
                      shippingStatus
                    )}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Courier
                  </span>

                  <span className="text-right">
                    {carrier ||
                      "Not assigned"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Tracking No.
                  </span>

                  <span className="max-w-[190px] break-all text-right font-mono text-xs">
                    {trackingNumber ||
                      "Not assigned"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Shipped On
                  </span>

                  <span>
                    {formatDate(
                      shippedAt
                    )}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Estimated Delivery
                  </span>

                  <span>
                    {formatDateOnly(
                      estimatedDelivery
                    )}
                  </span>

                </div>

                {deliveredAt && (
                  <div className="flex justify-between gap-4">

                    <span className="text-gray-500">
                      Delivered On
                    </span>

                    <span className="text-emerald-400">
                      {formatDate(
                        deliveredAt
                      )}
                    </span>

                  </div>
                )}

              </div>

              {trackingUrl &&
                trackingNumber && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-xl border border-[#d4af37]/30 px-4 py-2.5 text-xs font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10"
                  >
                    Open Courier Tracking →
                  </a>
                )}

            </section>

          </div>

          {/* ==================================================
              PAYMENT
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Payment
            </h2>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between gap-4">

                <span className="text-gray-500">
                  Method
                </span>

                <span>
                  {order.paymentMethod ||
                    "—"}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-gray-500">
                  Payment Status
                </span>

                <span
                  className={
                    order.paymentStatus ===
                    "PAID"
                      ? "text-emerald-400"
                      : order.paymentStatus ===
                        "FAILED"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }
                >
                  {order.paymentStatus ||
                    "PENDING"}
                </span>

              </div>

              {order.razorpayOrderId && (
                <div className="flex justify-between gap-4">

                  <span className="text-gray-500">
                    Razorpay Order
                  </span>

                  <span className="max-w-[180px] truncate font-mono text-xs">
                    {order.razorpayOrderId}
                  </span>

                </div>
              )}

            </div>

          </section>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Order Summary
            </h2>

            <div className="ml-auto max-w-md space-y-3 text-sm">

              <div className="flex justify-between">

                <span className="text-gray-500">
                  Subtotal
                </span>

                <span>
                  {formatAmount(
                    order.subtotal
                  )}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-gray-500">
                  Product Discount
                </span>

                <span className="text-emerald-400">
                  -
                  {formatAmount(
                    order.productDiscount
                  )}
                </span>

              </div>

              {order.couponDiscount >
                0 && (
                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Coupon
                    {order.couponCode
                      ? ` (${order.couponCode})`
                      : ""}
                  </span>

                  <span className="text-emerald-400">
                    -
                    {formatAmount(
                      order.couponDiscount
                    )}
                  </span>

                </div>
              )}

              <div className="flex justify-between">

                <span className="text-gray-500">
                  Shipping
                </span>

                <span>
                  {order.shippingCharge >
                  0
                    ? formatAmount(
                        order.shippingCharge
                      )
                    : "FREE"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-gray-500">
                  Tax
                </span>

                <span>
                  {formatAmount(
                    order.tax
                  )}
                </span>

              </div>

              <div className="my-3 border-t border-white/10" />

              <div className="flex justify-between text-base">

                <span className="font-medium">
                  Total
                </span>

                <span className="text-xl font-semibold text-[#d4af37]">
                  {formatAmount(
                    order.totalAmount
                  )}
                </span>

              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
};

export default OrderDetails;