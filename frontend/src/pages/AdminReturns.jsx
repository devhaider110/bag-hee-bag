import { useEffect, useState } from "react";

import { getAllReturnRequests } from "../services/returnService";

const AdminReturns = () => {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [type, setType] = useState("");

  const [status, setStatus] = useState("");

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
  // LOAD RETURN / CANCELLATION REQUESTS
  // =====================================================

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllReturnRequests({
        search,
        type,
        status,
      });

      setRequests(data?.requests || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {
    loadRequests();
  }, [type, status]);

  // =====================================================
  // STATUS COLORS
  // =====================================================

  const getStatusClass = (value) => {
    const classes = {
      REQUESTED:
        "bg-yellow-500/10 text-yellow-300",

      APPROVED:
        "bg-green-500/10 text-green-300",

      REJECTED:
        "bg-red-500/10 text-red-300",

      CANCELLED:
        "bg-gray-500/10 text-gray-300",

      PICKUP_PENDING:
        "bg-blue-500/10 text-blue-300",

      PICKED_UP:
        "bg-purple-500/10 text-purple-300",

      RETURNED:
        "bg-indigo-500/10 text-indigo-300",

      REFUND_PENDING:
        "bg-cyan-500/10 text-cyan-300",

      REFUNDED:
        "bg-emerald-500/10 text-emerald-300",
    };

    return (
      classes[value] ||
      "bg-white/5 text-gray-300"
    );
  };

  // =====================================================
  // VIEW REQUEST
  // =====================================================

  const handleView = (id) => {
    if (!id) {
      return;
    }

    navigate(`/admin/returns/${id}`);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">
          <h1 className="text-3xl font-semibold">
            Cancellations & Returns
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage customer cancellation and return
            requests.
          </p>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">

          <div className="grid gap-3 md:grid-cols-4">

            {/* SEARCH */}

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadRequests();
                }
              }}
              placeholder="Search order, customer..."
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#d4af37]"
            />

            {/* TYPE */}

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
            >
              <option value="">
                All Types
              </option>

              <option value="CANCELLATION">
                Cancellation
              </option>

              <option value="RETURN">
                Return
              </option>
            </select>

            {/* STATUS */}

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
            >
              <option value="">
                All Statuses
              </option>

              <option value="REQUESTED">
                Requested
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="PICKUP_PENDING">
                Pickup Pending
              </option>

              <option value="PICKED_UP">
                Picked Up
              </option>

              <option value="RETURNED">
                Returned
              </option>

              <option value="REFUND_PENDING">
                Refund Pending
              </option>

              <option value="REFUNDED">
                Refunded
              </option>
            </select>

            {/* SEARCH BUTTON */}

            <button
              type="button"
              onClick={loadRequests}
              className="rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
            >
              Search
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            REQUEST TABLE
        ================================================= */}

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                {/* TABLE HEADER */}

                <thead className="border-b border-white/10 bg-black/30">
                  <tr>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Request
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Action
                    </th>

                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>

                  {requests.map((item) => (

                    <tr
                      key={item._id}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >

                      {/* REQUEST */}

                      <td className="px-5 py-4">

                        <p className="font-medium">
                          {item.type ===
                          "CANCELLATION"
                            ? "Cancellation"
                            : "Return"}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-gray-600">
                          {item._id}
                        </p>

                      </td>

                      {/* CUSTOMER */}

                      <td className="px-5 py-4">

                        <p className="text-sm">
                          {item.user?.name || "—"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.user?.email || "—"}
                        </p>

                      </td>

                      {/* ORDER */}

                      <td className="px-5 py-4">

                        <p className="font-mono text-xs">
                          {item.order?._id || "—"}
                        </p>

                      </td>

                      {/* REFUND AMOUNT */}

                      <td className="px-5 py-4 font-semibold text-[#e4c76b]">

                        ₹
                        {Number(
                          item.refundAmount || 0
                        ).toLocaleString("en-IN")}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status
                            ?.replaceAll("_", " ")}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleView(item._id)
                          }
                          className="rounded-xl border border-[#d4af37]/30 px-3 py-2 text-xs font-semibold text-[#e4c76b] transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminReturns;