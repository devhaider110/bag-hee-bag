import { useEffect, useState } from "react";

import ShippingTimeline from "../components/ShippingTimeline";
import ShippingStatusBadge from "../components/ShippingStatusBadge";
import { getMyTracking } from "../services/shippingService";

// ============================================================
// ORDER ID
// ============================================================

const getOrderId = () => {
  const parts = window.location.pathname
    .split("/")
    .filter(Boolean);

  // Expected:
  // /orders/:orderId/tracking

  if (
    parts.length === 3 &&
    parts[0] === "orders" &&
    parts[2] === "tracking" &&
    /^[a-f\d]{24}$/i.test(parts[1])
  ) {
    return parts[1];
  }

  return "";
};

// ============================================================
// DATE FORMATTER
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

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
// COURIER TRACKING URL
// ============================================================

const getTrackingUrl = (
  carrier,
  trackingNumber,
  savedTrackingUrl
) => {
  const cleanCarrier = String(carrier || "")
    .trim()
    .toLowerCase();

  const cleanTrackingNumber = String(
    trackingNumber || ""
  ).trim();

  const cleanSavedUrl = String(
    savedTrackingUrl || ""
  ).trim();

  // ----------------------------------------------------------
  // No tracking number
  // ----------------------------------------------------------

  if (!cleanTrackingNumber) {
    return "";
  }

  // ----------------------------------------------------------
  // DELHIVERY
  // ----------------------------------------------------------

  if (cleanCarrier.includes("delhivery")) {
    let isGenericDelhiveryUrl = false;

    if (cleanSavedUrl) {
      try {
        const parsedUrl = new URL(cleanSavedUrl);

        const hostname =
          parsedUrl.hostname.toLowerCase();

        const pathname =
          parsedUrl.pathname.replace(/\/+$/, "");

        isGenericDelhiveryUrl =
          hostname === "www.delhivery.com" &&
          (
            pathname === "" ||
            pathname === "/" ||
            pathname === "/404" ||
            pathname === "/track" ||
            pathname === "/track/package"
          );
      } catch {
        isGenericDelhiveryUrl = true;
      }
    }

    // --------------------------------------------------------
    // Blank / generic / 404 URL
    // Generate shipment-specific tracking URL.
    // --------------------------------------------------------

    if (
      !cleanSavedUrl ||
      isGenericDelhiveryUrl
    ) {
      return `https://www.delhivery.com/track/package/${encodeURIComponent(
        cleanTrackingNumber
      )}`;
    }
  }

  // ----------------------------------------------------------
  // Custom saved tracking URL
  // ----------------------------------------------------------

  if (cleanSavedUrl) {
    return cleanSavedUrl;
  }

  return "";
};

// ============================================================
// SHIPPING STATUS
// ============================================================

const getCurrentShippingStatus = (
  shipping,
  order
) => {
  if (shipping?.shippingStatus) {
    return shipping.shippingStatus;
  }

  if (
    order?.orderStatus === "DELIVERED"
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
    order?.orderStatus === "SHIPPED"
  ) {
    return "SHIPPED";
  }

  if (
    order?.orderStatus === "PROCESSING"
  ) {
    return "PACKED";
  }

  return "NOT_SHIPPED";
};

// ============================================================
// SHIPPING TIMELINE BUILDER
// ============================================================

const buildTimeline = (
  shipping,
  order
) => {
  const currentStatus =
    getCurrentShippingStatus(
      shipping,
      order
    );

  const packedCompleted = [
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ].includes(currentStatus);

  const shippedCompleted = [
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ].includes(currentStatus);

  const outForDeliveryCompleted = [
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ].includes(currentStatus);

  return [
    {
      status: "NOT_SHIPPED",
      label: "Order Placed",
      date: order?.createdAt,
      completed: true,
    },
    {
      status: "PACKED",
      label: "Packed",
      date: shipping?.packedAt,
      completed: packedCompleted,
    },
    {
      status: "SHIPPED",
      label: "Shipped",
      date: shipping?.shippedAt,
      completed: shippedCompleted,
    },
    {
      status: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
      date: shipping?.outForDeliveryAt,
      completed: outForDeliveryCompleted,
    },
    {
      status: "DELIVERED",
      label: "Delivered",
      date: shipping?.deliveredAt,
      completed:
        currentStatus === "DELIVERED",
    },
  ];
};

// ============================================================
// COMPONENT
// ============================================================

