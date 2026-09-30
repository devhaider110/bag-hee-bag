import { useEffect, useState } from "react";

import {
  getAdminReturnRequest,
  updateReturnStatus,
} from "../services/returnService";

const AdminReturnDetails = () => {
  const [requestId, setRequestId] = useState("");
  const [request, setRequest] = useState(null);

  const [status, setStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CUSTOM NAVIGATION
  // =====================================================

  const navigate = (path) => {
    window.history.pushState({}, "", path);

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  };

  // =====================================================
  // GET REQUEST ID FROM URL
  // =====================================================

  const getRequestIdFromPath = () => {
    const parts = window.location.pathname
      .split("/")
      .filter(Boolean);

    // /admin/returns/:id
    if (
      parts.length !== 3 ||
      parts[0] !== "admin" ||
      parts[1] !== "returns"
    ) {
      return "";
    }

    const id = parts[2];

    // MongoDB ObjectId validation
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return "";
    }

    return id;
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (value) => {
    const labels = {
      REQUESTED: "Request Received",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      PICKUP_PENDING: "Pickup Pending",
      PICKED_UP: "Picked Up",
      RETURNED: "Returned",
      REFUND_PENDING: "Refund Pending",
      REFUNDED: "Refunded",
    };

    return labels[value] || value || "—";
  };

  // =====================================================
  // STATUS CLASSES
  // =====================================================

  const getStatusClasses = (value) => {
    const classes = {
      REQUESTED:
        "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",

      APPROVED:
        "bg-green-500/10 text-green-300 border-green-500/20",

      REJECTED:
        "bg-red-500/10 text-red-300 border-red-500/20",

      PICKUP_PENDING:
        "bg-blue-500/10 text-blue-300 border-blue-500/20",

      PICKED_UP:
        "bg-purple-500/10 text-purple-300 border-purple-500/20",

      RETURNED:
        "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",

      REFUND_PENDING:
        "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",

      REFUNDED:
        "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    };

    return (
      classes[value] ||
      "bg-white/5 text-gray-300 border-white/10"
    );
  };

  // =====================================================
  // LOAD REQUEST
  // =====================================================

  const loadRequest = async (id) => {
    if (!id) {
      setError("Invalid return request ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAdminReturnRequest(id);

      const returnRequest =
        data?.request ||
        data?.returnRequest ||
        data?.data ||
        null;

      if (!returnRequest) {
        throw new Error(
          "Return request not found."
        );
      }

      setRequest(returnRequest);

      setStatus(
        returnRequest.status || "REQUESTED"
      );

      setAdminNote(
        returnRequest.adminNote || ""
      );
    } catch (err) {
      console.error(
        "Admin return details error:",
        err
      );

      setRequest(null);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load return request."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD + URL CHANGE
  // =====================================================

  useEffect(() => {
    const loadFromCurrentUrl = () => {
      const id = getRequestIdFromPath();

      if (!id) {
        setRequestId("");
        setRequest(null);
        setError("Invalid return request ID.");
        setLoading(false);
        return;
      }

      setRequestId(id);
      loadRequest(id);
    };

    loadFromCurrentUrl();

    window.addEventListener(
      "popstate",
      loadFromCurrentUrl
    );

    return () => {
      window.removeEventListener(
        "popstate",
        loadFromCurrentUrl
      );
    };
  }, []);

  // =====================================================
  // UPDATE REQUEST
  // =====================================================

  const handleUpdate = async () => {
    if (!requestId || !status || !request) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateReturnStatus(
        requestId,
        {
          status,
          adminNote,
        }
      );

      await loadRequest(requestId);

      alert(
        "Return request updated successfully."
      );
    } catch (err) {
      console.error(
        "Update return request error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update return request."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // AVAILABLE NEXT STATUSES
  // =====================================================

  const getAvailableStatuses = () => {
    if (!request) {
      return [];
    }

    // ---------------------------------------------
    // REQUESTED
    // ---------------------------------------------

    if (request.status === "REQUESTED") {
      return [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
      ];
    }

    // ---------------------------------------------
    // APPROVED RETURN
    // ---------------------------------------------

    if (
      request.status === "APPROVED" &&
      request.type === "RETURN"
    ) {
      return [
        "APPROVED",
        "PICKUP_PENDING",
      ];
    }

    // ---------------------------------------------
    // APPROVED CANCELLATION
    // ---------------------------------------------

    if (
      request.status === "APPROVED" &&
      request.type === "CANCELLATION"
    ) {
      return [
        "APPROVED",
        "REFUND_PENDING",
      ];
    }

    // ---------------------------------------------
    // PICKUP PENDING
    // ---------------------------------------------

    if (
      request.status === "PICKUP_PENDING"
    ) {
      return [
        "PICKUP_PENDING",
        "PICKED_UP",
      ];
    }

    // ---------------------------------------------
    // PICKED UP
    // ---------------------------------------------

    if (
      request.status === "PICKED_UP"
    ) {
      return [
        "PICKED_UP",
        "RETURNED",
      ];
    }

    // ---------------------------------------------
    // RETURNED
    // ---------------------------------------------

    if (
      request.status === "RETURNED"
    ) {
      return [
        "RETURNED",
        "REFUND_PENDING",
      ];
    }

    // ---------------------------------------------
    // REFUND PENDING
    // ---------------------------------------------

    if (
      request.status === "REFUND_PENDING"
    ) {
      return [
        "REFUND_PENDING",
        "REFUNDED",
      ];
    }

    // ---------------------------------------------
    // FINAL STATUS
    // ---------------------------------------------

    return [
      request.status,
    ];
  };

  // =====================================================
  // FINAL STATUS
  // =====================================================

  const isFinal =
    request?.status === "REJECTED" ||
    request?.status === "REFUNDED";

  const availableStatuses =
    getAvailableStatuses();

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

            <p className="text-sm text-gray-400">
              Loading return request...
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR WITHOUT REQUEST
  // =====================================================

  if (error && !request) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">

            <div className="mb-4 text-4xl">
              ⚠️
            </div>

            <h2 className="text-xl font-semibold">
              Unable to Load Return Request
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/returns")
              }
              className="mt-6 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
            >
              ← Back to Returns
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/returns")
              }
              className="mb-3 text-sm text-gray-400 transition hover:text-[#d4af37]"
            >
              ← Back to Returns
            </button>

            <h1 className="text-2xl font-semibold sm:text-3xl">
              Return Request Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review and manage customer cancellation
              or return request.
            </p>

          </div>

          {request?.status && (
            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-semibold ${getStatusClasses(
                request.status
              )}`}
            >
              {getStatusLabel(
                request.status
              )}
            </span>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">

            {/* =================================================
                REQUEST INFORMATION
            ================================================= */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Request Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* REQUEST TYPE */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Request Type
                  </p>

                  <p className="mt-1 font-medium">
                    {request?.type ===
                    "CANCELLATION"
                      ? "Cancellation"
                      : request?.type ===
                        "RETURN"
                      ? "Return"
                      : request?.type || "—"}
                  </p>
                </div>

                {/* STATUS */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Current Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      request?.status
                    )}`}
                  >
                    {getStatusLabel(
                      request?.status
                    )}
                  </span>
                </div>

                {/* REASON */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Reason
                  </p>

                  <p className="mt-1 text-sm text-gray-200">
                    {request?.reason || "—"}
                  </p>
                </div>

                {/* REQUESTED AT */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Requested At
                  </p>

                  <p className="mt-1 text-sm text-gray-200">
                    {request?.createdAt
                      ? new Date(
                          request.createdAt
                        ).toLocaleString()
                      : "—"}
                  </p>
                </div>

                {/* PREVIOUS ORDER STATUS */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Previous Order Status
                  </p>

                  <p className="mt-1 text-sm text-gray-200">
                    {request?.previousOrderStatus ||
                      "—"}
                  </p>
                </div>

                {/* REFUND AMOUNT */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Refund Amount
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#e4c76b]">
                    ₹
                    {Number(
                      request?.refundAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mt-5 border-t border-white/10 pt-5">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Customer Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                  {request?.description ||
                    "No additional description provided."}
                </p>

              </div>

            </section>

            {/* =================================================
                CUSTOMER
            ================================================= */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <h2 className="mb-5 text-lg font-semibold">
                Customer
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Name
                  </p>

                  <p className="mt-1 text-sm">
                    {request?.user?.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Username
                  </p>

                  <p className="mt-1 text-sm">
                    {request?.user?.username ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm">
                    {request?.user?.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm">
                    {request?.user?.phone || "—"}
                  </p>
                </div>

              </div>

            </section>

            {/* =================================================
                ORDER
            ================================================= */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

              <div className="mb-5 flex items-center justify-between gap-3">

                <h2 className="text-lg font-semibold">
                  Order
                </h2>

                {request?.order?._id && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/orders/${request.order._id}`
                      )
                    }
                    className="rounded-xl border border-[#d4af37]/30 px-3 py-2 text-xs font-medium text-[#e4c76b] transition hover:bg-[#d4af37]/10"
                  >
                    View Order
                  </button>
                )}

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Order ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-gray-200">
                    {request?.order?._id || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Order Status
                  </p>

                  <p className="mt-1 text-sm">
                    {request?.order?.orderStatus ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Payment Status
                  </p>

                  <p className="mt-1 text-sm">
                    {request?.order?.paymentStatus ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Payment Method
                  </p>

                  <p className="mt-1 text-sm">
                    {request?.order?.paymentMethod ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Total Amount
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#e4c76b]">
                    ₹
                    {Number(
                      request?.order?.totalAmount ||
                        0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

              </div>

            </section>

          </div>

          {/* =================================================
              ADMIN PANEL
          ================================================= */}

          <div>

            <section className="sticky top-24 rounded-3xl border border-[#d4af37]/20 bg-gradient-to-b from-[#17130a] to-white/[0.03] p-5 sm:p-6">

              <div className="mb-6">

                <p className="text-xs uppercase tracking-[0.2em] text-[#b89b45]">
                  Admin Panel
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Manage Request
                </h2>

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Update Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  disabled={isFinal}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {availableStatuses.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {getStatusLabel(
                          option
                        )}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* FLOW INFO */}

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">

                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Current Flow
                </p>

                {request?.type ===
                "CANCELLATION" ? (
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Requested → Approved →
                    Refund Pending → Refunded
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Requested → Approved →
                    Pickup Pending → Picked Up →
                    Returned → Refund Pending →
                    Refunded
                  </p>
                )}

              </div>

              {/* ADMIN NOTE */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Admin Note
                </label>

                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(
                      event.target.value
                    )
                  }
                  disabled={isFinal}
                  rows={6}
                  placeholder="Add an internal/admin note..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#d4af37]/60 disabled:cursor-not-allowed disabled:opacity-50"
                />

              </div>

              {/* UPDATE BUTTON */}

              <button
                type="button"
                onClick={handleUpdate}
                disabled={
                  saving ||
                  isFinal ||
                  !status
                }
                className="mt-5 w-full rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Updating..."
                  : isFinal
                  ? "Request Finalized"
                  : "Update Request"}
              </button>

              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/returns")
                }
                className="mt-3 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                ← Go Back
              </button>

              {/* REQUEST ID */}

              <div className="mt-6 border-t border-white/10 pt-5">

                <p className="text-xs text-gray-500">
                  Return Request ID
                </p>

                <p className="mt-1 break-all font-mono text-[11px] text-gray-400">
                  {requestId || "—"}
                </p>

              </div>

            </section>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReturnDetails;