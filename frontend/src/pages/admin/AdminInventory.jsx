import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("stock-low");

  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const [operation, setOperation] = useState("restock");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  /* =====================================================
     AUTH TOKEN
  ===================================================== */

  const getToken = () => {
    return (
      localStorage.getItem("bhb_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("bhb_token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /* =====================================================
     NORMALIZE INVENTORY
  ===================================================== */

  const normalizeInventory = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => {
      const product = item.product || item;

      const category =
        typeof item.category === "object"
          ? item.category?.name || "Uncategorized"
          : item.category || "Uncategorized";

      return {
        ...item,

        _id: item._id || product?._id,

        productId: product?._id || item.productId,

        name:
          item.name ||
          product?.name ||
          "Unnamed Product",

        sku:
          item.sku ||
          product?.sku ||
          "N/A",

        image:
          item.image ||
          product?.image ||
          "",

        category,

        price: Number(
          item.discountPrice ||
            product?.discountPrice ||
            item.price ||
            product?.price ||
            0
        ),

        stock: Number(
          item.totalStock ??
            item.stock ??
            product?.stock ??
            0
        ),

        minimumStock: Number(
          item.lowStockThreshold ?? 5
        ),

        stockStatus:
          item.stockStatus || "IN_STOCK",

        isActive:
          item.isActive !== undefined
            ? item.isActive
            : product?.isActive !== false,

        variants: product?.variants || [],
      };
    });
  };

  /* =====================================================
     FETCH INVENTORY
  ===================================================== */

  const fetchInventory = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/inventory/admin`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to load inventory. Server returned ${response.status}.`
        );
      }

      setInventory(
        normalizeInventory(
          data?.inventory || []
        )
      );
    } catch (err) {
      console.error(
        "Inventory fetch error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     FETCH SUMMARY
  ===================================================== */

  const fetchSummary = async () => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/inventory/admin/summary`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load inventory summary."
        );
      }

      setSummary(
        data?.summary || null
      );
    } catch (err) {
      console.error(
        "Inventory summary error:",
        err
      );

      /*
        Summary failure should not stop
        the inventory table from loading.
      */
    }
  };

  /* =====================================================
     REFRESH ALL
  ===================================================== */

  const refreshAll = async (
    showRefreshLoader = false
  ) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    }

    await Promise.all([
      fetchInventory(false),
      fetchSummary(),
    ]);

    if (showRefreshLoader) {
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    refreshAll();
  }, []);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const fallbackTotalProducts =
      inventory.length;

    const fallbackTotalUnits =
      inventory.reduce(
        (sum, item) =>
          sum + Number(item.stock || 0),
        0
      );

    const fallbackLowStock =
      inventory.filter(
        (item) =>
          Number(item.stock || 0) > 0 &&
          Number(item.stock || 0) <=
            Number(
              item.minimumStock || 5
            )
      ).length;

    const fallbackOutOfStock =
      inventory.filter(
        (item) =>
          Number(item.stock || 0) <= 0
      ).length;

    return {
      totalProducts:
        summary?.totalProducts ??
        fallbackTotalProducts,

      activeProducts:
        summary?.activeProducts ?? 0,

      inactiveProducts:
        summary?.inactiveProducts ?? 0,

      totalUnits:
        summary?.totalUnits ??
        fallbackTotalUnits,

      lowStock:
        summary?.lowStockProducts ??
        fallbackLowStock,

      outOfStock:
        summary?.outOfStockProducts ??
        fallbackOutOfStock,

      inStock:
        summary?.inStockProducts ??
        0,
    };
  }, [summary, inventory]);

  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredInventory = useMemo(() => {
    let result = [...inventory];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((item) => {
        const name = String(
          item.name || ""
        ).toLowerCase();

        const sku = String(
          item.sku || ""
        ).toLowerCase();

        const category = String(
          item.category || ""
        ).toLowerCase();

        const variantMatch =
          (item.variants || []).some(
            (variant) => {
              const variantName =
                String(
                  variant.name || ""
                ).toLowerCase();

              const variantSku =
                String(
                  variant.sku || ""
                ).toLowerCase();

              return (
                variantName.includes(
                  searchValue
                ) ||
                variantSku.includes(
                  searchValue
                )
              );
            }
          );

        return (
          name.includes(searchValue) ||
          sku.includes(searchValue) ||
          category.includes(searchValue) ||
          variantMatch
        );
      });
    }

    if (stockFilter === "out") {
      result = result.filter(
        (item) =>
          Number(item.stock || 0) <= 0
      );
    }

    if (stockFilter === "low") {
      result = result.filter(
        (item) =>
          Number(item.stock || 0) > 0 &&
          Number(item.stock || 0) <=
            Number(
              item.minimumStock || 5
            )
      );
    }

    if (stockFilter === "healthy") {
      result = result.filter(
        (item) =>
          Number(item.stock || 0) >
          Number(
            item.minimumStock || 5
          )
      );
    }

    if (stockFilter === "inactive") {
      result = result.filter(
        (item) =>
          item.isActive === false
      );
    }

    if (stockFilter === "active") {
      result = result.filter(
        (item) =>
          item.isActive !== false
      );
    }

    if (sortBy === "stock-high") {
      result.sort(
        (a, b) =>
          Number(b.stock || 0) -
          Number(a.stock || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(a.name).localeCompare(
          String(b.name)
        )
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "stock-low") {
      result.sort(
        (a, b) =>
          Number(a.stock || 0) -
          Number(b.stock || 0)
      );
    }

    return result;
  }, [
    inventory,
    search,
    stockFilter,
    sortBy,
  ]);

  /* =====================================================
     STOCK STATUS
  ===================================================== */

  const getStockStatus = (item) => {
    const stock =
      Number(item.stock || 0);

    const threshold =
      Number(
        item.minimumStock || 5
      );

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className:
          "border-red-500/20 bg-red-500/10 text-red-300",
      };
    }

    if (stock <= threshold) {
      return {
        label: "Low Stock",
        className:
          "border-amber-500/20 bg-amber-500/10 text-amber-300",
      };
    }

    return {
      label: "In Stock",
      className:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    };
  };

  /* =====================================================
     OPEN ADJUSTMENT MODAL
  ===================================================== */

  const openAdjustment = (item) => {
    setSelectedItem(item);
    setOperation("restock");
    setQuantity("");
    setReason("");
    setError("");
    setShowAdjustModal(true);
  };

  const closeAdjustment = () => {
    if (updating) {
      return;
    }

    setSelectedItem(null);
    setShowAdjustModal(false);
    setOperation("restock");
    setQuantity("");
    setReason("");
  };

  /* =====================================================
     UPDATE STOCK
  ===================================================== */

  const handleStockUpdate = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedItem) {
      return;
    }

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        parsedQuantity
      ) ||
      parsedQuantity < 0
    ) {
      setError(
        "Quantity must be a valid number."
      );
      return;
    }

    if (
      operation !== "adjust" &&
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (
      operation === "remove" &&
      parsedQuantity >
        Number(
          selectedItem.stock || 0
        )
    ) {
      setError(
        "Cannot remove more stock than currently available."
      );
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const productId =
        selectedItem.productId ||
        selectedItem._id;

      if (!productId) {
        throw new Error(
          "Product ID is missing."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/inventory/admin/${productId}/stock`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            quantity:
              parsedQuantity,

            operation,

            reason:
              reason.trim() ||
              "Manual inventory adjustment",
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to update stock. Server returned ${response.status}.`
        );
      }

      closeAdjustment();

      await refreshAll();
    } catch (err) {
      console.error(
        "Stock update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update stock."
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navigate = (path) => {
    window.history.pushState(
      {},
      "",
      path
    );

    window.dispatchEvent(
      new PopStateEvent(
        "popstate"
      )
    );
  };

  /* =====================================================
     CURRENCY
  ===================================================== */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value || 0)
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="mb-4 inline-flex items-center gap-2 text-xs text-neutral-500 transition hover:text-[#e4c76b]"
            >
              <span>←</span>
              Back to Admin Dashboard
            </button>

          

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Inventory & Stock
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Monitor product stock,
              identify low-stock
              items and manage
              inventory movements.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              refreshAll(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 px-5 py-3 text-sm font-medium text-[#e4c76b] transition hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-red-300">
                Inventory Error
              </p>

              <p className="mt-1 text-xs text-red-300/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                refreshAll(true)
              }
              className="rounded-lg border border-red-500/20 px-4 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Products"
            value={stats.totalProducts}
            icon="▦"
          />

          <StatCard
            label="Total Units"
            value={stats.totalUnits}
            icon="◫"
          />

          <StatCard
            label="In Stock"
            value={stats.inStock}
            icon="✓"
          />

          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            icon="!"
            danger={
              stats.lowStock > 0
            }
          />

          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            icon="×"
            danger={
              stats.outOfStock > 0
            }
          />
        </div>

        {/* CONTROLS */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search product, SKU or category..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-neutral-600 transition focus:border-[#d4af37]/40"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex">
              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(
                    event.target.value
                  )
                }
                className="h-11 min-w-[180px] rounded-xl border border-white/10 bg-[#111] px-4 text-sm text-neutral-300 outline-none focus:border-[#d4af37]/40"
              >
                <option value="all">
                  All Stock
                </option>

                <option value="healthy">
                  Healthy Stock
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="out">
                  Out of Stock
                </option>

                <option value="active">
                  Active Products
                </option>

                <option value="inactive">
                  Inactive Products
                </option>
              </select>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
                className="h-11 min-w-[180px] rounded-xl border border-white/10 bg-[#111] px-4 text-sm text-neutral-300 outline-none focus:border-[#d4af37]/40"
              >
                <option value="stock-low">
                  Stock: Low to High
                </option>

                <option value="stock-high">
                  Stock: High to Low
                </option>

                <option value="name">
                  Name: A to Z
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Inventory Overview
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Showing{" "}
                {
                  filteredInventory.length
                }{" "}
                of{" "}
                {inventory.length}{" "}
                products
              </p>
            </div>

            {(search ||
              stockFilter !==
                "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStockFilter(
                    "all"
                  );
                }}
                className="self-start text-xs text-[#e4c76b] transition hover:text-white sm:self-auto"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <InventorySkeleton />
          ) : filteredInventory.length ===
            0 ? (
            <EmptyState
              search={search}
              stockFilter={
                stockFilter
              }
              onClear={() => {
                setSearch("");
                setStockFilter(
                  "all"
                );
              }}
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Product
                      </th>

                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Category
                      </th>

                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Price
                      </th>

                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Stock
                      </th>

                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Variants
                      </th>

                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInventory.map(
                      (item) => {
                        const status =
                          getStockStatus(
                            item
                          );

                        return (
                          <InventoryRow
                            key={
                              item._id ||
                              item.productId ||
                              item.sku
                            }
                            item={item}
                            status={
                              status
                            }
                            formatCurrency={
                              formatCurrency
                            }
                            onAdjust={
                              openAdjustment
                            }
                          />
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}
              <div className="grid gap-3 p-3 lg:hidden">
                {filteredInventory.map(
                  (item) => {
                    const status =
                      getStockStatus(
                        item
                      );

                    return (
                      <InventoryCard
                        key={
                          item._id ||
                          item.productId ||
                          item.sku
                        }
                        item={item}
                        status={
                          status
                        }
                        formatCurrency={
                          formatCurrency
                        }
                        onAdjust={
                          openAdjustment
                        }
                      />
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* STOCK UPDATE MODAL */}
      {showAdjustModal &&
        selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#111] shadow-2xl shadow-black/70">
              <div className="flex items-start justify-between border-b border-white/10 p-5 sm:p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
                    Inventory
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Update Stock
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {selectedItem.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeAdjustment
                  }
                  disabled={updating}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-neutral-400 transition hover:border-white/20 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleStockUpdate
                }
                className="space-y-5 p-5 sm:p-6"
              >
                {/* OPERATION */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <OperationButton
                    active={
                      operation ===
                      "restock"
                    }
                    onClick={() =>
                      setOperation(
                        "restock"
                      )
                    }
                    title="Restock"
                    subtitle="Add units"
                    icon="+"
                    type="green"
                  />

                  <OperationButton
                    active={
                      operation ===
                      "remove"
                    }
                    onClick={() =>
                      setOperation(
                        "remove"
                      )
                    }
                    title="Remove"
                    subtitle="Remove units"
                    icon="−"
                    type="red"
                  />

                  <OperationButton
                    active={
                      operation ===
                      "adjust"
                    }
                    onClick={() =>
                      setOperation(
                        "adjust"
                      )
                    }
                    title="Set Stock"
                    subtitle="Exact quantity"
                    icon="="
                    type="gold"
                  />
                </div>

                {/* CURRENT STOCK */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      Current Stock
                    </span>

                    <span className="text-xl font-semibold text-[#e4c76b]">
                      {
                        selectedItem.stock
                      }
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      Minimum Stock
                    </span>

                    <span className="text-sm text-neutral-300">
                      {
                        selectedItem.minimumStock
                      }
                    </span>
                  </div>

                  {operation !==
                    "adjust" && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        After Update
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {getPreviewStock(
                          selectedItem.stock,
                          operation,
                          quantity
                        )}
                      </span>
                    </div>
                  )}

                  {operation ===
                    "adjust" && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        New Stock
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {Number(
                          quantity || 0
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* QUANTITY */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-400">
                    {operation ===
                    "adjust"
                      ? "New Stock Quantity"
                      : "Quantity"}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(
                      event
                    ) =>
                      setQuantity(
                        event.target
                          .value
                      )
                    }
                    placeholder={
                      operation ===
                      "adjust"
                        ? "Example: 25"
                        : "Example: 10"
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#d4af37]/40"
                    required
                  />
                </div>

                {/* REASON */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-neutral-400">
                    Reason
                  </label>

                  <textarea
                    value={reason}
                    onChange={(
                      event
                    ) =>
                      setReason(
                        event.target
                          .value
                      )
                    }
                    rows="3"
                    placeholder="Example: New stock received..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#d4af37]/40"
                  />
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeAdjustment
                    }
                    disabled={
                      updating
                    }
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      updating
                    }
                    className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e4c76b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating
                      ? "Updating..."
                      : "Update Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon,
  danger = false,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#d4af37]/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {label}
          </p>

          <p
            className={`mt-3 text-2xl font-semibold tracking-tight ${
              danger
                ? "text-red-300"
                : "text-white"
            }`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            danger
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-[#d4af37]/20 bg-[#d4af37]/5 text-[#e4c76b]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   DESKTOP ROW
===================================================== */

function InventoryRow({
  item,
  status,
  formatCurrency,
  onAdjust,
}) {
  const variants =
    item.variants || [];

  return (
    <tr className="border-b border-white/5 transition hover:bg-white/[0.02]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <ProductImage item={item} />

          <div className="min-w-0">
            <p className="max-w-[300px] truncate text-sm font-medium text-white">
              {item.name}
            </p>

            <p className="mt-1 text-xs text-neutral-600">
              SKU: {item.sku}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-neutral-400">
        {item.category}
      </td>

      <td className="px-5 py-4 text-sm text-neutral-300">
        {formatCurrency(
          item.price
        )}
      </td>

      <td className="px-5 py-4">
        <span
          className={`text-lg font-semibold ${
            item.stock <= 0
              ? "text-red-300"
              : item.stock <=
                  item.minimumStock
                ? "text-amber-300"
                : "text-emerald-300"
          }`}
        >
          {item.stock}
        </span>
      </td>

      <td className="px-5 py-4 text-sm text-neutral-400">
        {variants.length}
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={() =>
            onAdjust(item)
          }
          className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 px-3 py-2 text-xs font-medium text-[#e4c76b] transition hover:bg-[#d4af37]/10"
        >
          Adjust
        </button>
      </td>
    </tr>
  );
}

/* =====================================================
   MOBILE CARD
===================================================== */

function InventoryCard({
  item,
  status,
  formatCurrency,
  onAdjust,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <ProductImage item={item} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-white">
                {item.name}
              </h3>

              <p className="mt-1 text-xs text-neutral-600">
                SKU: {item.sku}
              </p>
            </div>

            <span
              className={`self-start rounded-full border px-2.5 py-1 text-[10px] font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoBox
              label="Stock"
              value={item.stock}
            />

            <InfoBox
              label="Minimum"
              value={
                item.minimumStock
              }
            />

            <InfoBox
              label="Price"
              value={formatCurrency(
                item.price
              )}
            />

            <InfoBox
              label="Variants"
              value={
                item.variants
                  ?.length || 0
              }
            />
          </div>

          <p className="mt-3 text-xs text-neutral-600">
            Category:{" "}
            <span className="text-neutral-400">
              {item.category}
            </span>
          </p>

          <button
            type="button"
            onClick={() =>
              onAdjust(item)
            }
            className="mt-4 w-full rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 py-3 text-xs font-medium text-[#e4c76b] transition hover:bg-[#d4af37]/10"
          >
            Adjust Stock
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   OPERATION BUTTON
===================================================== */

function OperationButton({
  active,
  onClick,
  title,
  subtitle,
  icon,
  type,
}) {
  const styles = {
    green: active
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
      : "border-white/10 text-neutral-400",

    red: active
      ? "border-red-400/40 bg-red-500/10 text-red-300"
      : "border-white/10 text-neutral-400",

    gold: active
      ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e4c76b]"
      : "border-white/10 text-neutral-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition hover:bg-white/5 ${styles[type]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {icon}
        </span>

        <span>
          <span className="block text-sm font-medium">
            {title}
          </span>

          <span className="mt-0.5 block text-[10px] opacity-60">
            {subtitle}
          </span>
        </span>
      </div>
    </button>
  );
}

/* =====================================================
   INFO BOX
===================================================== */

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.025] p-3">
      <p className="text-[9px] uppercase tracking-widest text-neutral-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-neutral-300">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   PRODUCT IMAGE
