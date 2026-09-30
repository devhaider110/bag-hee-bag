import {
  useState,
} from "react";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useCart,
} from "../context/CartContext";

const AddToCartButton = ({
  productId,
  variantId = null,
  quantity = 1,
  disabled = false,
  className = "",
}) => {
  const {
    isAuthenticated,
  } = useAuth();

  const {
    addToCart,
  } = useCart();

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleAddToCart = async (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      window.history.pushState(
        {},
        "",
        "/login"
      );

      window.dispatchEvent(
        new PopStateEvent("popstate")
      );

      return;
    }

    if (
      !productId ||
      disabled ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await addToCart(
        productId,
        quantity,
        variantId
      );

      setMessage(
        "Added to cart"
      );
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to add to cart."
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        setMessage("");
      }, 2500);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={
          disabled || loading
        }
        className={`
          flex w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-[#d4af37]/50
          bg-[#d4af37]
          px-5 py-3.5
          text-sm
          font-semibold
          uppercase
          tracking-[0.14em]
          text-black
          shadow-lg
          shadow-[#d4af37]/10
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:bg-[#e3c889]
          hover:shadow-xl
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${className}
        `}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            Adding...
          </>
        ) : (
          <>
            <span className="text-lg">
              🛒
            </span>

            Add to Cart
          </>
        )}
      </button>

      {message && (
        <p
          className={`
            mt-2 text-center
            text-xs font-medium
            ${
              message ===
              "Added to cart"
                ? "text-emerald-500"
                : "text-red-400"
            }
          `}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default AddToCartButton;