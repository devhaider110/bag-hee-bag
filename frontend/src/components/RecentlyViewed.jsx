import { useEffect, useState } from "react";

import {
  getRecentlyViewed,
  clearRecentlyViewed,
} from "../services/recentlyViewedService";

import WishlistButton from "./WishlistButton";

function RecentlyViewed({ excludeProductId = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      if (!token) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await getRecentlyViewed(token);

        const recentlyViewed =
          response?.data || [];

        const filteredProducts =
          recentlyViewed.filter((item) => {
            const productId =
              item.product?._id || item._id;

            return productId !== excludeProductId;
          });

        setProducts(filteredProducts);
      } catch (error) {
        console.error(
          "Recently viewed loading error:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentlyViewed();
  }, [token, excludeProductId]);

  const handleClear = async () => {
    if (!token) return;

    try {
      await clearRecentlyViewed(token);

      setProducts([]);
    } catch (error) {
      console.error(
        "Clear recently viewed error:",
        error
      );
    }
  };

  // Don't show anything to guests
  if (!token) {
    return null;
  }

  // Loading
  if (loading) {
    return (
      <section className="mt-20">
        <div className="mb-7">
          <div className="h-7 w-56 animate-pulse rounded bg-white/10" />

          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="aspect-[4/3] animate-pulse bg-white/10" />

              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />

                <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // No recently viewed products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-white/10 pt-12">
      {/* =================================
          HEADER
      ================================= */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#c8a84e]">
            Your Activity
          </p>

          <h2 className="mt-2 font-serif text-2xl font-semibold text-white sm:text-3xl">
            Recently Viewed
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Continue exploring the bags you viewed recently.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300 sm:self-auto"
        >
          Clear History
        </button>
      </div>

      {/* =================================
          PRODUCTS
      ================================= */}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((item) => {
          const product = item.product || item;

          if (!product?._id) {
            return null;
          }

          const images =
            product.images?.length
              ? product.images
              : product.image
              ? [
                  {
                    url: product.image,
                  },
                ]
              : [];

          const primaryImage =
            images.find(
              (image) => image.isPrimary
            ) || images[0];

          const displayPrice =
            product.discountPrice ||
            product.price ||
            0;

          const originalPrice =
            product.discountPrice
              ? product.price
              : null;

          const productPath =
            `/product/${product._id}`;

          return (
            <article
              key={product._id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/30 hover:bg-white/[0.05]"
            >
              {/* =================================
                  IMAGE
              ================================= */}

              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                {primaryImage?.url ? (
                  <img
                    src={primaryImage.url}
                    alt={
                      primaryImage.alt ||
                      product.name ||
                      "BHB Product"
                    }
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-white/20">
                    No image
                  </div>
                )}

                {/* Wishlist */}

                <div
                  className="absolute right-3 top-3 z-20"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <WishlistButton
                    productId={product._id}
                  />
                </div>

                {/* Discount */}

                {product.discountPrice &&
                  product.price &&
                  Number(product.discountPrice) <
                    Number(product.price) && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-[#d4af37] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                      Sale
                    </span>
                  )}
              </div>

              {/* =================================
                  PRODUCT INFO
              ================================= */}

              <div className="p-4">
                {product.category?.name && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c8a84e]">
                    {product.category.name}
                  </p>
                )}

                <h3 className="mt-2 line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-white">
                  {product.name}
                </h3>

                {/* Price */}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#e4c76b]">
                    ₹
                    {Number(
                      displayPrice
                    ).toLocaleString("en-IN")}
                  </span>

                  {originalPrice && (
                    <span className="text-xs text-white/30 line-through">
                      ₹
                      {Number(
                        originalPrice
                      ).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* View Product */}

                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState(
                      {},
                      "",
                      productPath
                    );

                    window.dispatchEvent(
                      new PopStateEvent(
                        "popstate"
                      )
                    );
                  }}
                  className="mt-4 w-full rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-white/70 transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10 hover:text-[#e4c76b]"
                >
                  View Product
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RecentlyViewed;