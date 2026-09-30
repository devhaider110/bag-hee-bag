const PaymentMethod = ({
  value,
  onChange,
}) => {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
      <h2 className="mb-5 text-xl font-semibold text-white">
        Payment Method
      </h2>

      <div className="space-y-4">

        {/* Razorpay */}
        <button
          type="button"
          onClick={() =>
            onChange("RAZORPAY")
          }
          className={`w-full rounded-2xl border p-4 text-left transition ${
            value === "RAZORPAY"
              ? "border-amber-400 bg-amber-400/10"
              : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                value === "RAZORPAY"
                  ? "border-amber-400"
                  : "border-neutral-600"
              }`}
            >
              {value === "RAZORPAY" && (
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              )}
            </div>

            <div>
              <p className="font-semibold text-white">
                Online Payment
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                UPI, Cards, Net Banking & more
              </p>
            </div>
          </div>
        </button>

        {/* COD */}
        <button
          type="button"
          onClick={() =>
            onChange("COD")
          }
          className={`w-full rounded-2xl border p-4 text-left transition ${
            value === "COD"
              ? "border-amber-400 bg-amber-400/10"
              : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                value === "COD"
                  ? "border-amber-400"
                  : "border-neutral-600"
              }`}
            >
              {value === "COD" && (
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              )}
            </div>

            <div>
              <p className="font-semibold text-white">
                Cash on Delivery
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Pay when your order arrives
              </p>
            </div>
          </div>
        </button>

      </div>
    </div>
  );
};

export default PaymentMethod;