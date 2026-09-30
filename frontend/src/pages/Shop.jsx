import { useEffect, useMemo, useState } from "react";
import ProductFilters from "../components/ProductFilters";
import StoreProductCard from "../components/StoreProductCard";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";

function Shop({ categorySlug = "" }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    color: "",
    material: "",
    waterResistance: "",
    inStock: "",
    featured: "",
    newArrival: "",
    bestSeller: "",
    sort: "newest",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        const categoryData =
          response?.data ||
          response?.categories ||
          [];

        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (err) {
        console.error("Category loading error:", err);
      }
    };

    loadCategories();
  }, []);

  // Apply category from URL
  useEffect(() => {
    if (!categories.length) return;

    if (categorySlug) {
      const matchedCategory = categories.find(
        (category) =>
          category.slug?.toLowerCase() === categorySlug.toLowerCase()
      );

      if (matchedCategory) {
        setFilters((prev) => ({
          ...prev,
          category: matchedCategory._id,
        }));
      }
    } else {
      setFilters((prev) => ({
        ...prev,
        category: "",
      }));
    }
  }, [categorySlug, categories]);

  // Load products whenever filters change
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts(filters);

        const productData =
          response?.data ||
          response?.products ||
          [];

        if (isMounted) {
          setProducts(Array.isArray(productData) ? productData : []);
        }
      } catch (err) {
        console.error("Product loading error:", err);

        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              "Unable to load products. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      color: "",
      material: "",
      waterResistance: "",
      inStock: "",
      featured: "",
      newArrival: "",
      bestSeller: "",
      sort: "newest",
    });

    window.history.pushState({}, "", "/shop");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // Active category
  const activeCategory = useMemo(() => {
    return categories.find(
      (category) => category._id === filters.category
    );
  }, [categories, filters.category]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Hero / Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#111] to-[#050505]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
              BAG HEE BAG
            </p>

            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {activeCategory?.name || "Shop Collection"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Discover elegant bags crafted for everyday style, travel,
              celebrations and every special occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Main Shop */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile Filter Button */}
        <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:border-[#d4af37]/50 hover:bg-white/10"
          >
            ☰ Filters
          </button>

          <span className="text-sm text-white/50">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[270px_1fr]">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilters
                filters={filters}
                categories={categories}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/50">
                  Showing
                </p>

                <p className="text-lg font-semibold">
                  {loading ? "Loading..." : products.length}{" "}
                  <span className="text-sm font-normal text-white/50">
                    product{products.length !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="sort"
                  className="text-sm text-white/50"
                >
                  Sort:
                </label>

                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) =>
                    handleFilterChange("sort", e.target.value)
                  }
                  className="rounded-xl border border-white/10 bg-[#111] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#d4af37]/60"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="nameAZ">Name: A to Z</option>
                  <option value="nameZA">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
                {error}

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="ml-3 underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="aspect-[4/5] animate-pulse bg-white/10" />

                    <div className="space-y-3 p-5">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                      <div className="h-5 w-1/3 animate-pulse rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && products.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-2xl">
                  👜
                </div>

                <h2 className="text-xl font-semibold">
                  No products found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
                  We couldn't find products matching your current
                  filters. Try changing or clearing some filters.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-6 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <StoreProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-l border-white/10 bg-[#0a0a0a] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                  Collection
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <ProductFilters
                filters={filters}
                categories={categories}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
              >
                Show {products.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Shop;