import React from "react";

const ProductFilters = ({
  filters,
  categories,
  onChange,
  onClear,
}) => {
  // Category URL
  const getCategoryUrl = (category) => {
    const slug = category.slug;

    if (!slug) {
      return `/bags/${category.name
        .toLowerCase()
        .replace(/&/g, "")
        .replace(/\s+/g, "-")}`;
    }

    return `/bags/${slug}`;
  };

  // Category click
  const handleCategoryClick = (category) => {
    onChange("category", category._id);

    // URL update without full page reload
    window.history.pushState(
      {},
      "",
      getCategoryUrl(category)
    );
  };

  // All categories
  const handleAllCategories = () => {
    onChange("category", "");

    window.history.pushState(
      {},
      "",
      "/shop"
    );
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl lg:p-6">

      {/* =========================
          FILTER HEADER
      ========================= */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a45c]">
            Refine
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Filters
          </h2>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-zinc-500 transition hover:text-[#d9bd82]"
        >
          Clear All
        </button>
      </div>


      {/* =========================
          CATEGORY
      ========================= */}
      <div className="mb-7">
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Category
          </p>
        </div>

        <div className="space-y-1">

          {/* All Categories */}
          <button
            type="button"
            onClick={handleAllCategories}
            className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
              filters.category === ""
                ? "bg-[#c9a45c]/10 text-[#d9bd82]"
                : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
            }`}
          >
            <span className="text-sm">
              All Categories
            </span>

            {filters.category === "" && (
              <span className="text-sm text-[#c9a45c]">
                ✓
              </span>
            )}
          </button>


          {/* Dynamic Categories */}
          {categories
            .filter((category) => category.isActive !== false)
            .map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() =>
                  handleCategoryClick(category)
                }
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  filters.category === category._id
                    ? "bg-[#c9a45c]/10 text-[#d9bd82]"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <span className="text-sm">
                  {category.name}
                </span>

                {filters.category === category._id && (
                  <span className="text-sm text-[#c9a45c]">
                    ✓
                  </span>
                )}
              </button>
            ))}
        </div>
      </div>


      {/* =========================
          PRICE RANGE
      ========================= */}
      <div className="mb-7">
        <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Price Range
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) =>
              onChange(
                "minPrice",
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#c9a45c]/50"
          />

          <input
            type="number"
            min="0"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) =>
              onChange(
                "maxPrice",
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#c9a45c]/50"
          />
        </div>
      </div>


      {/* =========================
          COLOR
      ========================= */}
      <div className="mb-7">
        <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Color
        </label>

        <input
          type="text"
          placeholder="e.g. Black"
          value={filters.color}
          onChange={(e) =>
            onChange(
              "color",
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#c9a45c]/50"
        />
      </div>


      {/* =========================
          MATERIAL
      ========================= */}
      <div className="mb-7">
        <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Material
        </label>

        <input
          type="text"
          placeholder="e.g. PU Leather"
          value={filters.material}
          onChange={(e) =>
            onChange(
              "material",
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#c9a45c]/50"
        />
      </div>


      {/* =========================
          WATER RESISTANCE
      ========================= */}
      <div className="mb-7">
        <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Water Resistance
        </label>

        <select
          value={filters.waterResistance}
          onChange={(e) =>
            onChange(
              "waterResistance",
              e.target.value
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-[#c9a45c]/50"
        >
          <option value="">
            Any
          </option>

          <option value="Not Water Resistant">
            Not Water Resistant
          </option>

          <option value="Water Resistant">
            Water Resistant
          </option>

          <option value="Water Repellent">
            Water Repellent
          </option>

          <option value="Waterproof">
            Waterproof
          </option>
        </select>
      </div>


      {/* =========================
          AVAILABILITY & TAGS
      ========================= */}
      <div className="space-y-3 border-t border-white/5 pt-5">

        {/* In Stock */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 transition hover:bg-white/[0.02]">
          <span className="text-sm text-zinc-300">
            In Stock Only
          </span>

          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) =>
              onChange(
                "inStock",
                e.target.checked
              )
            }
            className="h-4 w-4 cursor-pointer accent-[#c9a45c]"
          />
        </label>


        {/* Featured */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 transition hover:bg-white/[0.02]">
          <span className="text-sm text-zinc-300">
            Featured
          </span>

          <input
            type="checkbox"
            checked={filters.featured}
            onChange={(e) =>
              onChange(
                "featured",
                e.target.checked
              )
            }
            className="h-4 w-4 cursor-pointer accent-[#c9a45c]"
          />
        </label>


        {/* New Arrivals */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 transition hover:bg-white/[0.02]">
          <span className="text-sm text-zinc-300">
            New Arrivals
          </span>

          <input
            type="checkbox"
            checked={filters.newArrival}
            onChange={(e) =>
              onChange(
                "newArrival",
                e.target.checked
              )
            }
            className="h-4 w-4 cursor-pointer accent-[#c9a45c]"
          />
        </label>


        {/* Best Sellers */}
        <label className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 transition hover:bg-white/[0.02]">
          <span className="text-sm text-zinc-300">
            Best Sellers
          </span>

          <input
            type="checkbox"
            checked={filters.bestSeller}
            onChange={(e) =>
              onChange(
                "bestSeller",
                e.target.checked
              )
            }
            className="h-4 w-4 cursor-pointer accent-[#c9a45c]"
          />
        </label>
      </div>

    </div>
  );
};

export default ProductFilters;