import { useEffect, useState } from "react";

import { getProductById } from "../services/productService";
import { addRecentlyViewed } from "../services/recentlyViewedService";

import { useAuth } from "../context/AuthContext";

import WishlistButton from "../components/WishlistButton";
import RecentlyViewed from "../components/RecentlyViewed";
import AddToCartButton from "../components/AddToCartButton";
import ProductReviews from "../components/ProductReviews";

function ProductDetails({ productId }) {
  const { token } = useAuth();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [fullscreen, setFullscreen] =
    useState(false);

  const [selectedVideo, setSelectedVideo] =
    useState(null);

  // =================================
  // LOAD PRODUCT
  // =================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getProductById(productId);

        const productData = response?.data;

        if (!productData) {
          throw new Error(
            "Product could not be found."
          );
        }

        setProduct(productData);

        // =================================
        // SAVE RECENTLY VIEWED
        // =================================

        if (
          token &&
          productData?._id
        ) {
          addRecentlyViewed(
            token,
            productData._id
          ).catch(
            (recentlyViewedError) => {
              console.error(
                "Recently viewed error:",
                recentlyViewedError
              );
            }
          );
        }

        // =================================
        // PRODUCT IMAGES
        // =================================

        const images =
          productData?.images || [];

        const primary =
          images.find(
            (image) => image.isPrimary
          ) || images[0];

        setSelectedImage(
          primary?.url ||
            productData?.image ||
            ""
        );

        // =================================
        // ACTIVE VARIANT
        // =================================

        const activeVariant =
          productData?.variants?.find(
            (variant) =>
              variant.isActive
          );

        setSelectedVariant(
          activeVariant || null
        );
      } catch (err) {
        console.error(
          "Product detail error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, token]);

  // =================================
  // LOADING
  // =================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-white/10" />

            <div className="space-y-5">
              <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />

              <div className="h-5 w-1/3 animate-pulse rounded bg-white/10" />

              <div className="h-24 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =================================
  // ERROR
  // =================================

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <h1 className="text-xl font-semibold">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm text-red-300/70">
            {error ||
              "This product could not be found."}
          </p>
        </div>
      </main>
    );
  }

  // =================================
  // PRODUCT IMAGES
  // =================================

  const images =
    product.images?.length
      ? product.images
      : product.image
      ? [
          {
            _id: "legacy-image",
            url: product.image,
            type: "front",
            isPrimary: true,
          },
        ]
      : [];

  // =================================
  // PRODUCT VIDEOS
  // =================================

  const videos = Array.isArray(product.videos)
    ? product.videos.filter(
        (video) => video?.url
      )
    : [];

  // =================================
  // ACTIVE VARIANTS
  // =================================

  const variants =
    product.variants?.filter(
      (variant) =>
        variant.isActive
    ) || [];

  // =================================
  // PRICE
  // =================================

  const displayPrice =
    selectedVariant?.discountPrice ||
    selectedVariant?.price ||
    product.discountPrice ||
    product.price;

  const originalPrice =
    selectedVariant?.discountPrice
      ? selectedVariant.price
      : product.discountPrice
      ? product.price
      : null;

  // =================================
  // STOCK
  // =================================

  const currentStock = Number(
    selectedVariant?.stock ??
      product.stock ??
      0
  );

  // =================================
  // RENDER
  // =================================

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* =================================
          PRODUCT DETAILS
      ================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* =================================
              IMAGE + VIDEO GALLERY
          ================================= */}

          <div>

            {/* =================================
                MAIN IMAGE
            ================================= */}

            <div
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
              onClick={() =>
                selectedImage &&
                setFullscreen(true)
              }
            >

              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/20">
                  No image
                </div>
              )}

              {/* ==========================
                  WISHLIST
              =========================== */}

              <div
                className="absolute right-4 top-4 z-20"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <WishlistButton
                  productId={
                    product._id
                  }
                />
              </div>

              {/* ==========================
                  ZOOM LABEL
              =========================== */}

              {selectedImage && (
                <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-xs text-white/70 backdrop-blur">
                  Click to zoom
                </div>
              )}

            </div>

            {/* =================================
                IMAGE THUMBNAILS
            ================================= */}

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">

                {images.map((image) => (
                  <button
                    key={image._id}
                    type="button"
                    onClick={() =>
                      setSelectedImage(
                        image.url
                      )
                    }
                    className={`group relative aspect-square overflow-hidden rounded-xl border transition ${
                      selectedImage ===
                      image.url
                        ? "border-[#d4af37]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >

                    <img
                      src={image.url}
                      alt={
                        image.alt ||
                        product.name
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                  </button>
                ))}

              </div>
            )}

            {/* =================================
                PRODUCT VIDEOS
            ================================= */}

            {videos.length > 0 && (
              <div className="mt-7">

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#c8a84e]">
                      Product Media
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      Product Videos
                    </h2>
                  </div>

                  <span className="text-xs text-white/35">
                    {videos.length}{" "}
                    {videos.length === 1
                      ? "video"
                      : "videos"}
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                  {videos.map(
                    (video, index) => (
                      <button
                        key={
                          video._id ||
                          video.publicId ||
                          index
                        }
                        type="button"
                        onClick={() =>
                          setSelectedVideo(
                            video
                          )
                        }
                        className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/60 hover:bg-white/[0.06]"
                      >

                        {/* ==========================
                            VIDEO THUMBNAIL
                        =========================== */}

                        {video.thumbnailUrl ? (
                          <img
                            src={
                              video.thumbnailUrl
                            }
                            alt={
                              video.title ||
                              `${product.name} video`
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <video
                            src={video.url}
                            muted
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        )}

                        {/* ==========================
                            DARK OVERLAY
                        =========================== */}

                        <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />

                        {/* ==========================
                            PLAY BUTTON
                        =========================== */}

                        <div className="absolute inset-0 flex items-center justify-center">

                          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/65 text-white shadow-xl backdrop-blur transition duration-300 group-hover:scale-110 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/20">

                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="ml-1 h-5 w-5"
                              aria-hidden="true"
                            >
                              <path d="M8 5.14v13.72a1 1 0 0 0 1.52.86l10.28-6.86a1 1 0 0 0 0-1.72L9.52 4.28A1 1 0 0 0 8 5.14Z" />
                            </svg>

                          </span>

                        </div>

                        {/* ==========================
                            VIDEO TITLE
                        =========================== */}

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3">

                          <p className="truncate text-xs font-medium text-white">
                            {video.title ||
                              `Product Video ${
                                index + 1
                              }`}
                          </p>

                          {video.duration && (
                            <p className="mt-1 text-[10px] text-white/50">
                              {formatDuration(
                                video.duration
                              )}
                            </p>
                          )}

                        </div>

                      </button>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* =================================
              PRODUCT INFO
          ================================= */}

          <div className="flex flex-col justify-center">

            {/* Category */}

            <p className="text-xs uppercase tracking-[0.3em] text-[#c8a84e]">
              {product.category?.name ||
                "BHB Collection"}
            </p>

            {/* Product Name */}

            <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            {/* Brand */}

            {product.brand && (
              <p className="mt-3 text-sm text-white/40">
                {product.brand}
              </p>
            )}

            {/* Wishlist */}

            <div className="mt-5">
              <WishlistButton
                productId={
                  product._id
                }
                showLabel
              />
            </div>

            {/* =================================
                PRICE
            ================================= */}

            <div className="mt-7 flex flex-wrap items-center gap-3">

              <span className="text-3xl font-semibold text-[#e4c76b]">
                ₹
                {Number(
                  displayPrice || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

              {originalPrice && (
                <span className="text-base text-white/30 line-through">
                  ₹
                  {Number(
                    originalPrice
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}

              {originalPrice &&
                Number(
                  originalPrice
                ) >
                  Number(
                    displayPrice
                  ) && (
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                    Sale
                  </span>
                )}

            </div>

            {/* =================================
                DESCRIPTION
            ================================= */}

            {product.description && (
              <p className="mt-6 text-sm leading-7 text-white/55">
                {product.description}
              </p>
            )}

            {/* =================================
                VARIANTS
            ================================= */}

            {variants.length > 0 && (
              <div className="mt-8">

                <div className="mb-3 flex items-center justify-between">

                  <h2 className="text-sm font-semibold">
                    Select Variant
                  </h2>

                  {selectedVariant && (
                    <span className="text-xs text-[#d4af37]">
                      {selectedVariant.name}
                    </span>
                  )}

                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                  {variants.map(
                    (variant) => {
                      const active =
                        selectedVariant?._id ===
                        variant._id;

                      const outOfStock =
                        Number(
                          variant.stock ||
                            0
                        ) <= 0;

                      return (
                        <button
                          key={
                            variant._id
                          }
                          type="button"
                          disabled={
                            outOfStock
                          }
                          onClick={() => {
                            setSelectedVariant(
                              variant
                            );

                            if (
                              variant
                                .images
                                ?.length
                            ) {
                              setSelectedImage(
                                variant
                                  .images[0]
                                  .url
                              );
                            }
                          }}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-[#d4af37] bg-[#d4af37]/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/30"
                          } ${
                            outOfStock
                              ? "cursor-not-allowed opacity-40"
                              : ""
                          }`}
                        >

                          <p className="text-sm font-medium">
                            {variant.name}
                          </p>

                          {variant.color && (
                            <p className="mt-1 text-xs text-white/40">
                              {variant.color}
                            </p>
                          )}

                          {variant.size && (
                            <p className="mt-1 text-xs text-white/40">
                              Size:{" "}
                              {
                                variant.size
                              }
                            </p>
                          )}

                          <p
                            className={`mt-2 text-[10px] ${
                              outOfStock
                                ? "text-red-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {outOfStock
                              ? "Out of stock"
                              : `${variant.stock} available`}
                          </p>

                        </button>
                      );
                    }
                  )}

                </div>
              </div>
            )}

            {/* =================================
                STOCK
            ================================= */}

            <div className="mt-7">

              <span
                className={`text-sm ${
                  currentStock > 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {currentStock > 0
                  ? `✓ In Stock${
                      currentStock <=
                      5
                        ? ` • Only ${currentStock} left`
                        : ""
                    }`
                  : "Out of Stock"}
              </span>

            </div>

            {/* =================================
                MODULE 8 - ADD TO CART
            ================================= */}

            <div className="mt-8">

              <AddToCartButton
                productId={
                  product._id
                }
                variantId={
                  selectedVariant?._id ||
                  null
                }
                disabled={
                  currentStock <= 0
                }
              />

            </div>

            {/* =================================
                CART NOTE
            ================================= */}

            <p className="mt-4 text-center text-xs text-white/30">
              {currentStock > 0
                ? "Your selected item will be added to your BHB cart."
                : "This item is currently unavailable."}
            </p>

            {/* =================================
                PRODUCT TRUST INFO
            ================================= */}

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold">
                  Authentic
                </p>

                <p className="mt-1 text-[10px] leading-5 text-white/40">
                  Genuine BHB collection
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold">
                  Quality
                </p>

                <p className="mt-1 text-[10px] leading-5 text-white/40">
                  Carefully selected products
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold">
                  BHB Style
                </p>

                <p className="mt-1 text-[10px] leading-5 text-white/40">
                  Classic • Elegant • Everyday
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* =================================
            RECENTLY VIEWED
        ================================= */}

        <RecentlyViewed
          excludeProductId={
            product._id
          }
        />

        {/* =================================
            MODULE 15 - REVIEWS & RATINGS
        ================================= */}

        <ProductReviews productId={productId} />

      </section>

      {/* =================================
          FULLSCREEN IMAGE
      ================================= */}

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-5"
          onClick={() =>
            setFullscreen(false)
          }
        >

          <button
            type="button"
            onClick={() =>
              setFullscreen(false)
            }
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white transition hover:bg-white/20"
            aria-label="Close image"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt={product.name}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(event) =>
              event.stopPropagation()
            }
          />

        </div>
      )}

      {/* =================================
          FULLSCREEN VIDEO
      ================================= */}

      {selectedVideo && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 sm:p-6"
          onClick={() =>
            setSelectedVideo(null)
          }
        >

          {/* ==========================
              CLOSE BUTTON
          =========================== */}

          <button
            type="button"
            onClick={() =>
              setSelectedVideo(null)
            }
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="Close video"
          >
            ×
          </button>

          {/* ==========================
              VIDEO CONTAINER
          =========================== */}

          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <video
              src={selectedVideo.url}
              poster={
                selectedVideo.thumbnailUrl ||
                undefined
              }
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] w-full object-contain"
            />

            {/* ==========================
                VIDEO INFO
            =========================== */}

            <div className="border-t border-white/10 bg-[#0b0b0b] px-4 py-4 sm:px-6">

              <p className="text-sm font-medium text-white">
                {selectedVideo.title ||
                  "Product Video"}
              </p>

              {selectedVideo.format && (
                <p className="mt-1 text-xs uppercase tracking-wider text-white/35">
                  {selectedVideo.format}
                </p>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// =================================
// VIDEO DURATION FORMATTER
// =================================

function formatDuration(duration) {
  const totalSeconds = Number(duration);

  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds <= 0
  ) {
    return "";
  }

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = Math.floor(
    totalSeconds % 60
  );

  if (hours > 0) {
    return `${hours}:${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(
    seconds
  ).padStart(2, "0")}`;
}

export default ProductDetails;