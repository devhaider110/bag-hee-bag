import { useEffect, useState } from "react";

import {
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from "../services/orderService";

import {
  getAdminShipping,
  updateShippingInfo,
  updateShippingStatus,
} from "../services/shippingService";

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

const formatAmount = (amount) =>
  `₹${Number(amount || 0).toLocaleString(
    "en-IN"
  )}`;

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

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

const formatDateInput = (date) => {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
};

// ============================================================
// OBJECT ID VALIDATION
// ============================================================

const isValidObjectId = (value) =>
  /^[a-f\d]{24}$/i.test(
    String(value || "")
  );

// ============================================================
// DELHIVERY TRACKING HELPERS
// ============================================================

const isGenericDelhiveryUrl = (url) => {
  if (!url) {
    return true;
  }

  try {
    const parsed = new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    const pathname =
      parsed.pathname.replace(/\/+$/, "");

    return (
      hostname === "www.delhivery.com" &&
      (
        pathname === "" ||
        pathname === "/" ||
        pathname === "/404" ||
        pathname === "/track" ||
        pathname === "/track/package"
      )
    );
  } catch {
    return true;
  }
};

const getEffectiveTrackingUrl = ({
  carrier,
  trackingNumber,
  trackingUrl,
}) => {
  const normalizedCarrier = String(
    carrier || ""
  )
    .trim()
    .toLowerCase();

  const normalizedTrackingNumber =
    String(
      trackingNumber || ""
    ).trim();

  const savedUrl = String(
    trackingUrl || ""
  ).trim();

  // ----------------------------------------------------------
  // DELHIVERY
  // ----------------------------------------------------------

  if (
    normalizedCarrier.includes(
      "delhivery"
    ) &&
    normalizedTrackingNumber
  ) {
    if (
      !savedUrl ||
      isGenericDelhiveryUrl(savedUrl)
    ) {
      return `https://www.delhivery.com/track/package/${encodeURIComponent(
        normalizedTrackingNumber
      )}`;
    }
  }

  // ----------------------------------------------------------
  // CUSTOM COURIER URL
  // ----------------------------------------------------------

  return savedUrl;
};

// ============================================================
// ORDER STATUS CLASS
// ============================================================

const statusClass = (status) => {
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

    case "RETURN_REQUESTED":
    case "RETURNED":
      return "text-orange-400";

    case "REFUNDED":
      return "text-purple-400";

    case "PENDING":
    case "PLACED":
      return "text-gray-300";

    default:
      return "text-gray-300";
  }
};

// ============================================================
// SHIPPING STATUS LABEL
// ============================================================

const shippingStatusLabel = (status) => {
  switch (status) {
    case "ORDER_PLACED":
      return "Order Placed";

    case "CONFIRMED":
      return "Confirmed";

    case "PROCESSING":
      return "Processing";

    case "PACKED":
      return "Packed";

    case "SHIPPED":
      return "Shipped";

    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";

    case "DELIVERED":
      return "Delivered";

    default:
      return "Not Available";
  }
};

// ============================================================
// SAFE ORDER ID
// ============================================================

const getOrderIdFromPath = () => {
  const parts =
    window.location.pathname
      .split("/")
      .filter(Boolean);

  if (
    parts[0] !== "admin" ||
    parts[1] !== "orders" ||
    parts.length !== 3
  ) {
    return "";
  }

  const id = parts[2];

  if (!isValidObjectId(id)) {
    return "";
  }

  return id;
};

// ============================================================
// COMPONENT
// ============================================================

const AdminOrderDetails = () => {
  const orderId = getOrderIdFromPath();

  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [savingStatus, setSavingStatus] =
    useState(false);

  const [savingPayment, setSavingPayment] =
    useState(false);

  const [savingShipping, setSavingShipping] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // ORDER STATES
  // ==========================================================

  const [orderStatus, setOrderStatus] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("");

  // ==========================================================
  // SHIPPING STATES
  // ==========================================================

  const [shippingStatus, setShippingStatus] =
    useState("ORDER_PLACED");

  const [carrier, setCarrier] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [trackingUrl, setTrackingUrl] =
    useState("");

  const [estimatedDelivery, setEstimatedDelivery] =
    useState("");

  // ==========================================================
  // LOAD ORDER + SHIPPING
  // ==========================================================

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!orderId) {
        setError("Invalid order ID.");
        return;
      }

      const [
        orderResponse,
        shippingResponse,
      ] = await Promise.all([
        getAdminOrderById(orderId),
        getAdminShipping(orderId),
      ]);

      const currentOrder =
        orderResponse?.order;

      const currentShipment =
        shippingResponse?.shipment;

      if (!currentOrder) {
        throw new Error(
          "Order information not found."
        );
      }

      setOrder(currentOrder);

      setShipment(
        currentShipment || null
      );

      // --------------------------------------------------------
      // ORDER
      // --------------------------------------------------------

      setOrderStatus(
        currentOrder.orderStatus ||
          "PLACED"
      );

      setPaymentStatus(
        currentOrder.paymentStatus ||
          "PENDING"
      );

      // --------------------------------------------------------
      // SHIPPING
      // --------------------------------------------------------

      const currentCarrier =
        currentShipment?.carrier || "";

      const currentTrackingNumber =
        currentShipment?.trackingNumber ||
        "";

      const currentTrackingUrl =
        currentShipment?.trackingUrl ||
        "";

      setShippingStatus(
        currentShipment?.currentStatus ||
          "ORDER_PLACED"
      );

      setCarrier(currentCarrier);

      setTrackingNumber(
        currentTrackingNumber
      );

      setTrackingUrl(
        getEffectiveTrackingUrl({
          carrier: currentCarrier,
          trackingNumber:
            currentTrackingNumber,
          trackingUrl:
            currentTrackingUrl,
        })
      );

      setEstimatedDelivery(
        formatDateInput(
          currentShipment?.estimatedDelivery
        )
      );
    } catch (err) {
      console.error(
        "Admin order details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // ==========================================================
  // UPDATE ORDER STATUS
  // ==========================================================

  const handleOrderStatusUpdate =
    async () => {
      try {
        setSavingStatus(true);
        setError("");
        setSuccess("");

        if (!orderId) {
          setError("Invalid order ID.");
          return;
        }

        const data =
          await updateOrderStatus(
            orderId,
            orderStatus
          );

        setOrder(data.order);

        // ------------------------------------------------------
        // Keep shipping state in sync
        // ------------------------------------------------------

        if (data.order?.shipping) {
          const updatedShipping =
            data.order.shipping;

          setShipment(updatedShipping);

          setShippingStatus(
            updatedShipping.shippingStatus ||
              shippingStatus
          );

          setCarrier(
            updatedShipping.carrier ||
              carrier
          );

          setTrackingNumber(
            updatedShipping.trackingNumber ||
              trackingNumber
          );

          setTrackingUrl(
            getEffectiveTrackingUrl({
              carrier:
                updatedShipping.carrier ||
                carrier,

              trackingNumber:
                updatedShipping.trackingNumber ||
                trackingNumber,

              trackingUrl:
                updatedShipping.trackingUrl ||
                trackingUrl,
            })
          );
        }

        setSuccess(
          "Order status updated successfully."
        );
      } catch (err) {
        console.error(
          "Order status update error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to update order status."
        );
      } finally {
        setSavingStatus(false);
      }
    };

  // ==========================================================
  // UPDATE PAYMENT STATUS
  // ==========================================================

  const handlePaymentStatusUpdate =
    async () => {
      try {
        setSavingPayment(true);
        setError("");
        setSuccess("");

        if (!orderId) {
          setError("Invalid order ID.");
          return;
        }

        const data =
          await updatePaymentStatus(
            orderId,
            paymentStatus
          );

        setOrder(data.order);

        setSuccess(
          "Payment status updated successfully."
        );
      } catch (err) {
        console.error(
          "Payment status update error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to update payment status."
        );
      } finally {
        setSavingPayment(false);
      }
    };

  // ==========================================================
  // UPDATE SHIPPING
  // ==========================================================

  const handleShippingUpdate =
    async () => {
      try {
        setSavingShipping(true);
        setError("");
        setSuccess("");

        if (!orderId) {
          setError("Invalid order ID.");
          return;
        }

        // ------------------------------------------------------
        // Generate effective tracking URL
        // ------------------------------------------------------

        const effectiveTrackingUrl =
          getEffectiveTrackingUrl({
            carrier,
            trackingNumber,
            trackingUrl,
          });

        // Update UI immediately
        setTrackingUrl(
          effectiveTrackingUrl
        );

        // ------------------------------------------------------
        // STEP 1
        // Save courier / tracking / delivery
        // ------------------------------------------------------

        const infoResponse =
          await updateShippingInfo(
            orderId,
            {
              carrier: carrier.trim(),

              trackingNumber:
                trackingNumber.trim(),

              trackingUrl:
                effectiveTrackingUrl,

              estimatedDelivery,
            }
          );

        let latestShipment =
          infoResponse?.shipment;

        // ------------------------------------------------------
        // STEP 2
        // Update shipping status
        // ------------------------------------------------------

        if (
          shippingStatus &&
          shippingStatus !==
            "NOT_SHIPPED"
        ) {
          const statusResponse =
            await updateShippingStatus(
              orderId,
              {
                status: shippingStatus,
              }
            );

          latestShipment =
            statusResponse?.shipment ||
            latestShipment;

          if (statusResponse?.order) {
            setOrder(
              statusResponse.order
            );

            setOrderStatus(
              statusResponse.order
                .orderStatus
            );
          }
        }

        setShipment(
          latestShipment || null
        );

        // ------------------------------------------------------
        // Keep generated URL even if backend
        // returns old generic URL.
        // ------------------------------------------------------

        if (latestShipment) {
          setTrackingUrl(
            getEffectiveTrackingUrl({
              carrier:
                latestShipment.carrier ||
                carrier,

              trackingNumber:
                latestShipment.trackingNumber ||
                trackingNumber,

              trackingUrl:
                latestShipment.trackingUrl ||
                effectiveTrackingUrl,
            })
          );
        }

        setSuccess(
          "Shipping details updated successfully."
        );
      } catch (err) {
        console.error(
          "Shipping update error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to update shipping details."
        );
      } finally {
        setSavingShipping(false);
      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] px-4 py-10 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl animate-pulse">

          <div className="mb-6 h-8 w-64 rounded bg-white/10" />

          <div className="h-72 rounded-2xl bg-white/5" />

          <div className="mt-5 h-48 rounded-2xl bg-white/5" />

        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] px-4 py-16 text-white">

        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">

          <h1 className="text-xl font-semibold">
            Unable to Load Order
          </h1>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
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
  // DATA
  // ==========================================================

  const address =
    order?.shippingAddress || {};

  const customer =
    order?.user || {};

  const effectiveTrackingUrl =
    getEffectiveTrackingUrl({
      carrier:
        shipment?.carrier ||
        carrier,

      trackingNumber:
        shipment?.trackingNumber ||
        trackingNumber,

      trackingUrl:
        shipment?.trackingUrl ||
        trackingUrl,
    });

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white sm:px-6 lg:px-10">

      <div className="mx-auto max-w-6xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-7">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
            className="mb-5 text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Orders
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                ADMIN · ORDER DETAILS
              </p>

              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
                #
                {String(order._id)
                  .slice(-10)
                  .toUpperCase()}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Created on{" "}
                {formatDate(
                  order.createdAt
                )}
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <span
                className={`rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium ${statusClass(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
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
                Payment:{" "}
                {order.paymentStatus}
              </span>

              <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-2 text-xs font-medium text-[#d4af37]">
                Shipping:{" "}
                {shippingStatusLabel(
                  shipment?.currentStatus
                )}
              </span>

            </div>

          </div>
        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-5">

          {/* ==================================================
              SHIPPING MANAGEMENT
          ================================================== */}

          <section className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/10 via-white/[0.03] to-transparent p-5 sm:p-6">

            <div className="mb-6">

              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                SHIPPING MANAGEMENT
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Dispatch & Tracking
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add courier details and update
                the customer's delivery journey.
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {/* SHIPPING STATUS */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Shipping Status
                </label>

                <select
                  value={shippingStatus}
                  onChange={(e) =>
                    setShippingStatus(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/50"
                >
                  <option value="ORDER_PLACED">
                    Order Placed
                  </option>

                  <option value="CONFIRMED">
                    Confirmed
                  </option>

                  <option value="PROCESSING">
                    Processing
                  </option>

                  <option value="PACKED">
                    Packed
                  </option>

                  <option value="SHIPPED">
                    Shipped
                  </option>

                  <option value="OUT_FOR_DELIVERY">
                    Out for Delivery
                  </option>

                  <option value="DELIVERED">
                    Delivered
                  </option>
                </select>
              </div>

              {/* CARRIER */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Courier / Carrier
                </label>

                <input
                  type="text"
                  value={carrier}
                  onChange={(e) =>
                    setCarrier(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Delhivery, Blue Dart"
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#d4af37]/50"
                />
              </div>

              {/* TRACKING NUMBER */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Tracking / AWB Number
                </label>

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) =>
                    setTrackingNumber(
                      e.target.value
                    )
                  }
                  placeholder="Enter tracking number"
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#d4af37]/50"
                />
              </div>

              {/* TRACKING URL */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Tracking URL
                </label>

                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) =>
                    setTrackingUrl(
                      e.target.value
                    )
                  }
                  placeholder={
                    carrier
                      .toLowerCase()
                      .includes("delhivery")
                      ? "Leave blank for automatic Delhivery tracking"
                      : "https://..."
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#d4af37]/50"
                />

                {carrier
                  .toLowerCase()
                  .includes(
                    "delhivery"
                  ) &&
                  trackingNumber && (
                    <p className="mt-2 text-xs text-gray-500">
                      A direct Delhivery
                      tracking link will
                      be generated
                      automatically from
                      the AWB number.
                    </p>
                  )}
              </div>

              {/* ESTIMATED DELIVERY */}

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Estimated Delivery
                </label>

                <input
                  type="date"
                  value={
                    estimatedDelivery
                  }
                  onChange={(e) =>
                    setEstimatedDelivery(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/50"
                />
              </div>

            </div>

            {/* SHIPPING TIMESTAMPS */}

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Packed
                </p>

                <p className="mt-1 text-sm text-white">
                  {formatDate(
                    shipment?.packedAt
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Shipped
                </p>

                <p className="mt-1 text-sm text-white">
                  {formatDate(
                    shipment?.shippedAt
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Delivered
                </p>

                <p className="mt-1 text-sm text-white">
                  {formatDate(
                    shipment?.deliveredAt
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Current Status
                </p>

                <p className="mt-1 text-sm font-medium text-[#d4af37]">
                  {shippingStatusLabel(
                    shipment?.currentStatus
                  )}
                </p>
              </div>

            </div>

            {/* CURRENT TRACKING PREVIEW */}

            {effectiveTrackingUrl && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Active Tracking Link
                </p>

                <a
                  href={
                    effectiveTrackingUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block break-all text-sm text-[#d4af37] hover:underline"
                >
                  {effectiveTrackingUrl}
                </a>

              </div>
            )}

            {/* SAVE */}

            <button
              type="button"
              onClick={
                handleShippingUpdate
              }
              disabled={savingShipping}
              className="mt-6 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingShipping
                ? "Saving..."
                : "Save Shipping Details"}
            </button>

          </section>

          {/* ==================================================
              ORDER + PAYMENT STATUS
          ================================================== */}

          <div className="grid gap-5 lg:grid-cols-2">

            {/* ORDER STATUS */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Order Status
              </h2>

              <select
                value={orderStatus}
                onChange={(e) =>
                  setOrderStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="PLACED">
                  Placed
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="PROCESSING">
                  Processing
                </option>

                <option value="SHIPPED">
                  Shipped
                </option>

                <option value="OUT_FOR_DELIVERY">
                  Out for Delivery
                </option>

                <option value="DELIVERED">
                  Delivered
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

                <option value="RETURN_REQUESTED">
                  Return Requested
                </option>

                <option value="RETURNED">
                  Returned
                </option>

                <option value="REFUNDED">
                  Refunded
                </option>
              </select>

              <button
                type="button"
                onClick={
                  handleOrderStatusUpdate
                }
                disabled={savingStatus}
                className="mt-4 rounded-xl border border-[#d4af37]/30 px-5 py-2.5 text-sm font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10 disabled:opacity-50"
              >
                {savingStatus
                  ? "Updating..."
                  : "Update Order Status"}
              </button>

            </section>

            {/* PAYMENT */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Payment Status
              </h2>

              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>

              <button
                type="button"
                onClick={
                  handlePaymentStatusUpdate
                }
                disabled={savingPayment}
                className="mt-4 rounded-xl border border-emerald-500/20 px-5 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
              >
                {savingPayment
                  ? "Updating..."
                  : "Update Payment Status"}
              </button>

            </section>

          </div>

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Customer Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs text-gray-500">
                  Name
                </p>

                <p className="mt-1 text-sm">
                  {customer.name ||
                    customer.username ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Username
                </p>

                <p className="mt-1 text-sm">
                  {customer.username ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all text-sm">
                  {customer.email ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Phone
                </p>

                <p className="mt-1 text-sm">
                  {customer.phone ||
                    "—"}
                </p>
              </div>

            </div>

          </section>

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Ordered Items
            </h2>

            <div className="space-y-4">

              {(order.orderItems || [])
                .map(
                  (item, index) => (
                    <div
                      key={`${item.product}-${index}`}
                      className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                    >

                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">

                        {item.productImage ? (
                          <img
                            src={
                              item.productImage
                            }
                            alt={
                              item.productName ||
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
                          Quantity:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="font-semibold">
                          {formatAmount(
                            item.finalPrice
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Total:{" "}
                          {formatAmount(
                            item.total
                          )}
                        </p>

                      </div>

                    </div>
                  )
                )}

            </div>

          </section>

          {/* ==================================================
              ADDRESS + SHIPPING INFO
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
                    address.houseFlat ||
                    ""}

                  {address.street
                    ? `, ${address.street}`
                    : ""}
                </p>

                {(address.landmark ||
                  address.area) && (
                  <p>
                    {address.landmark ||
                      address.area}
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
                    address.pincode ||
                    ""}
                </p>

              </div>

            </section>

            {/* SHIPPING INFO */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Shipping Information
              </h2>

              <div className="space-y-4 text-sm">

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Status
                  </span>

                  <span className="text-[#d4af37]">
                    {shippingStatusLabel(
                      shipment?.currentStatus
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Courier
                  </span>

                  <span>
                    {shipment?.carrier ||
                      "Not assigned"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Tracking No.
                  </span>

                  <span className="max-w-[200px] break-all text-right font-mono text-xs">
                    {shipment?.trackingNumber ||
                      "Not assigned"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Estimated Delivery
                  </span>

                  <span>
                    {formatDate(
                      shipment?.estimatedDelivery
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Shipped On
                  </span>

                  <span>
                    {formatDate(
                      shipment?.shippedAt
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">
                    Delivered On
                  </span>

                  <span className="text-emerald-400">
                    {formatDate(
                      shipment?.deliveredAt
                    )}
                  </span>
                </div>

              </div>

              {effectiveTrackingUrl && (
                <a
                  href={
                    effectiveTrackingUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-xl border border-[#d4af37]/30 px-4 py-2.5 text-xs font-medium text-[#d4af37] transition hover:bg-[#d4af37]/10"
                >
                  Open Courier Tracking →
                </a>
              )}

            </section>

          </div>

          {/* ==================================================
              PAYMENT INFORMATION
          ================================================== */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

            <h2 className="mb-5 text-lg font-semibold">
              Payment Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs text-gray-500">
                  Method
                </p>

                <p className="mt-1 text-sm">
                  {order.paymentMethod ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="mt-1 text-sm">
                  {order.paymentStatus ||
                    "PENDING"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Razorpay Order
                </p>

                <p className="mt-1 break-all font-mono text-xs">
                  {order.razorpayOrderId ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Razorpay Payment
                </p>

                <p className="mt-1 break-all font-mono text-xs">
                  {order.razorpayPaymentId ||
                    "—"}
                </p>
              </div>

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

export default AdminOrderDetails;