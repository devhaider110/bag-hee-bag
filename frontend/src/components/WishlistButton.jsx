import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  addToWishlist,
  checkWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

const WishlistButton = ({
  productId,
  className = "",
  showLabel = false,
}) => {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // CHECK CURRENT WISHLIST STATUS
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const loadWishlistStatus = async () => {
      if (
        !isAuthenticated ||
        !user ||
        !token ||
        !productId
      ) {
        if (isMounted) {
          setIsWishlisted(false);
        }

        return;
      }

      try {
        const response = await checkWishlist(
          token,
          productId
        );

        console.log(
          "Wishlist status response:",
          response
        );

        if (isMounted) {
          setIsWishlisted(
            Boolean(response?.isWishlisted)
          );
        }
      } catch (error) {
        console.error(
          "Wishlist status error:",
          error.response?.data || error.message
        );

        if (isMounted) {
          setIsWishlisted(false);
        }
      }
    };

    loadWishlistStatus();

    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    user,
    token,
    productId,
  ]);

  // ==========================================
  // ADD / REMOVE WISHLIST
  // ==========================================
  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // ------------------------------------------
    // USER NOT LOGGED IN
    // ------------------------------------------
    if (!isAuthenticated || !user) {
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

    // ------------------------------------------
    // SAFETY CHECK
    // ------------------------------------------
    if (!token) {
      console.error(
        "Wishlist error: Authentication token is missing."
      );

      return;
    }

    if (!productId) {
      console.error(
        "Wishlist error: Product ID is missing."
      );

      return;
    }

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // REMOVE FROM WISHLIST
      // ========================================
      if (isWishlisted) {
        const response =
          await removeFromWishlist(
            token,
            productId
          );

        console.log(
          "Wishlist remove response:",
          response
        );

        // Only update UI after successful API call
        setIsWishlisted(false);
      }

      // ========================================
      // ADD TO WISHLIST
      // ========================================
      else {
        const response =
          await addToWishlist(
            token,
            productId
          );

        console.log(
          "Wishlist add response:",
          response
        );

        // Only update UI after successful API call
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error(
        "Wishlist action failed:",
        error.response?.data || error.message
      );

      console.error(
        "Wishlist status code:",
        error.response?.status
      );

      // Keep existing state if API fails
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={loading}
      aria-label={
        isWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      title={
        isWishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`
        group inline-flex
        items-center justify-center
        gap-2 rounded-full
        border border-white/10
        bg-black/60
        backdrop-blur-md
        shadow-lg
        transition-all duration-300
        hover:scale-110
        hover:bg-black/80
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
    >
      {/* ======================================
          HEART
      ======================================= */}
      <span
        className={`
          text-2xl
          leading-none
          transition-all
          duration-300
          ${
            isWishlisted
              ? "scale-110 text-red-500"
              : "text-white group-hover:text-red-400"
          }
        `}
      >
        {isWishlisted ? "♥" : "♡"}
      </span>

      {/* ======================================
          OPTIONAL LABEL
      ======================================= */}
      {showLabel && (
        <span className="text-sm font-medium text-white">
          {isWishlisted
            ? "Wishlisted"
            : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;