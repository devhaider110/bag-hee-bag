import { useEffect, useState } from "react";

import {
  cancelOrder,
  createReturnRequest,
} from "../services/returnService";

import { getMyOrderById } from "../services/orderService";

const ReturnRequest = () => {
  const [orderId, setOrderId] =
    useState("");

  const [order, setOrder] =
    useState(null);

  const [type, setType] =
    useState("RETURN");

  const [reason, setReason] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

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

  const getOrderIdFromPath = () => {
    const parts =
      window.location.pathname
        .split("/")
        .filter(Boolean);

    if (
      parts.length === 3 &&
      parts[0] === "orders" &&
      parts[2] === "return"
    ) {
      const id = parts[1];

      if (
        /^[a-fA-F0-9]{24}$/.test(id)
      ) {
        return id;
      }
    }

    return "";
  };

  useEffect(() => {
    const id =
      getOrderIdFromPath();

    if (!id) {
      setError(
        "Invalid order ID."
      );

      setLoading(false);
      return;
    }

    setOrderId(id);

    const load = async () => {
      try {
        const data =
          await getMyOrderById(id);

        setOrder(
          data?.order ||
            data?.data ||
            null
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cancellableStatuses = [
    "PENDING",
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
  ];

  const canCancel =
    order &&
    cancellableStatuses.includes(
      order.orderStatus
    );

  const canReturn =
    order?.orderStatus ===
    "DELIVERED";

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError(
        "Please select or enter a reason."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      if (type === "CANCEL") {
        await cancelOrder(
          orderId,
          {
            reason,
            description,
          }
        );
      } else {
        await createReturnRequest(
          orderId,
          {
            reason,
            description,
          }
        );
      }

      alert(
        type === "CANCEL"
          ? "Cancellation request submitted successfully."
          : "Return request submitted successfully."
      );

      navigate(
        `/orders/${orderId}`
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to submit request."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] p-8 text-white">
        Loading order...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#080808] p-8 text-white">
        <p className="text-red-300">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() =>
            navigate(
              `/orders/${orderId}`
            )
          }
          className="mb-5 text-sm text-gray-400 hover:text-[#d4af37]"
        >
          ← Back to Order
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

          <h1 className="text-2xl font-semibold">
            Cancellation & Return
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Order #{orderId}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">

            {canCancel && (
              <button
                type="button"
                onClick={() =>
                  setType("CANCEL")
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  type === "CANCEL"
                    ? "border-[#d4af37] bg-[#d4af37]/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="text-xl">
                  ✕
                </div>

                <h2 className="mt-2 font-semibold">
                  Cancel Order
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Cancel before the order is shipped.
                </p>
              </button>
            )}

            {canReturn && (
              <button
                type="button"
                onClick={() =>
                  setType("RETURN")
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  type === "RETURN"
                    ? "border-[#d4af37] bg-[#d4af37]/10"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="text-xl">
                  ↩
                </div>

                <h2 className="mt-2 font-semibold">
                  Return Order
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Available for eligible delivered orders.
                </p>
              </button>
            )}
          </div>

          <div className="mt-7">
            <label className="mb-2 block text-sm font-medium">
              Reason
            </label>

            <select
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-[#d4af37]"
            >
              <option value="">
                Select reason
              </option>

              <option value="Changed my mind">
                Changed my mind
              </option>

              <option value="Ordered by mistake">
                Ordered by mistake
              </option>

              <option value="Wrong product received">
                Wrong product received
              </option>

              <option value="Product damaged">
                Product damaged
              </option>

              <option value="Product not as expected">
                Product not as expected
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Additional Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Tell us more..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-[#d4af37]"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-semibold text-black transition hover:bg-[#e5c45a] disabled:opacity-50"
          >
            {saving
              ? "Submitting..."
              : type === "CANCEL"
              ? "Submit Cancellation Request"
              : "Submit Return Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnRequest;