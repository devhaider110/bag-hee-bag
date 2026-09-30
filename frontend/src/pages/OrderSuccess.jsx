// src/components/OrderSuccess.jsx
// (ya jahan tumhare components rehte hain, wahan save kar lo)

const OrderSuccess = () => {
  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center shadow-2xl md:p-12">

        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-4xl text-emerald-400">
          ✓
        </div>

        {/* Brand */}
        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-amber-400">
          BAG HEE BAG
        </p>

        {/* Heading */}
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Order Placed Successfully
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md leading-7 text-neutral-500">
          Thank you for shopping with BAG HEE BAG.
          Your order has been received successfully.
        </p>

        {/* Buttons */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">

          {/* Continue Shopping */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-neutral-700 px-5 py-3 font-semibold text-white transition duration-300 hover:border-amber-400 hover:bg-neutral-900"
          >
            Continue Shopping
          </button>

          {/* View Orders */}
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="rounded-xl bg-amber-400 px-5 py-3 font-semibold text-black transition duration-300 hover:bg-amber-300"
          >
            View Orders
          </button>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;