import React from "react";
import WishlistButton from "./WishlistButton";

const StoreProductCard = ({ product }) => {
  const hasDiscount =
    product.discountPrice &&
    Number(product.discountPrice) < Number(product.price);

  const displayPrice = hasDiscount
    ? product.discountPrice
    : product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.price) - Number(product.discountPrice)) /
          Number(product.price)) *
          100
      )
    : 0;

  const isOutOfStock = Number(product.stock) <= 0;

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0b0b] shadow-[0_15px_50px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:border-[#d4af37]/30 hover:shadow-[0_25px_70px_rgba(0,0,0,0.45)]">

      {/* ================= IMAGE ================= */}
      <div
        className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-[#111]"
        onClick={handleProductClick}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#171717] to-[#090909]">
            <span className="text-6xl opacity-60">👜</span>
          </div>
        )}

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-80" />

        {/* Badges */}
        <div className="absolute left-4 top-4 flex max-w-[75%] flex-wrap gap-2">
          {product.isNewArrival && (
            <span className="rounded-full border border-[#d4af37]/30 bg-black/65 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e3c889] backdrop-blur-md">
              New Arrival
            </span>
          )}

          {product.isBestSeller && (
            <span className="rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              Bestseller
            </span>
          )}

          {hasDiscount && (
            <span className="rounded-full bg-[#d4af37] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* ================= WISHLIST ================= */}
        <div
          className="absolute right-4 top-4 z-10"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <WishlistButton
            productId={product._id}
            className="h-10 w-10 border-white/10 bg-black/60 px-0 py-0 text-white backdrop-blur-md hover:border-[#d4af37]/50 hover:bg-black/80"
          />
        </div>

        {/* Bottom image label */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <span className="rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-white/70 backdrop-blur-md">
            BHB Collection
          </span>

          {isOutOfStock && (
            <span className="rounded-full bg-red-500/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-1 flex-col p-5">

        {/* Category */}
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#c9a45c]">
          {product.category?.name || "BHB Collection"}
        </p>

        {/* Product name */}
        <button
          type="button"
          onClick={handleProductClick}
          className="mt-2 text-left"
        >
          <h3 className="line-clamp-2 min-h-[50px] text-[17px] font-semibold leading-6 text-white transition group-hover:text-[#e3c889]">
            {product.name}
          </h3>
        </button>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#e3c889]">
            ₹{Number(displayPrice).toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="text-sm text-zinc-600 line-through">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Specs */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">

          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">
              Material
            </p>

            <p className="mt-1 truncate text-xs text-zinc-300">
              {product.material || "Not specified"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-600">
              Color
            </p>

            <p className="mt-1 truncate text-xs text-zinc-300">
              {product.color || "Not specified"}
            </p>
          </div>
        </div>

        {/* Stock */}
        <div className="mt-4 flex items-center justify-between">
          <span
            className={`text-[11px] font-medium ${
              isOutOfStock
                ? "text-red-400"
                : product.stock <= 5
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {isOutOfStock
              ? "Currently unavailable"
              : product.stock <= 5
              ? `Only ${product.stock} left`
              : `${product.stock} in stock`}
          </span>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleProductClick}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#e3c889] transition-all duration-300 hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-black"
        >
          View Product
          <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </article>
  );
};

export default StoreProductCard;