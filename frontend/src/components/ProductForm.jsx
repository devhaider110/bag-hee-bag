import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  sku: "",
  brand: "BAG HEE BAG",

  price: "",
  discountPrice: "",

  material: "",
  color: "",
  size: "",

  length: "",
  width: "",
  height: "",
  dimensionUnit: "cm",

  weightValue: "",
  weightUnit: "g",

  waterResistance: "",
  closureType: "",
  strapType: "",

  compartments: 0,
  pockets: 0,

  suitableFor: "",
  interiorDetails: "",
  exteriorDetails: "",
  careInstructions: "",
  countryOfOrigin: "India",
  warranty: "",
  returnEligibility: "",
  whatsIncluded: "",
  productHighlights: "",

  stock: "",
  image: "",

  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

function ProductForm({
  categories = [],
  editingProduct,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!editingProduct) {
      setForm({
        ...emptyForm,
      });
      setFormError("");
      return;
    }

    setForm({
      name: editingProduct.name || "",
      description:
        editingProduct.description || "",
      category:
        editingProduct.category?._id ||
        editingProduct.category ||
        "",
      sku: editingProduct.sku || "",
      brand:
        editingProduct.brand ||
        "BAG HEE BAG",

      price:
        editingProduct.price ?? "",
      discountPrice:
        editingProduct.discountPrice ?? "",

      material:
        editingProduct.material || "",
      color:
        editingProduct.color || "",
      size:
        editingProduct.size || "",

      length:
        editingProduct.dimensions?.length ??
        "",
      width:
        editingProduct.dimensions?.width ??
        "",
      height:
        editingProduct.dimensions?.height ??
        "",
      dimensionUnit:
        editingProduct.dimensions?.unit ||
        "cm",

      weightValue:
        editingProduct.weight?.value ??
        "",
      weightUnit:
        editingProduct.weight?.unit ||
        "g",

      waterResistance:
        editingProduct.waterResistance ||
        "",
      closureType:
        editingProduct.closureType || "",
      strapType:
        editingProduct.strapType || "",

      compartments:
        editingProduct.compartments ?? 0,
      pockets:
        editingProduct.pockets ?? 0,

      suitableFor:
        editingProduct.suitableFor || "",
      interiorDetails:
        editingProduct.interiorDetails || "",
      exteriorDetails:
        editingProduct.exteriorDetails || "",
      careInstructions:
        editingProduct.careInstructions || "",
      countryOfOrigin:
        editingProduct.countryOfOrigin ||
        "India",
      warranty:
        editingProduct.warranty || "",
      returnEligibility:
        editingProduct.returnEligibility ||
        "",
      whatsIncluded:
        editingProduct.whatsIncluded || "",
      productHighlights:
        editingProduct.productHighlights ||
        "",

      stock:
        editingProduct.stock ?? "",
      image:
        editingProduct.image || "",

      isActive:
        editingProduct.isActive ?? true,
      isFeatured:
        editingProduct.isFeatured ?? false,
      isNewArrival:
        editingProduct.isNewArrival ?? false,
      isBestSeller:
        editingProduct.isBestSeller ?? false,
    });

    setFormError("");
  }, [editingProduct]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setFormError("");

    const name = form.name.trim();
    const description =
      form.description.trim();
    const sku = form.sku.trim();

    if (!name) {
      setFormError(
        "Product name is required."
      );
      return;
    }

    if (!description) {
      setFormError(
        "Product description is required."
      );
      return;
    }

    if (!form.category) {
      setFormError(
        "Please select a category."
      );
      return;
    }

    if (!sku) {
      setFormError(
        "Product SKU is required."
      );
      return;
    }

    const price = Number(form.price);

    if (
      form.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setFormError(
        "Please enter a valid product price."
      );
      return;
    }

    let discountPrice = null;

    if (form.discountPrice !== "") {
      discountPrice = Number(
        form.discountPrice
      );

      if (
        Number.isNaN(discountPrice) ||
        discountPrice < 0
      ) {
        setFormError(
          "Please enter a valid discount price."
        );
        return;
      }

      if (discountPrice >= price) {
        setFormError(
          "Discount price must be lower than the original price."
        );
        return;
      }
    }

    const stock = Number(
      form.stock === ""
        ? 0
        : form.stock
    );

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      setFormError(
        "Stock cannot be negative."
      );
      return;
    }

    const productData = {
      name,
      description,
      category: form.category,
      sku,
      brand: form.brand.trim(),

      price,
      discountPrice,

      material:
        form.material.trim(),
      color:
        form.color.trim(),
      size:
        form.size.trim(),

      dimensions: {
        length:
          form.length === ""
            ? null
            : Number(form.length),

        width:
          form.width === ""
            ? null
            : Number(form.width),

        height:
          form.height === ""
            ? null
            : Number(form.height),

        unit: form.dimensionUnit,
      },

      weight: {
        value:
          form.weightValue === ""
            ? null
            : Number(
                form.weightValue
              ),

        unit: form.weightUnit,
      },

      waterResistance:
        form.waterResistance,

      closureType:
        form.closureType.trim(),

      strapType:
        form.strapType.trim(),

      compartments: Number(
        form.compartments || 0
      ),

      pockets: Number(
        form.pockets || 0
      ),

      suitableFor:
        form.suitableFor.trim(),

      interiorDetails:
        form.interiorDetails.trim(),

      exteriorDetails:
        form.exteriorDetails.trim(),

      careInstructions:
        form.careInstructions.trim(),

      countryOfOrigin:
        form.countryOfOrigin.trim(),

      warranty:
        form.warranty.trim(),

      returnEligibility:
        form.returnEligibility.trim(),

      whatsIncluded:
        form.whatsIncluded.trim(),

      productHighlights:
        form.productHighlights.trim(),

      stock,

      image:
        form.image.trim(),

      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
    };

    onSubmit(productData);
  };

  const activeCategories =
    categories.filter(
      (category) =>
        category.isActive !== false
    );

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/50 focus:bg-black/40";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* =====================================
          BASIC INFORMATION
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="01"
          title="Basic Information"
          description="Core information about your product."
        />

        <div className="space-y-5">

          <Field label="Product Name *">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Classic Ladies Handbag"
              maxLength={150}
              required
            />
          </Field>

          <Field label="Description *">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputClass} min-h-32 resize-y`}
              placeholder="Describe the product..."
              maxLength={3000}
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">

            <Field label="Category *">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Category
                </option>

                {activeCategories.map(
                  (category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="SKU *">
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className={inputClass}
                placeholder="BHB-LADIES-001"
                maxLength={80}
                required
              />
            </Field>

          </div>

          <Field label="Brand">
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className={inputClass}
              placeholder="BAG HEE BAG"
            />
          </Field>

        </div>
      </section>

      {/* =====================================
          PRICING
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="02"
          title="Pricing"
          description="Set the regular and discounted price."
        />

        <div className="grid gap-5 sm:grid-cols-2">

          <Field label="Original Price (₹) *">
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className={inputClass}
              placeholder="1999"
              min="0"
              step="0.01"
              required
            />
          </Field>

          <Field label="Discount Price (₹)">
            <input
              type="number"
              name="discountPrice"
              value={form.discountPrice}
              onChange={handleChange}
              className={inputClass}
              placeholder="1499"
              min="0"
              step="0.01"
            />
          </Field>

        </div>

      </section>

      {/* =====================================
          SPECIFICATIONS
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="03"
          title="Specifications"
          description="Physical characteristics of the product."
        />

        <div className="grid gap-5 sm:grid-cols-2">

          <Field label="Material">
            <input
              type="text"
              name="material"
              value={form.material}
              onChange={handleChange}
              className={inputClass}
              placeholder="PU Leather"
            />
          </Field>

          <Field label="Color">
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              className={inputClass}
              placeholder="Black"
            />
          </Field>

          <Field label="Size">
            <input
              type="text"
              name="size"
              value={form.size}
              onChange={handleChange}
              className={inputClass}
              placeholder="Medium"
            />
          </Field>

          <Field label="Water Resistance">
            <select
              name="waterResistance"
              value={form.waterResistance}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">
                Select
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
          </Field>

          <Field label="Closure Type">
            <input
              type="text"
              name="closureType"
              value={form.closureType}
              onChange={handleChange}
              className={inputClass}
              placeholder="Zip"
            />
          </Field>

          <Field label="Strap Type">
            <input
              type="text"
              name="strapType"
              value={form.strapType}
              onChange={handleChange}
              className={inputClass}
              placeholder="Shoulder / Crossbody"
            />
          </Field>

        </div>

        {/* DIMENSIONS */}

        <div className="mt-7">

          <SubHeading title="Dimensions" />

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">

            <input
              type="number"
              name="length"
              value={form.length}
              onChange={handleChange}
              className={inputClass}
              placeholder="Length"
              min="0"
              step="0.01"
            />

            <input
              type="number"
              name="width"
              value={form.width}
              onChange={handleChange}
              className={inputClass}
              placeholder="Width"
              min="0"
              step="0.01"
            />

            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              className={inputClass}
              placeholder="Height"
              min="0"
              step="0.01"
            />

            <select
              name="dimensionUnit"
              value={form.dimensionUnit}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="cm">
                cm
              </option>

              <option value="inch">
                inch
              </option>
            </select>

          </div>

        </div>

        {/* WEIGHT */}

        <div className="mt-7">

          <SubHeading title="Weight" />

          <div className="grid gap-3 sm:grid-cols-2">

            <input
              type="number"
              name="weightValue"
              value={form.weightValue}
              onChange={handleChange}
              className={inputClass}
              placeholder="Weight"
              min="0"
              step="0.01"
            />

            <select
              name="weightUnit"
              value={form.weightUnit}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="g">
                Grams
              </option>

              <option value="kg">
                Kilograms
              </option>
            </select>

          </div>

        </div>

        {/* COMPARTMENTS */}

        <div className="mt-7 grid gap-5 sm:grid-cols-2">

          <Field label="Compartments">
            <input
              type="number"
              name="compartments"
              value={form.compartments}
              onChange={handleChange}
              className={inputClass}
              min="0"
              step="1"
            />
          </Field>

          <Field label="Pockets">
            <input
              type="number"
              name="pockets"
              value={form.pockets}
              onChange={handleChange}
              className={inputClass}
              min="0"
              step="1"
            />
          </Field>

        </div>

      </section>

      {/* =====================================
          PRODUCT DETAILS
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="04"
          title="Product Details"
          description="Detailed information customers may need."
        />

        <div className="space-y-5">

          <Field label="Suitable For">
            <input
              type="text"
              name="suitableFor"
              value={form.suitableFor}
              onChange={handleChange}
              className={inputClass}
              placeholder="Office, College, Casual, Travel"
            />
          </Field>

          <Field label="Interior Details">
            <textarea
              name="interiorDetails"
              value={form.interiorDetails}
              onChange={handleChange}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Interior compartments, lining, pockets..."
            />
          </Field>

          <Field label="Exterior Details">
            <textarea
              name="exteriorDetails"
              value={form.exteriorDetails}
              onChange={handleChange}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Exterior finish, design, hardware..."
            />
          </Field>

          <Field label="Product Highlights">
            <textarea
              name="productHighlights"
              value={form.productHighlights}
              onChange={handleChange}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Premium finish, lightweight design..."
            />
          </Field>

          <Field label="Care Instructions">
            <textarea
              name="careInstructions"
              value={form.careInstructions}
              onChange={handleChange}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Keep away from excessive moisture..."
            />
          </Field>

        </div>

      </section>

      {/* =====================================
          WARRANTY & RETURN
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="05"
          title="Warranty & Return"
          description="After-sales information."
        />

        <div className="space-y-5">

          <div className="grid gap-5 sm:grid-cols-2">

            <Field label="Country of Origin">
              <input
                type="text"
                name="countryOfOrigin"
                value={
                  form.countryOfOrigin
                }
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Warranty">
              <input
                type="text"
                name="warranty"
                value={form.warranty}
                onChange={handleChange}
                className={inputClass}
                placeholder="6 Months"
              />
            </Field>

          </div>

          <Field label="Return Eligibility">
            <textarea
              name="returnEligibility"
              value={
                form.returnEligibility
              }
              onChange={handleChange}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Eligible within 7 days..."
            />
          </Field>

          <Field label="What's Included">
            <textarea
              name="whatsIncluded"
              value={form.whatsIncluded}
              onChange={handleChange}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="1 Handbag, 1 Shoulder Strap..."
            />
          </Field>

        </div>

      </section>

      {/* =====================================
          STOCK & IMAGE
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="06"
          title="Stock & Main Image"
          description="Basic inventory and fallback product image."
        />

        <div className="space-y-5">

          <Field label="Current Stock">
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className={inputClass}
              placeholder="25"
              min="0"
              step="1"
            />
          </Field>

          <Field label="Main Image URL">
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://..."
            />

            <p className="mt-2 text-[10px] leading-5 text-zinc-700">
              This is the fallback/main product
              image. Additional Cloudinary media can
              be managed below after the product is
              created.
            </p>
          </Field>

        </div>

      </section>

      {/* =====================================
          VISIBILITY
      ===================================== */}

      <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl sm:p-6">

        <SectionHeading
          number="07"
          title="Store Visibility"
          description="Control product visibility and merchandising."
        />

        <div className="grid gap-3 sm:grid-cols-2">

          <Toggle
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            label="Active Product"
            description="Visible in the active catalogue."
          />

          <Toggle
            name="isFeatured"
            checked={form.isFeatured}
            onChange={handleChange}
            label="Featured"
            description="Show in featured collections."
          />

          <Toggle
            name="isNewArrival"
            checked={form.isNewArrival}
            onChange={handleChange}
            label="New Arrival"
            description="Mark as a new collection item."
          />

          <Toggle
            name="isBestSeller"
            checked={form.isBestSeller}
            onChange={handleChange}
            label="Best Seller"
            description="Mark as a popular product."
          />

        </div>

      </section>

      {/* =====================================
          FORM ERROR
      ===================================== */}

      {formError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-400">
          {formError}
        </div>
      )}

      {/* =====================================
          ACTIONS
      ===================================== */}

      <div className="sticky bottom-3 z-20 rounded-3xl border border-white/10 bg-[#080808]/95 p-3 shadow-2xl backdrop-blur-xl">

        <div className="flex flex-col gap-3">

          {editingProduct && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.03] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel Editing
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-[#d4af37] px-5 py-3.5 text-sm font-bold text-black shadow-lg shadow-[#d4af37]/10 transition hover:bg-[#e3c15a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Saving Product...
              </span>
            ) : editingProduct ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>

        </div>

      </div>
    </form>
  );
}

/* ============================================
   SECTION HEADING
============================================ */

function SectionHeading({
  number,
  title,
  description,
}) {
  return (
    <div className="mb-6">

      <div className="flex items-center gap-3">

        <span className="text-[9px] font-bold tracking-[0.3em] text-[#d4af37]">
          {number}
        </span>

        <span className="h-px flex-1 bg-white/5" />

      </div>

      <h2 className="mt-3 text-lg font-bold text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      )}

    </div>
  );
}

/* ============================================
   FIELD
============================================ */

function Field({
  label,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-medium text-zinc-400">
        {label}
      </label>

      {children}

    </div>
  );
}

/* ============================================
   SUB HEADING
============================================ */

function SubHeading({ title }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
      {title}
    </h3>
  );
}

/* ============================================
   TOGGLE
============================================ */

function Toggle({
  name,
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        checked
          ? "border-[#d4af37]/25 bg-[#d4af37]/5"
          : "border-white/10 bg-white/[0.02] hover:border-white/15"
      }`}
    >

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#d4af37]"
      />

      <span className="min-w-0">

        <span className="block text-xs font-semibold text-zinc-200">
          {label}
        </span>

        <span className="mt-1 block text-[10px] leading-5 text-zinc-600">
          {description}
        </span>

      </span>

    </label>
  );
}

export default ProductForm;