const OrderTracking = () => {
  const orderId = getOrderId();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD TRACKING
  // ============================================================

  useEffect(() => {
    const loadTracking = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyTracking(orderId);

        setData(response);
      } catch (err) {
        console.error(
          "Tracking load error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load tracking information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadTracking();
    } else {
      setLoading(false);
      setError("Invalid order ID.");
    }
  }, [orderId]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-24 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-56 rounded bg-white/10" />

            <div className="h-32 rounded-3xl bg-white/5" />

            <div className="h-96 rounded-3xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="max-w-md text-center">
          <p className="text-6xl font-semibold text-[#c9a45c]">
            !
          </p>

          <h1 className="mt-5 text-2xl font-semibold">
            Unable to Track Order
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/orders")
            }
            className="mt-7 rounded-xl bg-[#c9a45c] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e1c47a]"
          >
            Back to Orders
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const order = data?.order;

  const shipment =
    order?.shipping || {};

  const currentStatus =
    getCurrentShippingStatus(
      shipment,
      order
    );

  const timeline = buildTimeline(
    shipment,
    order
  );

  const trackingNumber =
    shipment.trackingNumber ||
    order?.trackingNumber ||
    order?.awbNumber ||
    "";

  const carrier =
    shipment.carrier ||
    order?.shippingCarrier ||
    order?.courierName ||
    "";

  const estimatedDelivery =
    shipment.estimatedDelivery ||
    order?.estimatedDelivery;

  const savedTrackingUrl =
    shipment.trackingUrl ||
    order?.trackingUrl ||
    "";

  const trackingUrl =
    getTrackingUrl(
      carrier,
      trackingNumber,
      savedTrackingUrl
    );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-white/10 bg-gradient-to-b from-[#111] to-[#050505]">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/orders/${order?._id}`
              )
            }
            className="mb-6 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-[#c9a45c]"
          >
            ← Back to Order
          </button>

          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a45c]">
            BAG HEE BAG
          </p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Track Your Order
              </h1>

              <p className="mt-2 break-all text-sm text-white/45">
                Order #{order?._id}
              </p>
            </div>

            <ShippingStatusBadge
              status={currentStatus}
            />

          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">

        {/* ====================================================
            SHIPPING INFORMATION
        ==================================================== */}

        <div className="grid gap-4 md:grid-cols-3">

          {/* COURIER */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#c9a45c]/30">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
              Courier
            </p>

            <p className="mt-3 text-sm font-semibold">
              {carrier || "Not assigned"}
            </p>
          </div>

          {/* TRACKING NUMBER */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#c9a45c]/30">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
              Tracking Number
            </p>

            <p className="mt-3 break-all text-sm font-semibold">
              {trackingNumber ||
                "Not assigned"}
            </p>
          </div>

          {/* ESTIMATED DELIVERY */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#c9a45c]/30">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
              Estimated Delivery
            </p>

            <p className="mt-3 text-sm font-semibold">
              {formatDate(
                estimatedDelivery
              )}
            </p>
          </div>

        </div>

        {/* ====================================================
            NOT SHIPPED
        ==================================================== */}

        {currentStatus ===
          "NOT_SHIPPED" && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <p className="text-sm font-semibold">
              Your order is being prepared
            </p>

            <p className="mt-2 text-xs leading-6 text-white/45">
              Your shipment has not been handed over
              to the courier yet. Tracking information
              will appear here once your order is shipped.
            </p>

          </div>
        )}

        {/* ====================================================
            COURIER TRACKING
        ==================================================== */}

        {trackingUrl &&
          trackingNumber && (
            <div className="mt-4 rounded-2xl border border-[#c9a45c]/20 bg-[#c9a45c]/5 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Courier Tracking Available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Track your shipment using your
                    courier tracking number.
                  </p>

                  <p className="mt-2 break-all text-xs text-white/30">
                    {trackingNumber}
                  </p>
                </div>

                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#c9a45c] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e1c47a]"
                >
                  Track Shipment →
                </a>

              </div>
            </div>
          )}

        {/* ====================================================
            DELIVERY JOURNEY
        ==================================================== */}

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">

          <div className="mb-8">

            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a45c]">
              Delivery Journey
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Order Tracking
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Follow your order from preparation
              to final delivery.
            </p>

          </div>

          <ShippingTimeline
            currentStatus={currentStatus}
            timeline={timeline}
          />

        </div>

        {/* ====================================================
            DELIVERY ADDRESS
        ==================================================== */}

        {order?.shippingAddress && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">

            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a45c]">
              Delivery Destination
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Shipping Address
            </h2>

            <div className="mt-5 text-sm leading-7 text-white/55">

              {order.shippingAddress.fullName && (
                <p className="font-medium text-white">
                  {
                    order.shippingAddress
                      .fullName
                  }
                </p>
              )}

              {order.shippingAddress.house && (
                <p>
                  {
                    order.shippingAddress
                      .house
                  }
                </p>
              )}

              {order.shippingAddress.street && (
                <p>
                  {
                    order.shippingAddress
                      .street
                  }
                </p>
              )}

              {order.shippingAddress.landmark && (
                <p>
                  {
                    order.shippingAddress
                      .landmark
                  }
                </p>
              )}

              <p>
                {[
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.pinCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {order.shippingAddress.country && (
                <p>
                  {
                    order.shippingAddress
                      .country
                  }
                </p>
              )}

              {order.shippingAddress.phone && (
                <p className="mt-2 text-white/40">
                  Phone:{" "}
                  {
                    order.shippingAddress
                      .phone
                  }
                </p>
              )}

            </div>
          </div>
        )}

      </section>
    </main>
  );
};

export default OrderTracking;