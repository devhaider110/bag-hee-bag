const statusLabels = {
  ORDER_PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

const statusClasses = {
  ORDER_PLACED:
    "border-white/10 bg-white/5 text-white/70",

  CONFIRMED:
    "border-blue-400/20 bg-blue-400/10 text-blue-300",

  PROCESSING:
    "border-purple-400/20 bg-purple-400/10 text-purple-300",

  PACKED:
    "border-amber-400/20 bg-amber-400/10 text-amber-300",

  SHIPPED:
    "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",

  OUT_FOR_DELIVERY:
    "border-orange-400/20 bg-orange-400/10 text-orange-300",

  DELIVERED:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

const ShippingStatusBadge = ({ status }) => {
  const label =
    statusLabels[status] || status || "Unknown";

  const classes =
    statusClasses[status] ||
    "border-white/10 bg-white/5 text-white/60";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
};

export default ShippingStatusBadge;