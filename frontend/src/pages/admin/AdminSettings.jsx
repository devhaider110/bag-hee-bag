import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminStoreSettings,
  updateAdminStoreSettings,
} from "../../services/storeService";

/* =====================================================
   DEFAULT BUSINESS HOURS
===================================================== */

const DEFAULT_HOURS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((day) => ({
  day,
  open: "10:00",
  close: "21:00",
  closed: false,
}));

/* =====================================================
   DEFAULT FORM
===================================================== */

const DEFAULT_FORM = {
  storeName:
    "BAG HEE BAG",

  storeCode:
    "BHB",

  phone:
    "",

  whatsapp:
    "",

  email:
    "",

  gstin:
    "",

  addressLine1:
    "Kothari Milestone, Shop No. 2",

  addressLine2:
    "S.V. Road, Malad West",

  city:
    "Mumbai",

  state:
    "Maharashtra",

  pincode:
    "",

  country:
    "India",

  currency:
    "INR",

  defaultTaxRate:
    0,

  receiptFooter:
    "Thank you for shopping with BAG HEE BAG.",

  businessHours:
    DEFAULT_HOURS,

  socialLinks: {
    instagram:
      "",

    facebook:
      "",

    youtube:
      "",

    whatsapp:
      "",
  },

  seo: {
    title:
      "BAG HEE BAG | Luxury Bags & Handbags",

    description:
      "Shop luxury handbags, purses, travel bags, school bags and more from BAG HEE BAG.",

    keywords:
      "BAG HEE BAG, handbags, purses, ladies bags, luxury bags, Mumbai bags",

    canonicalUrl:
      "",

    robots:
      "index, follow",

    ogTitle:
      "BAG HEE BAG | Luxury • Style • Everyday",

    ogDescription:
      "Discover stylish handbags, purses, travel bags and everyday bags from BAG HEE BAG.",

    ogImage:
      "",

    twitterCard:
      "summary_large_image",

    googleSiteVerification:
      "",

    bingSiteVerification:
      "",

    schemaType:
      "Store",
  },

  system: {
    maintenanceMode:
      false,

    maintenanceMessage:
      "BAG HEE BAG is temporarily unavailable. We will be back shortly.",

    allowGuestCheckout:
      false,

    enableReviews:
      true,

    lowStockThreshold:
      5,

    defaultShippingCharge:
      0,

    freeShippingThreshold:
      0,

    orderPrefix:
      "BHB",

    invoicePrefix:
      "BHB-INV",

    timezone:
      "Asia/Kolkata",

    dateFormat:
      "DD MMM YYYY",
  },

  logoUrl:
    "",

  faviconUrl:
    "",

  themeColor:
    "#d4af37",

  googleMapsUrl:
    "",

  isActive:
    true,
};

/* =====================================================
   NAVIGATION
===================================================== */

const navigate = (
  path
) => {
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
   MERGE API DATA
===================================================== */

const mergeForm = (
  store
) => ({
  ...DEFAULT_FORM,

  ...store,

  businessHours:
    Array.isArray(
      store?.businessHours
    ) &&
    store.businessHours.length
      ? store.businessHours
      : DEFAULT_HOURS,

  socialLinks: {
    ...DEFAULT_FORM.socialLinks,
    ...(store?.socialLinks ||
      {}),
  },

  seo: {
    ...DEFAULT_FORM.seo,
    ...(store?.seo || {}),
  },

  system: {
    ...DEFAULT_FORM.system,
    ...(store?.system ||
      {}),
  },
});

/* =====================================================
   INPUT
===================================================== */

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
      {label}
    </span>

    <input
      type={type}
      value={
        value ?? ""
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      placeholder={
        placeholder
      }
      className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/30"
    />
  </label>
);

/* =====================================================
   TEXTAREA
===================================================== */

const Textarea = ({
  label,
  value,
  onChange,
  rows = 4,
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
      {label}
    </span>

    <textarea
      rows={rows}
      value={
        value ?? ""
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/30"
    />
  </label>
);

/* =====================================================
   TOGGLE
===================================================== */

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
    <span>
      <span className="block text-sm font-medium text-white">
        {label}
      </span>

      {description && (
        <span className="mt-1 block text-xs leading-5 text-white/40">
          {description}
        </span>
      )}
    </span>

    <input
      type="checkbox"
      checked={Boolean(
        checked
      )}
      onChange={(
        event
      ) =>
        onChange(
          event.target.checked
        )
      }
      className="h-5 w-5 accent-[#d4af37]"
    />
  </label>
);

/* =====================================================
   SECTION
===================================================== */

const Section = ({
  eyebrow,
  title,
  description,
  children,
}) => (
  <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/10 sm:p-7">
    <div className="mb-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
          {description}
        </p>
      )}
    </div>

    {children}
  </section>
);

/* =====================================================
   COMPONENT
===================================================== */

const AdminSettings = () => {
  const [
    form,
    setForm,
  ] = useState(
    DEFAULT_FORM
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* ===================================================
     LOAD
  =================================================== */

  const loadSettings =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminStoreSettings();

        setForm(
          mergeForm(
            data?.store ||
              data
          )
        );
      } catch (err) {
        console.error(
          "Admin settings load error:",
          err
        );

        setError(
          err?.response
            ?.data?.message ||
            err?.message ||
            "Unable to load system settings."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadSettings();
  }, []);

  /* ===================================================
     SIMPLE FIELD
  =================================================== */

  const updateField = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );
  };

  /* ===================================================
     NESTED FIELD
  =================================================== */

  const updateNested = (
    section,
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,

        [section]: {
          ...current[
            section
          ],

          [field]:
            value,
        },
      })
    );
  };

  /* ===================================================
     BUSINESS HOUR
  =================================================== */

  const updateBusinessHour = (
    index,
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,

        businessHours:
          current.businessHours.map(
            (
              hour,
              hourIndex
            ) =>
              hourIndex ===
              index
                ? {
                    ...hour,
                    [field]:
                      value,
                  }
                : hour
          ),
      })
    );
  };

  /* ===================================================
     SAVE
  =================================================== */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
          ...form,

          defaultTaxRate:
            Number(
              form.defaultTaxRate ||
                0
            ),

          system: {
            ...form.system,

            lowStockThreshold:
              Number(
                form.system
                  .lowStockThreshold ||
                  0
              ),

            defaultShippingCharge:
              Number(
                form.system
                  .defaultShippingCharge ||
                  0
              ),

            freeShippingThreshold:
              Number(
                form.system
                  .freeShippingThreshold ||
                  0
              ),
          },
        };

        const data =
          await updateAdminStoreSettings(
            payload
          );

        setForm(
          mergeForm(
            data?.store ||
              data
          )
        );

        setSuccess(
          "System settings and SEO updated successfully."
        );
      } catch (err) {
        console.error(
          "Admin settings save error:",
          err
        );

        setError(
          err?.response
            ?.data?.message ||
            err?.message ||
            "Unable to save system settings."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ===================================================
     SEO PREVIEW
  =================================================== */

  const seoPreviewTitle =
    useMemo(
      () =>
        form.seo.title ||
        form.storeName,

      [
        form.seo.title,
        form.storeName,
      ]
    );

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 w-72 rounded bg-white/10" />

          <div className="mt-3 h-4 w-[28rem] max-w-full rounded bg-white/5" />

          <div className="mt-8 h-96 rounded-3xl bg-white/5" />
        </div>
      </div>
    );
  }

  /* ===================================================
     UI
  =================================================== */

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              System Settings & SEO
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
              Manage BAG HEE BAG business
              identity, store defaults, SEO
              metadata, branding, social links
              and system behaviour from one
              place.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
          >
            ← Back to Admin
          </button>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          {/* =================================================
              STORE IDENTITY
          ================================================= */}

          <Section
            eyebrow="01 • Store Identity"
            title="Business & Contact"
            description="Basic business information used across the storefront, receipts and customer communication."
          >
            <div className="grid gap-5 md:grid-cols-2">

              <Input
                label="Store Name"
                value={
                  form.storeName
                }
                onChange={(v) =>
                  updateField(
                    "storeName",
                    v
                  )
                }
              />

              <Input
                label="Store Code"
                value={
                  form.storeCode
                }
                onChange={(v) =>
                  updateField(
                    "storeCode",
                    v.toUpperCase()
                  )
                }
              />

              <Input
                label="Phone"
                value={
                  form.phone
                }
                onChange={(v) =>
                  updateField(
                    "phone",
                    v
                  )
                }
              />

              <Input
                label="WhatsApp"
                value={
                  form.whatsapp
                }
                onChange={(v) =>
                  updateField(
                    "whatsapp",
                    v
                  )
                }
              />

              <Input
                label="Email"
                type="email"
                value={
                  form.email
                }
                onChange={(v) =>
                  updateField(
                    "email",
                    v
                  )
                }
              />

              <Input
                label="GSTIN"
                value={
                  form.gstin
                }
                onChange={(v) =>
                  updateField(
                    "gstin",
                    v.toUpperCase()
                  )
                }
              />

              <Input
                label="Address Line 1"
                value={
                  form.addressLine1
                }
                onChange={(v) =>
                  updateField(
                    "addressLine1",
                    v
                  )
                }
              />

              <Input
                label="Address Line 2"
                value={
                  form.addressLine2
                }
                onChange={(v) =>
                  updateField(
                    "addressLine2",
                    v
                  )
                }
              />

              <Input
                label="City"
                value={
                  form.city
                }
                onChange={(v) =>
                  updateField(
                    "city",
                    v
                  )
                }
              />

              <Input
                label="State"
                value={
                  form.state
                }
                onChange={(v) =>
                  updateField(
                    "state",
                    v
                  )
                }
              />

              <Input
                label="Pincode"
                value={
                  form.pincode
                }
                onChange={(v) =>
                  updateField(
                    "pincode",
                    v
                  )
                }
              />

              <Input
                label="Country"
                value={
                  form.country
                }
                onChange={(v) =>
                  updateField(
                    "country",
                    v
                  )
                }
              />

              <Input
                label="Currency"
                value={
                  form.currency
                }
                onChange={(v) =>
                  updateField(
                    "currency",
                    v.toUpperCase()
                  )
                }
              />

              <Input
                label="Google Maps URL"
                value={
                  form.googleMapsUrl
                }
                onChange={(v) =>
                  updateField(
                    "googleMapsUrl",
                    v
                  )
                }
              />
            </div>
          </Section>

          {/* =================================================
              BRANDING
          ================================================= */}

          <Section
            eyebrow="02 • Branding"
            title="Logo, Favicon & Theme"
            description="Use absolute URLs when assets are hosted on Cloudinary or another CDN."
          >
            <div className="grid gap-5 md:grid-cols-2">

              <Input
                label="Logo URL"
                value={
                  form.logoUrl
                }
                onChange={(v) =>
                  updateField(
                    "logoUrl",
                    v
                  )
                }
              />

              <Input
                label="Favicon URL"
                value={
                  form.faviconUrl
                }
                onChange={(v) =>
                  updateField(
                    "faviconUrl",
                    v
                  )
                }
              />

              <Input
                label="Theme Color"
                value={
                  form.themeColor
                }
                onChange={(v) =>
                  updateField(
                    "themeColor",
                    v
                  )
                }
                placeholder="#d4af37"
              />

              <Input
                label="Receipt Footer"
                value={
                  form.receiptFooter
                }
                onChange={(v) =>
                  updateField(
                    "receiptFooter",
                    v
                  )
                }
              />
            </div>
          </Section>

          {/* =================================================
              SEO
          ================================================= */}

          <Section
            eyebrow="03 • SEO"
            title="Search Engine & Social Metadata"
            description="Controls document title, meta description, keywords, canonical URL, Open Graph and Twitter metadata."
          >
            <div className="grid gap-5 md:grid-cols-2">

              <div className="md:col-span-2">
                <Input
                  label="SEO Title"
                  value={
                    form.seo.title
                  }
                  onChange={(v) =>
                    updateNested(
                      "seo",
                      "title",
                      v
                    )
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Meta Description"
                  value={
                    form.seo
                      .description
                  }
                  onChange={(v) =>
                    updateNested(
                      "seo",
                      "description",
                      v
                    )
                  }
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Keywords"
                  value={
                    form.seo
                      .keywords
                  }
                  onChange={(v) =>
                    updateNested(
                      "seo",
                      "keywords",
                      v
                    )
                  }
                />
              </div>

              <Input
                label="Canonical URL"
                value={
                  form.seo
                    .canonicalUrl
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "canonicalUrl",
                    v
                  )
                }
              />

              <Input
                label="Robots"
                value={
                  form.seo.robots
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "robots",
                    v
                  )
                }
              />

              <Input
                label="Open Graph Title"
                value={
                  form.seo
                    .ogTitle
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "ogTitle",
                    v
                  )
                }
              />

              <Input
                label="Open Graph Image URL"
                value={
                  form.seo
                    .ogImage
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "ogImage",
                    v
                  )
                }
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Open Graph Description"
                  value={
                    form.seo
                      .ogDescription
                  }
                  onChange={(v) =>
                    updateNested(
                      "seo",
                      "ogDescription",
                      v
                    )
                  }
                  rows={3}
                />
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
                  Twitter Card
                </span>

                <select
                  value={
                    form.seo
                      .twitterCard
                  }
                  onChange={(
                    event
                  ) =>
                    updateNested(
                      "seo",
                      "twitterCard",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
                >
                  <option value="summary_large_image">
                    Summary Large Image
                  </option>

                  <option value="summary">
                    Summary
                  </option>
                </select>
              </label>

              <Input
                label="Schema Type"
                value={
                  form.seo
                    .schemaType
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "schemaType",
                    v
                  )
                }
              />

              <Input
                label="Google Site Verification"
                value={
                  form.seo
                    .googleSiteVerification
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "googleSiteVerification",
                    v
                  )
                }
              />

              <Input
                label="Bing Site Verification"
                value={
                  form.seo
                    .bingSiteVerification
                }
                onChange={(v) =>
                  updateNested(
                    "seo",
                    "bingSiteVerification",
                    v
                  )
                }
              />
            </div>

            {/* SEO PREVIEW */}

            <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
                Google-style preview
              </p>

              <p className="mt-3 text-lg font-medium text-[#8ab4f8]">
                {
                  seoPreviewTitle
                }
              </p>

              <p className="mt-1 text-xs text-emerald-300">
                {form.seo
                  .canonicalUrl ||
                  "https://your-domain.com"}
              </p>

              <p className="mt-2 text-sm leading-6 text-white/55">
                {
                  form.seo
                    .description
                }
              </p>
            </div>
          </Section>

          {/* =================================================
              SOCIAL
          ================================================= */}

          <Section
            eyebrow="04 • Social"
            title="Social & WhatsApp Links"
            description="Public links available to the storefront and future content modules."
          >
            <div className="grid gap-5 md:grid-cols-2">

              <Input
                label="Instagram"
                value={
                  form.socialLinks
                    .instagram
                }
                onChange={(v) =>
                  updateNested(
                    "socialLinks",
                    "instagram",
                    v
                  )
                }
              />

              <Input
                label="Facebook"
                value={
                  form.socialLinks
                    .facebook
                }
                onChange={(v) =>
                  updateNested(
                    "socialLinks",
                    "facebook",
                    v
                  )
                }
              />

              <Input
                label="YouTube"
                value={
                  form.socialLinks
                    .youtube
                }
                onChange={(v) =>
                  updateNested(
                    "socialLinks",
                    "youtube",
                    v
                  )
                }
              />

              <Input
                label="WhatsApp Link"
                value={
                  form.socialLinks
                    .whatsapp
                }
                onChange={(v) =>
                  updateNested(
                    "socialLinks",
                    "whatsapp",
                    v
                  )
                }
              />
            </div>
          </Section>

          {/* =================================================
              SYSTEM
          ================================================= */}

          <Section
            eyebrow="05 • Business Rules"
            title="Tax, Shipping & System Defaults"
            description="Central defaults for modules that consume store-level settings."
          >
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              <Input
                label="Default Tax Rate %"
                type="number"
                value={
                  form.defaultTaxRate
                }
                onChange={(v) =>
                  updateField(
                    "defaultTaxRate",
                    v
                  )
                }
              />

              <Input
                label="Low Stock Threshold"
                type="number"
                value={
                  form.system
                    .lowStockThreshold
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "lowStockThreshold",
                    v
                  )
                }
              />

              <Input
                label="Default Shipping Charge"
                type="number"
                value={
                  form.system
                    .defaultShippingCharge
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "defaultShippingCharge",
                    v
                  )
                }
              />

              <Input
                label="Free Shipping Threshold"
                type="number"
                value={
                  form.system
                    .freeShippingThreshold
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "freeShippingThreshold",
                    v
                  )
                }
              />

              <Input
                label="Order Prefix"
                value={
                  form.system
                    .orderPrefix
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "orderPrefix",
                    v.toUpperCase()
                  )
                }
              />

              <Input
                label="Invoice Prefix"
                value={
                  form.system
                    .invoicePrefix
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "invoicePrefix",
                    v.toUpperCase()
                  )
                }
              />

              <Input
                label="Timezone"
                value={
                  form.system
                    .timezone
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "timezone",
                    v
                  )
                }
              />

              <Input
                label="Date Format"
                value={
                  form.system
                    .dateFormat
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "dateFormat",
                    v
                  )
                }
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">

              <Toggle
                label="Enable Product Reviews"
                description="Keeps the review system active by default."
                checked={
                  form.system
                    .enableReviews
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "enableReviews",
                    v
                  )
                }
              />

              <Toggle
                label="Allow Guest Checkout"
                description="Store-level flag for checkout integrations that support guest orders."
                checked={
                  form.system
                    .allowGuestCheckout
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "allowGuestCheckout",
                    v
                  )
                }
              />
            </div>
          </Section>

          {/* =================================================
              BUSINESS HOURS
          ================================================= */}

          <Section
            eyebrow="06 • Business Hours"
            title="Store Opening Hours"
            description="These hours are exposed by the public store information endpoint."
          >
            <div className="space-y-3">

              {form.businessHours.map(
                (
                  hour,
                  index
                ) => (
                  <div
                    key={
                      hour.day
                    }
                    className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center"
                  >
                    <p className="text-sm font-medium">
                      {
                        hour.day
                      }
                    </p>

                    <Input
                      label="Open"
                      type="time"
                      value={
                        hour.open
                      }
                      onChange={(
                        v
                      ) =>
                        updateBusinessHour(
                          index,
                          "open",
                          v
                        )
                      }
                    />

                    <Input
                      label="Close"
                      type="time"
                      value={
                        hour.close
                      }
                      onChange={(
                        v
                      ) =>
                        updateBusinessHour(
                          index,
                          "close",
                          v
                        )
                      }
                    />

                    <label className="flex items-center gap-2 text-sm text-white/60 sm:justify-end">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          hour.closed
                        )}
                        onChange={(
                          event
                        ) =>
                          updateBusinessHour(
                            index,
                            "closed",
                            event
                              .target
                              .checked
                          )
                        }
                        className="h-4 w-4 accent-[#d4af37]"
                      />

                      Closed
                    </label>
                  </div>
                )
              )}
            </div>
          </Section>

          {/* =================================================
              MAINTENANCE
          ================================================= */}

          <Section
            eyebrow="07 • Maintenance"
            title="Maintenance Mode"
            description="The public storefront is hidden while maintenance mode is active. Login/register and admin routes remain available."
          >
            <Toggle
              label="Enable Maintenance Mode"
              description="Temporarily hide the public storefront without taking the API offline."
              checked={
                form.system
                  .maintenanceMode
              }
              onChange={(v) =>
                updateNested(
                  "system",
                  "maintenanceMode",
                  v
                )
              }
            />

            <div className="mt-4">
              <Textarea
                label="Maintenance Message"
                value={
                  form.system
                    .maintenanceMessage
                }
                onChange={(v) =>
                  updateNested(
                    "system",
                    "maintenanceMessage",
                    v
                  )
                }
                rows={3}
              />
            </div>
          </Section>

          {/* =================================================
              SAVE BAR
          ================================================= */}

          <div className="sticky bottom-4 z-20 rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <p className="text-xs text-white/35">
                Save once after reviewing all
                sections. Settings are stored
                centrally in MongoDB.
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    loadSettings
                  }
                  disabled={
                    saving
                  }
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65 transition hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c85f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
