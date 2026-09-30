const statusConfig = {
  REQUESTED: {
    label: "Requested",
    className:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },

  APPROVED: {
    label: "Approved",
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },

  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-500/10 text-red-400 border-red-500/20",
  },

  PICKUP_PENDING: {
    label: "Pickup Pending",
    className:
      "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },

  PICKED_UP: {
    label: "Picked Up",
    className:
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },

  RETURNED: {
    label: "Returned",
    className:
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },

  REFUND_PENDING: {
    label: "Refund Pending",
    className:
      "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },

  REFUNDED: {
    label: "Refunded",
    className:
      "bg-green-500/10 text-green-400 border-green-500/20",
  },
};

const ReturnStatusBadge = ({ status }) => {
  const config =
    statusConfig[status] || {
      label: status || "Unknown",
      className:
        "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default ReturnStatusBadge;