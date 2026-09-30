import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  getWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

const Wishlist = () => {
  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD WISHLIST
  // ==========================================
  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !token) {
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getWishlist(token);

        console.log(
          "Wishlist page response:",
          response
        );

        const wishlistProducts =
          response?.wishlist?.products || [];

        if (isMounted) {
          setProducts(wishlistProducts);
        }
      } catch (err) {
        console.error(
          "Wishlist loading error:",
          err.response?.data || err.message
        );

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load your wishlist."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, [user, token, authLoading]);

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================
  const handleRemove = async (productId) => {
    if (!token || !productId) {
      return;
    }

    try {
      await removeFromWishlist(
        token,
        productId
      );

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product._id !== productId
        )
      );
    } catch (err) {
      console.error(
        "Remove wishlist error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to remove product."
      );
    }
  };

  // ==========================================
  // PRODUCT IMAGE
  // ==========================================
  const getProductImage = (product) => {
    if (
      product.images &&
      product.images.length > 0
    ) {
      const primaryImage =
        product.images.find(
          (image) => image.isPrimary
        );

      return (
        primaryImage?.url ||
        product.images[0]?.url ||
        product.image ||
        ""
      );
    }

    return product.image || "";
  };

  // ==========================================
  // PRODUCT PRICE
  // ==========================================
  const getProductPrice = (product) => {
    if (
      product.discountPrice &&
      Number(product.discountPrice) <
        Number(product.price)
    ) {
      return product.discountPrice;
    }

    return product.price || 0;
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] px-5 py-20 dark:bg-[#0b0b0b]">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mx-auto h-10 w-64 rounded bg-black/10 dark:bg-white/10" />

            <div className="mx-auto mt-4 h-4 w-40 rounded bg-black/10 dark:bg-white/10" />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-96 rounded-3xl bg-black/10 dark:bg-white/10"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#171717] dark:bg-[#0b0b0b] dark:text-white">

      {/* ======================================
          HEADER
      ======================================= */}
      <section className="border-b border-black/10 bg-gradient-to-b from-[#f4efe5] to-[#faf9f6] px-5 py-16 dark:border-white/10 dark:from-[#11110f] dark:to-[#0b0b0b] sm:py-20">
        <div className="mx-auto max-w-7xl text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9b7b1f]">
            BHB COLLECTION
          </p>

          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            My Wishlist
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/60 dark:text-white/60 sm:text-base">
            Keep the pieces you love close.
            Your favourite bags are saved here
            for whenever you're ready.
          </p>

          <div className="mx-auto mt-6 h-px w-20 bg-[#c9a227]" />
        </div>
      </section>

      {/* ======================================
          CONTENT
      ======================================= */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14">

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* ====================================
            EMPTY WISHLIST
        ===================================== */}
        {products.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-black/10 bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10">
              <span className="text-4xl text-[#c9a227]">
                ♡
              </span>
            </div>

            <h2 className="mt-7 font-serif text-2xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
              Discover something beautiful
              and save it here for later.
            </p>

            <button
              type="button"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/shop"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
              className="mt-7 rounded-full bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c9a227] hover:text-black"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <>
            {/* =================================
                COUNT
            ================================== */}
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-black/50 dark:text-white/50">
                  {products.length}{" "}
                  {products.length === 1
                    ? "item"
                    : "items"}{" "}
                  saved
                </p>
              </div>
            </div>

            {/* =================================
                PRODUCT GRID
            ================================== */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {products.map((product) => {
                const image =
                  getProductImage(product);

                const finalPrice =
                  getProductPrice(product);

                const hasDiscount =
                  product.discountPrice &&
                  Number(
                    product.discountPrice
                  ) <
                    Number(product.price);

                return (
                  <article
                    key={product._id}
                    className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#121212]"
                  >

                    {/* =========================
                        IMAGE
                    ========================== */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f0e9] dark:bg-[#1b1b1b]">

                      {image ? (
                        <img
                          src={image}
                          alt={
                            product.name ||
                            "BAG HEE BAG product"
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-black/40 dark:text-white/40">
                          No image
                        </div>
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(
                            product._id
                          )
                        }
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg shadow-md backdrop-blur transition hover:scale-105 hover:bg-black hover:text-white dark:bg-black/80"
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        ×
                      </button>

                      {/* Wishlist Heart */}
                      <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-red-500 backdrop-blur-md">
                        <span className="text-xl">
                          ♥
                        </span>
                      </div>
                    </div>

                    {/* =========================
                        DETAILS
                    ========================== */}
                    <div className="p-5">

                      {/* Category */}
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a08020]">
                        {product.category?.name ||
                          "BHB Collection"}
                      </p>

                      {/* Name */}
                      <h2 className="mt-2 line-clamp-2 min-h-[3.5rem] font-serif text-lg font-semibold">
                        {product.name}
                      </h2>

                      {/* Price */}
                      <div className="mt-4 flex items-center gap-2">

                        <span className="text-lg font-semibold">
                          ₹
                          {Number(
                            finalPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        {hasDiscount && (
                          <span className="text-sm text-black/40 line-through dark:text-white/40">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              "en-IN"
                            )}
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
                            `/product/${product._id}`
                          );

                          window.dispatchEvent(
                            new PopStateEvent(
                              "popstate"
                            )
                          );
                        }}
                        className="mt-5 w-full rounded-full border border-black/15 px-5 py-3 text-sm font-semibold transition hover:border-[#c9a227] hover:bg-[#c9a227] hover:text-black dark:border-white/15"
                      >
                        View Product
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Wishlist;