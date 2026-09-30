import ShippingStatusBadge from "./ShippingStatusBadge";

const ALL_STATUSES = [
  "ORDER_PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS = {
  ORDER_PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

const STATUS_DESCRIPTIONS = {
  ORDER_PLACED:
    "Your order has been placed successfully.",

  CONFIRMED:
    "Your order has been confirmed by BAG HEE BAG.",

  PROCESSING:
    "Your order is being prepared.",

  PACKED:
    "Your order has been packed and is ready for dispatch.",

  SHIPPED:
    "Your order has been handed over for delivery.",

  OUT_FOR_DELIVERY:
    "Your order is out for delivery.",

  DELIVERED:
    "Your order has been delivered successfully.",
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ShippingTimeline = ({
  currentStatus,
  timeline = [],
}) => {
  const currentIndex =
    ALL_STATUSES.indexOf(currentStatus);

  const getTimelineItem = (status) => {
    return timeline.find(
      (item) => item.status === status
    );
  };

  return (
    <div className="space-y-0">
      {ALL_STATUSES.map((status, index) => {
        const item = getTimelineItem(status);

        const completed =
          index <= currentIndex;

        const isCurrent =
          status === currentStatus;

        return (
          <div
            key={status}
            className="relative flex gap-4 sm:gap-5"
          >
            {index !== ALL_STATUSES.length - 1 && (
              <div
                className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                  index < currentIndex
                    ? "bg-[#c9a45c]"
                    : "bg-white/10"
                }`}
              />
            )}

            <div className="relative z-10 shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                  completed
                    ? "border-[#c9a45c] bg-[#c9a45c] text-black shadow-[0_0_25px_rgba(201,164,92,0.18)]"
                    : "border-white/10 bg-[#0c0c0c] text-white/30"
                }`}
              >
                {completed ? "✓" : index + 1}
              </div>
            </div>

            <div
              className={`min-w-0 flex-1 pb-9 ${
                isCurrent
                  ? "opacity-100"
                  : completed
                  ? "opacity-90"
                  : "opacity-45"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {STATUS_LABELS[status]}
                </h3>

                {isCurrent && (
                  <ShippingStatusBadge
                    status={status}
                  />
                )}
              </div>

              <p className="mt-2 text-sm leading-6 text-white/50">
                {item?.description ||
                  STATUS_DESCRIPTIONS[status]}
              </p>

              {item?.location && (
                <p className="mt-2 text-xs text-white/35">
                  📍 {item.location}
                </p>
              )}

              {item?.completedAt && (
                <p className="mt-2 text-xs text-[#c9a45c]/80">
                  {formatDate(item.completedAt)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShippingTimeline;