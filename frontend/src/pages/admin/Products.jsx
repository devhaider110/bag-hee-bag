import { useEffect, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import ProductForm from "../../components/ProductForm";
import ProductList from "../../components/ProductList";
import ProductMediaVariants from "../../components/ProductMediaVariants";

import { getCategories } from "../../services/categoryService";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD PRODUCTS + CATEGORIES
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productsResponse,
        categoriesResponse,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(productsResponse?.data || []);
      setCategories(categoriesResponse?.data || []);
    } catch (err) {
      console.error(
        "Product page loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load product data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // CREATE / UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      let savedProduct;

      if (editingProduct) {
        const response = await updateProduct(
          editingProduct._id,
          formData
        );

        savedProduct = response?.data;

        setMessage(
          "Product updated successfully."
        );
      } else {
        const response =
          await createProduct(formData);

        savedProduct = response?.data;

        setMessage(
          "Product created successfully. You can now add product photos and videos below."
        );
      }

      await loadData();

      // Keep the saved product selected so the
      // media manager becomes available immediately.
      if (savedProduct?._id) {
        setEditingProduct(savedProduct);

        window.setTimeout(() => {
          const mediaSection =
            document.getElementById(
              "product-media-manager"
            );

          mediaSection?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (err) {
      console.error(
        "Product save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete = async (product) => {
    if (!product?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteProduct(product._id);

      setMessage(
        "Product deleted successfully."
      );

      if (
        editingProduct?._id === product._id
      ) {
        setEditingProduct(null);
      }

      await loadData();
    } catch (err) {
      console.error(
        "Product delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete product."
      );
    }
  };

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const handleEdit = (product) => {
    setMessage("");
    setError("");
    setEditingProduct(product);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setMessage("");
    setError("");
  };

  // ==========================================
  // PRODUCT COUNTS
  // ==========================================

  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;

  const inactiveProducts = products.filter(
    (product) => !product.isActive
  ).length;

  const featuredProducts = products.filter(
    (product) => product.isFeatured
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) <= 0
  ).length;

  const activeCategories = categories.filter(
    (category) => category.isActive
  );

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:py-12">

          {/* ========================================
              PAGE HEADER
          ======================================== */}

          <header className="mb-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#c8a84e]">
                  BHB Administration
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                  Product Management
                </h1>

                <p className="mt-2 max-w-2xl text-xs leading-6 text-neutral-500 sm:text-sm">
                  Create, update and manage the
                  core product information for the
                  BHB collection.
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  sm:grid-cols-4
                  xl:w-auto
                  xl:shrink-0
                "
              >
                <StatCard
                  label="Total"
                  value={products.length}
                />

                <StatCard
                  label="Active"
                  value={activeProducts}
                  accent
                />

                <StatCard
                  label="Featured"
                  value={featuredProducts}
                />

                <StatCard
                  label="Out Stock"
                  value={outOfStockProducts}
                  danger
                />
              </div>
            </div>
          </header>

          {/* ========================================
              MESSAGES
          ======================================== */}

          {message && (
            <Alert
              type="success"
              message={message}
              onClose={() =>
                setMessage("")
              }
            />
          )}

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() =>
                setError("")
              }
            />
          )}

          {/* ========================================
              CATEGORY WARNING
          ======================================== */}

          {activeCategories.length === 0 && (
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
              <p className="text-sm font-medium text-amber-400">
                No active categories available.
              </p>

              <p className="mt-1 text-xs leading-6 text-amber-500/70">
                Create at least one active
                category before adding a
                product.
              </p>
            </div>
          )}

          {/* ========================================
              MAIN ADMIN WORKSPACE

              LEFT  = PRODUCT FORM
              RIGHT = PRODUCT COLLECTION
          ======================================== */}

          <div
            className="
              grid
              grid-cols-1
              items-start
              gap-6
              lg:grid-cols-[340px_minmax(0,1fr)]
              xl:grid-cols-[370px_minmax(0,1fr)]
              2xl:gap-8
            "
          >

            {/* ======================================
                LEFT — ADD / EDIT PRODUCT
            ====================================== */}

            <aside className="min-w-0 lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#080808] shadow-2xl">

                <div className="border-b border-white/5 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#c8a84e]">
                        {editingProduct
                          ? "Edit Product"
                          : "Catalogue"}
                      </p>

                      <h2 className="mt-1 text-base font-semibold text-white">
                        {editingProduct
                          ? "Update Product"
                          : "Add Product"}
                      </h2>
                    </div>

                    {editingProduct && (
                      <button
                        type="button"
                        onClick={
                          handleCancelEdit
                        }
                        className="
                          rounded-lg
                          border
                          border-white/10
                          px-2.5
                          py-1.5
                          text-[9px]
                          text-neutral-500
                          transition
                          hover:border-white/20
                          hover:text-white
                        "
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <p className="mt-1 text-[9px] leading-5 text-neutral-600">
                    {editingProduct
                      ? "Modify the selected product details."
                      : "Add complete product information to your BHB catalogue."}
                  </p>
                </div>

                <div className="p-4 sm:p-5">
                  <ProductForm
                    categories={categories}
                    editingProduct={
                      editingProduct
                    }
                    onSubmit={handleSubmit}
                    onCancel={
                      handleCancelEdit
                    }
                    saving={saving}
                  />
                </div>
              </div>
            </aside>

            {/* ======================================
                RIGHT — PRODUCTS
            ====================================== */}

            <section className="min-w-0">

              <div className="mb-5 rounded-[22px] border border-white/10 bg-[#080808] px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="min-w-0">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.35em] text-[#c8a84e]">
                      BHB Collection
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="text-lg font-semibold text-white">
                        All Products
                      </h2>

                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[8px] text-neutral-500">
                        {products.length}{" "}
                        {products.length === 1
                          ? "product"
                          : "products"}
                      </span>
                    </div>

                    <p className="mt-1 text-[9px] text-neutral-600">
                      {inactiveProducts > 0
                        ? `${inactiveProducts} inactive product${
                            inactiveProducts !==
                            1
                              ? "s"
                              : ""
                          }`
                        : "All products are active"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    className="
                      shrink-0
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.02]
                      px-4
                      py-2.5
                      text-[9px]
                      font-medium
                      text-neutral-400
                      transition
                      hover:border-[#d4af37]/30
                      hover:text-[#d4af37]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {loading
                      ? "Refreshing..."
                      : "↻ Refresh Catalogue"}
                  </button>
                </div>
              </div>

              {/* ====================================
                  PRODUCT LIST
              ==================================== */}

              <ProductList
                products={products}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {/* ====================================
                  MEDIA + VARIANTS
              ==================================== */}

              {editingProduct && (
                <div
                  id="product-media-manager"
                  className="mt-6 scroll-mt-6"
                >
                  <ProductMediaVariants
                    product={editingProduct}
                    onUpdated={(
                      updatedProduct
                    ) => {
                      setEditingProduct(
                        updatedProduct
                      );

                      setProducts(
                        (prevProducts) =>
                          prevProducts.map(
                            (product) =>
                              product._id ===
                              updatedProduct._id
                                ? updatedProduct
                                : product
                          )
                      );
                    }}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}

/* ================================================
   STAT CARD
================================================ */

function StatCard({
  label,
  value,
  accent = false,
  danger = false,
}) {
  return (
    <div
      className={`
        min-w-[82px]
        rounded-xl
        border
        px-3
        py-3
        ${
          accent
            ? "border-[#d4af37]/15 bg-[#d4af37]/5"
            : danger
            ? "border-red-500/15 bg-red-500/[0.03]"
            : "border-white/10 bg-white/[0.025]"
        }
      `}
    >
      <p className="text-[7px] font-medium uppercase tracking-[0.18em] text-neutral-600">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-lg
          font-semibold
          ${
            accent
              ? "text-[#e4c76b]"
              : danger
              ? "text-red-400"
              : "text-white"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* ================================================
   ALERT
================================================ */

function Alert({
  type,
  message,
  onClose,
}) {
  const isSuccess = type === "success";

  return (
    <div
      className={`
        mb-5
        flex
        items-start
        justify-between
        gap-4
        rounded-2xl
        border
        px-4
        py-3.5
        ${
          isSuccess
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            : "border-red-500/20 bg-red-500/5 text-red-400"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span
          className={`
            mt-0.5
            flex
            h-5
            w-5
            shrink-0
            items-center
            justify-center
            rounded-full
            text-[9px]
            ${
              isSuccess
                ? "bg-emerald-500/10"
                : "bg-red-500/10"
            }
          `}
        >
          {isSuccess ? "✓" : "!"}
        </span>

        <span className="text-xs leading-5">
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 text-base opacity-50 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export default Products;