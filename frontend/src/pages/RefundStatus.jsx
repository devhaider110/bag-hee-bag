import { useEffect, useState } from "react";

import {
  getMyReturnRequests,
} from "../services/returnService";

import {
  getMyRefundByOrderId,
} from "../services/refundService";

const RefundStatus = () => {
  const [requests, setRequests] =
    useState([]);

  const [refunds, setRefunds] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
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

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await getMyReturnRequests();

        const list =
          data?.requests || [];

        setRequests(list);

        const refundMap = {};

        await Promise.all(
          list.map(async (item) => {
            const orderId =
              item.order?._id ||
              item.order;

            if (!orderId) {
              return;
            }

            try {
              const refundData =
                await getMyRefundByOrderId(
                  orderId
                );

              refundMap[orderId] =
                refundData?.refund ||
                null;
            } catch {
              refundMap[orderId] = null;
            }
          })
        );

        setRefunds(refundMap);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load refund status."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statusClasses = {
    REQUESTED:
      "text-yellow-300 bg-yellow-500/10",
    APPROVED:
      "text-green-300 bg-green-500/10",
    REJECTED:
      "text-red-300 bg-red-500/10",
    CANCELLED:
      "text-gray-300 bg-gray-500/10",
    PICKUP_PENDING:
      "text-blue-300 bg-blue-500/10",
    PICKED_UP:
      "text-purple-300 bg-purple-500/10",
    RETURNED:
      "text-indigo-300 bg-indigo-500/10",
    REFUND_PENDING:
      "text-cyan-300 bg-cyan-500/10",
    REFUNDED:
      "text-emerald-300 bg-emerald-500/10",
  };

  const refundStatusClasses = {
    PENDING:
      "text-yellow-300 bg-yellow-500/10",
    PROCESSING:
      "text-blue-300 bg-blue-500/10",
    COMPLETED:
      "text-emerald-300 bg-emerald-500/10",
    FAILED:
      "text-red-300 bg-red-500/10",
    NOT_REQUIRED:
      "text-gray-300 bg-gray-500/10",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] p-8 text-white">
        Loading refund status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        <button
          onClick={() =>
            navigate("/orders")
          }
          className="mb-5 text-sm text-gray-400 hover:text-[#d4af37]"
        >
          ← My Orders
        </button>

        <h1 className="text-3xl font-semibold">
          Cancellation, Return & Refund
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Track your requests and refund progress.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-7 space-y-5">

          {requests.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-gray-400">
              No cancellation or return requests found.
            </div>
          ) : (
            requests.map((item) => {
              const orderId =
                item.order?._id;

              const refund =
                refunds[orderId];

              return (
                <div
                  key={item._id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        {item.type ===
                        "CANCELLATION"
                          ? "Cancellation"
                          : "Return"}
                      </p>

                      <h2 className="mt-1 font-semibold">
                        Order #{orderId}
                      </h2>

                      <p className="mt-2 text-sm text-gray-400">
                        {item.reason}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[
                          item.status
                        ] ||
                        "bg-white/5 text-gray-300"
                      }`}
                    >
                      {item.status?.replaceAll(
                        "_",
                        " "
                      )}
                    </span>
                  </div>

                  {refund && (
                    <div className="mt-5 border-t border-white/10 pt-5">

                      <div className="grid gap-4 sm:grid-cols-3">

                        <div>
                          <p className="text-xs text-gray-500">
                            Refund Amount
                          </p>

                          <p className="mt-1 font-semibold text-[#e4c76b]">
                            ₹
                            {Number(
                              refund.amount || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Refund Method
                          </p>

                          <p className="mt-1 text-sm">
                            {refund.refundMethod ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Refund Status
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              refundStatusClasses[
                                refund.status
                              ] ||
                              "bg-white/5 text-gray-300"
                            }`}
                          >
                            {refund.status?.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                      </div>

                      {refund.transactionId && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500">
                            Transaction ID
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-gray-300">
                            {refund.transactionId}
                          </p>
                        </div>
                      )}

                      {refund.adminNote && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Admin Note
                          </p>

                          <p className="mt-1 text-sm text-gray-300">
                            {refund.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundStatus;