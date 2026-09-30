import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { validateCoupon } from "../services/couponService";

const CouponBox = ({
  cartValue,
  appliedCoupon,
  onApply,
  onRemove,
}) => {
  const { token } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please enter a coupon code.");
      return;
    }

    if (!token) {
      setError("Please login to use coupons.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await validateCoupon(
        token,
        code,
        cartValue
      );

      onApply(response);

      setCode("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to apply coupon."
      );
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
              Coupon Applied
            </p>

            <h3 className="mt-1 text-lg font-bold text-white">
              {appliedCoupon.coupon?.code}
            </h3>

            {appliedCoupon.coupon?.description && (
              <p className="mt-1 text-sm text-gray-400">
                {appliedCoupon.coupon.description}
              </p>
            )}

            <p className="mt-2 text-sm text-emerald-400">
              You saved ₹
              {Number(
                appliedCoupon.discount || 0
              ).toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Offers
        </p>

        <h3 className="mt-1 text-lg font-semibold text-white">
          Have a coupon?
        </h3>
      </div>

      <form
        onSubmit={handleApply}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Enter coupon code"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking..." : "Apply"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default CouponBox;