import { useEffect, useState } from "react";

import {
  getAllRefunds,
  updateRefundStatus,
} from "../services/refundService";

const AdminRefunds = () => {
  const [refunds, setRefunds] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [savingId, setSavingId] =
    useState("");

  const navigate = (path) => {
    window.history.pushState(
      {},
      "",
      path
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  };

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAllRefunds({
          status: statusFilter,
          search,
        });

      setRefunds(
        data?.refunds || []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load refunds."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, [statusFilter]);

  const updateStatus = async (
    refund,
    newStatus
  ) => {
    try {
      setSavingId(refund._id);
      setError("");

      await updateRefundStatus(
        refund._id,
        {
          status: newStatus,
        }
      );

      await loadRefunds();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update refund."
      );
    } finally {
      setSavingId("");
    }
  };

  const getClass = (value) => {
    const classes = {
      PENDING:
        "bg-yellow-500/10 text-yellow-300",
      PROCESSING:
        "bg-blue-500/10 text-blue-300",
      COMPLETED:
        "bg-emerald-500/10 text-emerald-300",
      FAILED:
        "bg-red-500/10 text-red-300",
      NOT_REQUIRED:
        "bg-gray-500/10 text-gray-300",
    };

    return (
      classes[value] ||
      "bg-white/5 text-gray-300"
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <button
          onClick={() =>
            navigate(
              "/admin/returns"
            )
          }
          className="mb-5 text-sm text-gray-400 hover:text-[#d4af37]"
        >
          ← Cancellations & Returns
        </button>

        <div className="mb-7">
          <h1 className="text-3xl font-semibold">
            Refund Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage refund processing and transaction references.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-3 md:grid-cols-3">

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search order, customer, transaction..."
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-[#d4af37]"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm"
            >
              <option value="">
                All Refunds
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="PROCESSING">
                Processing
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="FAILED">
                Failed
              </option>
            </select>

            <button
              onClick={loadRefunds}
              className="rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black"
            >
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          {loading ? (
            <div className="p-10 text-center text-gray-400">
              Loading refunds...
            </div>
          ) : refunds.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              No refunds found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">
                <thead className="border-b border-white/10 bg-black/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-gray-500">
                      Method
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {refunds.map(
                    (refund) => (
                      <tr
                        key={refund._id}
                        className="border-b border-white/5"
                      >
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs">
                            {refund.order?._id ||
                              "—"}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            {refund._id}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm">
                            {refund.user?.name ||
                              "—"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {refund.user?.email ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#e4c76b]">
                          ₹
                          {Number(
                            refund.amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs">
                          {refund.refundMethod ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getClass(
                              refund.status
                            )}`}
                          >
                            {refund.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {savingId ===
                          refund._id ? (
                            <span className="text-xs text-gray-500">
                              Updating...
                            </span>
                          ) : (
                            <select
                              value={
                                refund.status
                              }
                              onChange={(e) =>
                                updateStatus(
                                  refund,
                                  e.target.value
                                )
                              }
                              className="rounded-xl border border-white/10 bg-black px-3 py-2 text-xs"
                              disabled={[
                                "COMPLETED",
                                "NOT_REQUIRED",
                              ].includes(
                                refund.status
                              )}
                            >
                              <option value="PENDING">
                                Pending
                              </option>

                              <option value="PROCESSING">
                                Processing
                              </option>

                              <option value="COMPLETED">
                                Completed
                              </option>

                              <option value="FAILED">
                                Failed
                              </option>
                            </select>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRefunds;