import React from "react";

function ProductList({
  products = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const formatPrice = (value) => {
    const price = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock) => {
    const quantity = Number(stock || 0);

    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className:
          "border-red-500/20 bg-red-500/5 text-red-400",
        dotClass: "bg-red-500",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className:
          "border-amber-500/20 bg-amber-500/5 text-amber-400",
        dotClass: "bg-amber-400",
      };
    }

    return {
      label: "In Stock",
      className:
        "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
      dotClass: "bg-emerald-400",
    };
  };

  const getDiscountPercentage = (
    price,
    discountPrice
  ) => {
    const original = Number(price || 0);
    const discounted = Number(
      discountPrice || 0
    );

    if (
      !original ||
      !discounted ||
      discounted >= original
    ) {
      return 0;
    }

    return Math.round(
      ((original - discounted) /
        original) *
        100
    );
  };

  const getCategoryName = (product) => {
    if (!product?.category) {
      return "Uncategorized";
    }

    if (
      typeof product.category === "object"
    ) {
      return (
        product.category.name ||
        "Uncategorized"
      );
    }

    return "Category";
  };

  const getProductImage = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      const primaryImage =
        product.images.find(
          (image) =>
            image?.isPrimary === true
        );

      if (primaryImage?.url) {
        return primaryImage.url;
      }

      const firstImage =
        product.images.find(
          (image) => image?.url
        );

      if (firstImage?.url) {
        return firstImage.url;
      }
    }

    if (product?.image) {
      return product.image;
    }

    return "";
  };

  const getSpecs = (product) => {
    const specs = [];

    if (product?.material) {
      specs.push({
        label: "Material",
        value: product.material,
      });
    }

    if (product?.color) {
      specs.push({
        label: "Color",
        value: product.color,
      });
    }

    if (product?.size) {
      specs.push({
        label: "Size",
        value: product.size,
      });
    }

    if (product?.closureType) {
      specs.push({
        label: "Closure",
        value: product.closureType,
      });
    }

    if (product?.strapType) {
      specs.push({
        label: "Strap",
        value: product.strapType,
      });
    }

    return specs.slice(0, 4);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <LoadingCard
              key={index}
            />
          )
        )}
      </div>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (!products.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-zinc-950/60 px-6 py-16 text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#d4af37]/15 bg-[#d4af37]/5 text-4xl">
          👜
        </div>

        <h3 className="mt-6 text-lg font-bold text-white">
          No Products Yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-zinc-600">
          Your BHB product catalogue is
          currently empty. Use the Add Product
          form to create your first product.
        </p>

      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">

      {products.map((product) => {
        const stockStatus =
          getStockStatus(
            product.stock
          );

        const discount =
          getDiscountPercentage(
            product.price,
            product.discountPrice
          );

        const image =
          getProductImage(product);

        const specs =
          getSpecs(product);

        const hasDiscount =
          Number(
            product.discountPrice || 0
          ) > 0 &&
          Number(
            product.discountPrice
          ) <
            Number(
              product.price || 0
            );

        return (
          <article
            key={product._id}
            className="group flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-zinc-950 to-black shadow-xl transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/20 hover:shadow-2xl"
          >

            {/* ==================================
                IMAGE
            ================================== */}

            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">

              {image ? (
                <img
                  src={image}
                  alt={
                    product.name ||
                    "Product"
                  }
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget
                        .nextElementSibling;

                    if (fallback) {
                      fallback.classList.remove(
                        "hidden"
                      );
                    }
                  }}
                />
              ) : null}

              <div
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black ${
                  image
                    ? "hidden"
                    : ""
                }`}
              >
                <div className="text-center">

                  <div className="text-5xl opacity-30">
                    👜
                  </div>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-zinc-700">
                    No Image
                  </p>

                </div>
              </div>

              {/* IMAGE OVERLAY */}

              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">

                <div className="flex flex-wrap gap-2">

                  {product.isFeatured && (
                    <Badge>
                      Featured
                    </Badge>
                  )}

                  {product.isNewArrival && (
                    <Badge>
                      New
                    </Badge>
                  )}

                  {product.isBestSeller && (
                    <Badge>
                      Best Seller
                    </Badge>
                  )}

                </div>

                {discount > 0 && (
                  <span className="rounded-full bg-[#d4af37] px-2.5 py-1 text-[9px] font-bold text-black shadow-lg">
                    -{discount}%
                  </span>
                )}

              </div>

              {/* ACTIVE STATUS */}

              <div className="absolute bottom-3 left-3">

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium backdrop-blur-md ${
                    product.isActive
                      ? "border-emerald-500/20 bg-black/70 text-emerald-400"
                      : "border-red-500/20 bg-black/70 text-red-400"
                  }`}
                >

                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      product.isActive
                        ? "bg-emerald-400"
                        : "bg-red-500"
                    }`}
                  />

                  {product.isActive
                    ? "Active"
                    : "Inactive"}

                </span>

              </div>

            </div>

            {/* ==================================
                CONTENT
            ================================== */}

            <div className="flex flex-1 flex-col p-5">

              {/* CATEGORY */}

              <div className="flex items-center justify-between gap-3">

                <span className="truncate text-[9px] font-semibold uppercase tracking-[0.25em] text-[#d4af37]/70">
                  {getCategoryName(
                    product
                  )}
                </span>

                {product.sku && (
                  <span className="shrink-0 text-[9px] text-zinc-700">
                    SKU: {product.sku}
                  </span>
                )}

              </div>

              {/* NAME */}

              <h3 className="mt-2 line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-white transition group-hover:text-[#d4af37]">
                {product.name}
              </h3>

              {/* DESCRIPTION */}

              {product.description && (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                  {product.description}
                </p>
              )}

              {/* PRICE */}

              <div className="mt-4 flex items-end gap-2">

                <span className="text-xl font-bold text-[#d4af37]">
                  {formatPrice(
                    hasDiscount
                      ? product.discountPrice
                      : product.price
                  )}
                </span>

                {hasDiscount && (
                  <span className="mb-0.5 text-xs text-zinc-600 line-through">
                    {formatPrice(
                      product.price
                    )}
                  </span>
                )}

              </div>

              {/* SPECS */}

              {specs.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-2">

                  {specs.map(
                    (spec) => (
                      <div
                        key={`${spec.label}-${spec.value}`}
                        className="min-w-0 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                      >

                        <p className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
                          {spec.label}
                        </p>

                        <p className="mt-1 truncate text-[10px] font-medium text-zinc-400">
                          {spec.value}
                        </p>

                      </div>
                    )
                  )}

                </div>
              )}

              {/* STOCK */}

              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">

                <div>

                  <p className="text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                    Inventory
                  </p>

                  <p className="mt-1 text-sm font-semibold text-zinc-300">
                    {Number(
                      product.stock || 0
                    )}{" "}
                    units
                  </p>

                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-medium ${stockStatus.className}`}
                >

                  <span
                    className={`h-1.5 w-1.5 rounded-full ${stockStatus.dotClass}`}
                  />

                  {stockStatus.label}

                </span>

              </div>

              {/* MEDIA / VARIANT COUNTS */}

              <div className="mt-3 flex gap-2">

                <InfoPill
                  icon="▧"
                  label={
                    Array.isArray(
                      product.images
                    )
                      ? product.images
                          .length
                      : 0
                  }
                  text="Images"
                />

                <InfoPill
                  icon="◇"
                  label={
                    Array.isArray(
                      product.variants
                    )
                      ? product.variants
                          .length
                      : 0
                  }
                  text="Variants"
                />

              </div>

              {/* ==================================
                  ACTIONS
              ================================== */}

              <div className="mt-5 grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() =>
                    onEdit?.(product)
                  }
                  className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2.5 text-xs font-semibold text-[#d4af37] transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10"
                >
                  Edit Product
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete?.(product)
                  }
                  className="rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10"
                >
                  Delete
                </button>

              </div>

            </div>

          </article>
        );
      })}

    </div>
  );
}

// ============================================
// BADGE
// ============================================

function Badge({ children }) {
  return (
    <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-300 backdrop-blur-md">
      {children}
    </span>
  );
}

// ============================================
// INFO PILL
// ============================================

function InfoPill({
  icon,
  label,
  text,
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">

      <span className="text-xs text-[#d4af37]/60">
        {icon}
      </span>

      <span className="text-[9px] text-zinc-600">
        <strong className="text-zinc-400">
          {label}
        </strong>{" "}
        {text}
      </span>

    </div>
  );
}

// ============================================
// LOADING CARD
// ============================================

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-zinc-950">

      <div className="aspect-[4/3] animate-pulse bg-zinc-900" />

      <div className="space-y-4 p-5">

        <div className="h-2 w-24 animate-pulse rounded bg-zinc-900" />

        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-900" />

        <div className="h-3 w-full animate-pulse rounded bg-zinc-900" />

        <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-900" />

        <div className="h-8 w-1/2 animate-pulse rounded bg-zinc-900" />

        <div className="grid grid-cols-2 gap-2">

          <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />

          <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />

        </div>

      </div>
    </div>
  );
}

export default ProductList;