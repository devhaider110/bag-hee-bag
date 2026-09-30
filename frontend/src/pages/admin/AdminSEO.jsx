import {
  useEffect,
  useState,
} from "react";

import {
  deleteSeo,
  getSeoRecords,
  saveSeo,
} from "../../services/seoService";

import {
  getProducts,
} from "../../services/productService";

import {
  getCategories,
} from "../../services/categoryService";

const emptyForm = {
  entityType: "page",
  entityId: "",
  path: "",
  slug: "",
  title: "",
  metaDescription: "",
  keywords: "",
  ogImage: "",
  canonicalUrl: "",
  robots: "index,follow",
  isActive: true,
};

const AdminSEO = () => {
  const [records, setRecords] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [form, setForm] =
    useState(emptyForm);

  const [search, setSearch] =
    useState("");

  const [entityType, setEntityType] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [entitiesLoading, setEntitiesLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD SEO RECORDS
  // =====================================================

  const loadRecords =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getSeoRecords({
            entityType,
            search,
          });

        setRecords(
          response?.records || []
        );
      } catch (err) {
        console.error(
          "SEO records error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load SEO records."
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // LOAD PRODUCTS / CATEGORIES
  // =====================================================

  const loadEntityOptions =
    async (type) => {
      if (
        type !== "product" &&
        type !== "category"
      ) {
        return;
      }

      try {
        setEntitiesLoading(true);
        setError("");

        if (type === "product") {
          const response =
            await getProducts();

          setProducts(
            response?.data ||
              response?.products ||
              []
          );
        }

        if (type === "category") {
          const response =
            await getCategories();

          setCategories(
            response?.data ||
              response?.categories ||
              []
          );
        }
      } catch (err) {
        console.error(
          "SEO entity options error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            `Unable to load ${type}s.`
        );
      } finally {
        setEntitiesLoading(false);
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadRecords();
  }, [entityType]);

  // =====================================================
  // LOAD ENTITY OPTIONS WHEN TYPE CHANGES
  // =====================================================

  useEffect(() => {
    loadEntityOptions(
      form.entityType
    );
  }, [form.entityType]);

  // =====================================================
  // UPDATE FORM FIELD
  // =====================================================

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // =====================================================
  // CHANGE ENTITY TYPE
  // =====================================================

  const handleEntityTypeChange = (
    value
  ) => {
    setForm((current) => ({
      ...current,

      entityType: value,

      // Entity ID belongs only to
      // product/category.
      entityId:
        value === "page"
          ? ""
          : current.entityId,

      // Page-specific values
      // should remain available.
      path:
        value === "page"
          ? current.path
          : current.path,

      slug:
        current.slug,
    }));
  };

  // =====================================================
  // EDIT SEO RECORD
  // =====================================================

  const editRecord = (
    record
  ) => {
    setForm({
      entityType:
        record.entityType ||
        "page",

      entityId:
        record.entityId || "",

      path:
        record.path || "",

      slug:
        record.slug || "",

      title:
        record.title || "",

      metaDescription:
        record.metaDescription ||
        "",

      keywords: Array.isArray(
        record.keywords
      )
        ? record.keywords.join(", ")
        : "",

      ogImage:
        record.ogImage || "",

      canonicalUrl:
        record.canonicalUrl ||
        "",

      robots:
        record.robots ||
        "index,follow",

      isActive:
        record.isActive !== false,

      _id:
        record._id,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // GET SELECTED ENTITY NAME
  // =====================================================

  const getEntityName = (
    record
  ) => {
    if (!record?.entityId) {
      return "—";
    }

    if (
      record.entityType ===
      "product"
    ) {
      const product =
        products.find(
          (item) =>
            String(item._id) ===
            String(record.entityId)
        );

      return (
        product?.name ||
        `Product ID: ${record.entityId}`
      );
    }

    if (
      record.entityType ===
      "category"
    ) {
      const category =
        categories.find(
          (item) =>
            String(item._id) ===
            String(record.entityId)
        );

      return (
        category?.name ||
        `Category ID: ${record.entityId}`
      );
    }

    return "—";
  };

  // =====================================================
  // SAVE SEO
  // =====================================================

  const handleSave =
    async () => {
      try {
        setSaving(true);
        setMessage("");
        setError("");

        const payload = {
          entityType:
            form.entityType,

          path:
            form.path,

          slug:
            form.slug,

          title:
            form.title,

          metaDescription:
            form.metaDescription,

          keywords:
            form.keywords
              .split(",")
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean),

          ogImage:
            form.ogImage,

          canonicalUrl:
            form.canonicalUrl,

          robots:
            form.robots,

          isActive:
            form.isActive,
        };

        // -------------------------------------------------
        // ONLY PRODUCT / CATEGORY SEND ENTITY ID
        // -------------------------------------------------

        if (
          form.entityType ===
            "product" ||
          form.entityType ===
            "category"
        ) {
          payload.entityId =
            form.entityId;
        }

        await saveSeo(
          payload
        );

        setMessage(
          "SEO settings saved successfully."
        );

        setForm({
          ...emptyForm,
        });

        await loadRecords();
      } catch (err) {
        console.error(
          "SEO save error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to save SEO settings."
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // DELETE SEO
  // =====================================================

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "Delete this SEO record?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setMessage("");
        setError("");

        await deleteSeo(id);

        setMessage(
          "SEO record deleted successfully."
        );

        await loadRecords();
      } catch (err) {
        console.error(
          "SEO delete error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to delete SEO record."
        );
      }
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          

          <h1 className="mt-2 text-3xl font-semibold">
            SEO Management
          </h1>

          <p className="mt-2 text-sm text-white/45">
            Manage SEO metadata for pages,
            products and categories.
          </p>
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =================================================
            SEO FORM
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              SEO Record
            </h2>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...emptyForm,
                })
              }
              className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* =================================================
                ENTITY TYPE
            ================================================= */}

            <Field
              label="Entity Type"
              type="select"
              value={
                form.entityType
              }
              onChange={
                handleEntityTypeChange
              }
              options={[
                {
                  label: "Page",
                  value: "page",
                },
                {
                  label: "Product",
                  value: "product",
                },
                {
                  label: "Category",
                  value: "category",
                },
              ]}
            />

            {/* =================================================
                PRODUCT SELECT
            ================================================= */}

            {form.entityType ===
              "product" && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
                  Product
                </span>

                <select
                  value={
                    form.entityId
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "entityId",
                      event.target.value
                    )
                  }
                  disabled={
                    entitiesLoading
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {entitiesLoading
                      ? "Loading products..."
                      : "Select Product"}
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={
                          product._id
                        }
                        value={
                          product._id
                        }
                      >
                        {product.name}
                        {product.sku
                          ? ` — ${product.sku}`
                          : ""}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2 text-xs text-white/30">
                  Select the product. Its
                  MongoDB ID is handled
                  automatically.
                </p>
              </label>
            )}

            {/* =================================================
                CATEGORY SELECT
            ================================================= */}

            {form.entityType ===
              "category" && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
                  Category
                </span>

                <select
                  value={
                    form.entityId
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "entityId",
                      event.target.value
                    )
                  }
                  disabled={
                    entitiesLoading
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {entitiesLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category._id
                        }
                        value={
                          category._id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2 text-xs text-white/30">
                  Select the category. Its
                  MongoDB ID is handled
                  automatically.
                </p>
              </label>
            )}

            {/* =================================================
                PAGE PATH
            ================================================= */}

            <Field
              label="Path"
              value={
                form.path
              }
              onChange={(value) =>
                updateField(
                  "path",
                  value
                )
              }
              placeholder="/shop"
            />

            {/* =================================================
                SLUG
            ================================================= */}

            <Field
              label="Slug"
              value={
                form.slug
              }
              onChange={(value) =>
                updateField(
                  "slug",
                  value
                )
              }
              placeholder="black-premium-handbag"
            />

            {/* =================================================
                SEO TITLE
            ================================================= */}

            <Field
              label="SEO Title"
              value={
                form.title
              }
              onChange={(value) =>
                updateField(
                  "title",
                  value
                )
              }
            />

            {/* =================================================
                OG IMAGE
            ================================================= */}

            <Field
              label="OG Image URL"
              value={
                form.ogImage
              }
              onChange={(value) =>
                updateField(
                  "ogImage",
                  value
                )
              }
            />

            {/* =================================================
                CANONICAL URL
            ================================================= */}

            <Field
              label="Canonical URL"
              value={
                form.canonicalUrl
              }
              onChange={(value) =>
                updateField(
                  "canonicalUrl",
                  value
                )
              }
            />

            {/* =================================================
                ROBOTS
            ================================================= */}

            <Field
              label="Robots"
              value={
                form.robots
              }
              onChange={(value) =>
                updateField(
                  "robots",
                  value
                )
              }
            />
          </div>

          {/* =================================================
              DESCRIPTION + KEYWORDS
          ================================================= */}

          <div className="mt-5 space-y-5">

            <TextArea
              label="Meta Description"
              value={
                form.metaDescription
              }
              onChange={(value) =>
                updateField(
                  "metaDescription",
                  value
                )
              }
            />

            <TextArea
              label="Keywords"
              value={
                form.keywords
              }
              onChange={(value) =>
                updateField(
                  "keywords",
                  value
                )
              }
              placeholder="ladies handbag, black handbag, premium purse"
            />
          </div>

          {/* =================================================
              ACTIVE
          ================================================= */}

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={
                form.isActive
              }
              onChange={(event) =>
                updateField(
                  "isActive",
                  event.target
                    .checked
                )
              }
              className="h-4 w-4 accent-[#d4af37]"
            />

            SEO record active
          </label>

          {/* =================================================
              SAVE
          ================================================= */}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={
                saving ||
                entitiesLoading
              }
              onClick={
                handleSave
              }
              className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#e7c85a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save SEO"}
            </button>
          </div>
        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">

          <div className="flex flex-col gap-3 lg:flex-row">

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  loadRecords();
                }
              }}
              placeholder="Search SEO title, slug or path..."
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50"
            />

            <select
              value={
                entityType
              }
              onChange={(event) =>
                setEntityType(
                  event.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">
                All Types
              </option>

              <option value="page">
                Pages
              </option>

              <option value="product">
                Products
              </option>

              <option value="category">
                Categories
              </option>
            </select>

            <button
              type="button"
              onClick={
                loadRecords
              }
              className="rounded-xl border border-[#d4af37]/30 px-5 py-3 text-sm text-[#e4c76b] transition hover:bg-[#d4af37]/10"
            >
              Search
            </button>
          </div>
        </section>

        {/* =================================================
            SEO RECORDS
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          {loading ? (
            <div className="p-8 text-center text-sm text-white/40">
              Loading SEO records...
            </div>
          ) : records.length ===
            0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-medium">
                No SEO records found.
              </p>

              <p className="mt-2 text-sm text-white/40">
                Create a record for a
                page, product or
                category.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px] text-left text-sm">

                <thead className="border-b border-white/10 bg-white/[0.03]">

                  <tr>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-white/40">
                      Type
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-white/40">
                      Entity
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-white/40">
                      Title
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-white/40">
                      Path / Slug
                    </th>

                    <th className="px-5 py-4 text-xs uppercase tracking-wider text-white/40">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs uppercase tracking-wider text-white/40">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {records.map(
                    (record) => (
                      <tr
                        key={
                          record._id
                        }
                        className="border-b border-white/5 last:border-0"
                      >

                        {/* TYPE */}

                        <td className="px-5 py-4">

                          <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-3 py-1 text-xs capitalize text-[#e4c76b]">
                            {
                              record.entityType
                            }
                          </span>

                        </td>

                        {/* ENTITY */}

                        <td className="max-w-[240px] px-5 py-4">

                          <p className="truncate font-medium text-white/80">
                            {getEntityName(
                              record
                            )}
                          </p>

                          {record.entityType !==
                            "page" &&
                            record.entityId && (
                              <p className="mt-1 truncate text-[10px] text-white/20">
                                ID handled
                                internally
                              </p>
                            )}

                        </td>

                        {/* TITLE */}

                        <td className="max-w-[300px] px-5 py-4">

                          <p className="truncate font-medium">
                            {
                              record.title
                            }
                          </p>

                          <p className="mt-1 truncate text-xs text-white/35">
                            {
                              record.metaDescription
                            }
                          </p>

                        </td>

                        {/* PATH / SLUG */}

                        <td className="px-5 py-4 text-xs text-white/50">

                          {record.path ||
                            record.slug ||
                            "—"}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={
                              record.isActive
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {record.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                editRecord(
                                  record
                                )
                              }
                              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  record._id
                                )
                              }
                              className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/10"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
};

// =====================================================
// FIELD
// =====================================================

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  options = [],
  placeholder = "",
}) => {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
        {label}
      </span>

      {type === "select" ? (
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50"
        >
          {options.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {
                  option.label
                }
              </option>
            )
          )}
        </select>
      ) : (
        <input
          type={type}
          value={
            value ?? ""
          }
          placeholder={
            placeholder
          }
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#d4af37]/50"
        />
      )}

    </label>
  );
};

// =====================================================
// TEXT AREA
// =====================================================

const TextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
}) => {
  return (
    <label className="block">

      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
        {label}
      </span>

      <textarea
        rows={4}
        value={
          value ?? ""
        }
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#d4af37]/50"
      />

    </label>
  );
};

export default AdminSEO;