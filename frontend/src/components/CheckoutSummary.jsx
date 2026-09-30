const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const CheckoutSummary = ({
  checkout,
}) => {
  if (!checkout) return null;

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Price Details
      </h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-neutral-400">
          <span>Subtotal</span>
          <span className="text-white">
            {formatPrice(checkout.subtotal)}
          </span>
        </div>

        {checkout.productDiscount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Product Discount</span>
            <span>
              - {formatPrice(checkout.productDiscount)}
            </span>
          </div>
        )}

        {checkout.couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>
              Coupon
              {checkout.couponCode
                ? ` (${checkout.couponCode})`
                : ""}
            </span>

            <span>
              - {formatPrice(checkout.couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-neutral-400">
          <span>Delivery</span>

          <span
            className={
              checkout.shippingCharge === 0
                ? "font-medium text-emerald-400"
                : "text-white"
            }
          >
            {checkout.shippingCharge === 0
              ? "FREE"
              : formatPrice(
                  checkout.shippingCharge
                )}
          </span>
        </div>

        {checkout.tax > 0 && (
          <div className="flex justify-between text-neutral-400">
            <span>Tax</span>
            <span className="text-white">
              {formatPrice(checkout.tax)}
            </span>
          </div>
        )}
      </div>

      <div className="my-6 border-t border-neutral-800" />

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-white">
          Total Payable
        </span>

        <span className="text-2xl font-bold text-amber-400">
          {formatPrice(
            checkout.totalAmount
          )}
        </span>
      </div>
    </div>
  );
};

export default CheckoutSummary;