===================================================== */

function ProductImage({ item }) {
  const [imageError, setImageError] =
    useState(false);

  if (
    !item.image ||
    imageError
  ) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/5 text-sm text-[#e4c76b]">
        BHB
      </div>
    );
  }

  return (
    <img
      src={item.image}
      alt={item.name}
      onError={() =>
        setImageError(true)
      }
      className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
    />
  );
}

/* =====================================================
   PREVIEW STOCK
===================================================== */

function getPreviewStock(
  currentStock,
  operation,
  quantity
) {
  const current =
    Number(currentStock || 0);

  const value =
    Number(quantity || 0);

  if (operation === "restock") {
    return current + value;
  }

  if (operation === "remove") {
    return Math.max(
      0,
      current - value
    );
  }

  return value;
}

/* =====================================================
   LOADING
===================================================== */

function InventorySkeleton() {
  return (
    <div className="divide-y divide-white/5">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 p-5"
        >
          <div className="h-12 w-12 rounded-xl bg-white/5" />

          <div className="flex-1">
            <div className="h-3 w-48 rounded bg-white/5" />

            <div className="mt-2 h-2 w-28 rounded bg-white/5" />
          </div>

          <div className="hidden h-3 w-20 rounded bg-white/5 sm:block" />

          <div className="hidden h-3 w-14 rounded bg-white/5 md:block" />

          <div className="h-8 w-20 rounded-lg bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  search,
  stockFilter,
  onClear,
}) {
  const filtered =
    Boolean(search) ||
    stockFilter !== "all";

  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-2xl text-[#e4c76b]">
        {filtered ? "⌕" : "▦"}
      </div>

      <h3 className="mt-5 text-base font-semibold">
        {filtered
          ? "No inventory items found"
          : "No inventory data available"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
        {filtered
          ? "Try changing your search or stock filters."
          : "Inventory items will appear here once products are available."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-2.5 text-xs text-[#e4c76b] transition hover:bg-[#d4af37]/10"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default AdminInventory;