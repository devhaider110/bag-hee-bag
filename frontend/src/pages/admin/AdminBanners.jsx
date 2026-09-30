import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createBanner,
  deleteBanner,
  getAdminBanners,
  toggleBannerStatus,
  updateBanner,
  uploadBannerImage,
} from "../../services/bannerService";

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
    new PopStateEvent("popstate")
  );
};

/* =====================================================
   EMPTY FORM
===================================================== */

const createEmptyForm = () => ({
  title: "",
  subtitle: "",
  description: "",
  badge: "",

  desktopImage: {
    url: "",
    alt: "",
    publicId: "",
  },

  mobileImage: {
    url: "",
    alt: "",
    publicId: "",
  },

  buttonText: "Shop Now",
  buttonLink: "/shop",

  linkType: "shop",

  startAt: "",
  endAt: "",

  isActive: true,

  priority: 0,
  sortOrder: 0,

  overlayOpacity: 0.45,

  textPosition: "left",

  theme: "luxury",
});

/* =====================================================
   DATE HELPERS
===================================================== */

const formatDateTimeLocal = (
  value
) => {
  if (!value) return "";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(
      2,
      "0"
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
};

const toApiDate = (
  value
) => {
  if (!value) return null;

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
};

/* =====================================================
   FILE VALIDATION
===================================================== */

const validateImageFile = (
  file
) => {
  if (!file) {
    throw new Error(
      "Please select an image."
    );
  }

  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {
    throw new Error(
      "Please select a valid image file."
    );
  }

  const MAX_SIZE =
    5 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    throw new Error(
      "Image size must be 5 MB or less."
    );
  }
};

/* =====================================================
   COMPONENT
===================================================== */

const AdminBanners = () => {
  const [banners, setBanners] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [form, setForm] =
    useState(
      createEmptyForm()
    );

  /* ===================================================
     FILE INPUT REFS
  =================================================== */

  const desktopFileInputRef =
    useRef(null);

  const mobileFileInputRef =
    useRef(null);

  /* ===================================================
     LOAD
  =================================================== */

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminBanners({
          search,
          status:
            statusFilter,
        });

      setBanners(
        Array.isArray(
          data?.banners
        )
          ? data.banners
          : []
      );
    } catch (err) {
      console.error(
        "Admin banners error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load banners."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [statusFilter]);

  /* ===================================================
     FORM HELPERS
  =================================================== */

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImageField = (
    imageType,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [imageType]: {
        ...current[imageType],
        [field]: value,
      },
    }));
  };

  /* ===================================================
     OPEN FILE PICKER
  =================================================== */

  const openDesktopFilePicker = () => {
    desktopFileInputRef.current?.click();
  };

  const openMobileFilePicker = () => {
    mobileFileInputRef.current?.click();
  };

  /* ===================================================
     UPLOAD IMAGE
  =================================================== */

  const handleImageSelection = async (
    event,
    imageType
  ) => {
    const file =
      event.target.files?.[0];

    /*
      Reset input so the same file can
      be selected again later.
    */
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      validateImageFile(file);

      setUploadingImage(
        imageType
      );

      const fieldName =
        imageType ===
        "desktopImage"
          ? "desktopImage"
          : "mobileImage";

      const result =
        await uploadBannerImage(
          file,
          fieldName
        );

      /*
        Support several reasonable
        backend response structures.
      */
      const uploadedImage =
        result?.image ||
        result?.bannerImage ||
        result?.data?.image ||
        result?.data?.bannerImage ||
        result;

      const uploadedUrl =
        uploadedImage?.url ||
        uploadedImage?.secure_url ||
        result?.url ||
        result?.secure_url ||
        "";

      const publicId =
        uploadedImage?.publicId ||
        uploadedImage?.public_id ||
        result?.publicId ||
        result?.public_id ||
        "";

      if (!uploadedUrl) {
        throw new Error(
          "Image uploaded but no Cloudinary URL was returned."
        );
      }

      updateImageField(
        imageType,
        "url",
        uploadedUrl
      );

      updateImageField(
        imageType,
        "publicId",
        publicId
      );

      setSuccess(
        `${
          imageType ===
          "desktopImage"
            ? "Desktop"
            : "Mobile"
        } image selected successfully.`
      );
    } catch (err) {
      console.error(
        "Banner image upload error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to upload image."
      );
    } finally {
      setUploadingImage("");
    }
  };

  /* ===================================================
     REMOVE IMAGE
  =================================================== */

  const clearImage = (
    imageType
  ) => {
    updateImageField(
      imageType,
      "url",
      ""
    );

    updateImageField(
      imageType,
      "publicId",
      ""
    );

    updateImageField(
      imageType,
      "alt",
      ""
    );
  };

  /* ===================================================
     EDIT
  =================================================== */

  const handleEdit = (
    banner
  ) => {
    setEditingId(
      banner._id
    );

    setForm({
      title:
        banner.title || "",

      subtitle:
        banner.subtitle || "",

      description:
        banner.description || "",

      badge:
        banner.badge || "",

      desktopImage: {
        url:
          banner.desktopImage
            ?.url || "",

        alt:
          banner.desktopImage
            ?.alt || "",

        publicId:
          banner.desktopImage
            ?.publicId || "",
      },

      mobileImage: {
        url:
          banner.mobileImage
            ?.url || "",

        alt:
          banner.mobileImage
            ?.alt || "",

        publicId:
          banner.mobileImage
            ?.publicId || "",
      },

      buttonText:
        banner.buttonText ||
        "Shop Now",

      buttonLink:
        banner.buttonLink ||
        "/shop",

      linkType:
        banner.linkType ||
        "shop",

      startAt:
        formatDateTimeLocal(
          banner.startAt
        ),

      endAt:
        formatDateTimeLocal(
          banner.endAt
        ),

      isActive:
        banner.isActive !== false,

      priority:
        Number(
          banner.priority || 0
        ),

      sortOrder:
        Number(
          banner.sortOrder || 0
        ),

      overlayOpacity:
        Number(
          banner.overlayOpacity ??
            0.45
        ),

      textPosition:
        banner.textPosition ||
        "left",

      theme:
        banner.theme ||
        "luxury",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ===================================================
     RESET
  =================================================== */

  const resetForm = () => {
    setEditingId(null);

    setForm(
      createEmptyForm()
    );

    setError("");
    setSuccess("");

    setUploadingImage("");

    if (
      desktopFileInputRef.current
    ) {
      desktopFileInputRef.current.value =
        "";
    }

    if (
      mobileFileInputRef.current
    ) {
      mobileFileInputRef.current.value =
        "";
    }
  };

  /* ===================================================
     SAVE
  =================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (
        !form.title.trim()
      ) {
        throw new Error(
          "Banner title is required."
        );
      }

      if (
        !form.desktopImage.url.trim() &&
        !form.mobileImage.url.trim()
      ) {
        throw new Error(
          "Please select at least one banner image."
        );
      }

      if (
        form.startAt &&
        form.endAt &&
        new Date(form.startAt) >
          new Date(form.endAt)
      ) {
        throw new Error(
          "End date must be after start date."
        );
      }

      const payload = {
        ...form,

        startAt:
          toApiDate(
            form.startAt
          ),

        endAt:
          toApiDate(
            form.endAt
          ),

        priority:
          Number(
            form.priority || 0
          ),

        sortOrder:
          Number(
            form.sortOrder || 0
          ),

        overlayOpacity:
          Number(
            form.overlayOpacity
          ),
      };

      if (editingId) {
        await updateBanner(
          editingId,
          payload
        );

        setSuccess(
          "Banner updated successfully."
        );
      } else {
        await createBanner(
          payload
        );

        setSuccess(
          "Banner created successfully."
        );
      }

      setEditingId(null);

      setForm(
        createEmptyForm()
      );

      if (
        desktopFileInputRef.current
      ) {
        desktopFileInputRef.current.value =
          "";
      }

      if (
        mobileFileInputRef.current
      ) {
        mobileFileInputRef.current.value =
          "";
      }

      await loadBanners();
    } catch (err) {
      console.error(
        "Save banner error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save banner."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     TOGGLE
  =================================================== */

  const handleToggle = async (
    id
  ) => {
    try {
      setError("");
      setSuccess("");

      await toggleBannerStatus(
        id
      );

      setSuccess(
        "Banner status updated."
      );

      await loadBanners();
    } catch (err) {
      console.error(
        "Toggle banner error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update banner."
      );
    }
  };

  /* ===================================================
     DELETE
  =================================================== */

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this banner?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteBanner(id);

      setSuccess(
        "Banner deleted successfully."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadBanners();
    } catch (err) {
      console.error(
        "Delete banner error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete banner."
      );
    }
  };

  /* ===================================================
     PREVIEW
  =================================================== */

  const previewImage =
    form.desktopImage.url ||
    form.mobileImage.url;

  const filteredCount =
    useMemo(
      () => banners.length,
      [banners]
    );

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="mb-4 text-sm text-white/50 transition hover:text-[#d4af37]"
            >
              ← Back to Dashboard
            </button>

            
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Banner & Content Management
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Create premium promotional banners,
              schedule campaigns, control
              homepage content and manage
              desktop/mobile creatives.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Total Banners
            </p>

            <p className="mt-1 text-2xl font-bold text-[#d4af37]">
              {filteredCount}
            </p>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* FORM */}

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl sm:p-7">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                {editingId
                  ? "Edit Campaign"
                  : "Create Campaign"}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Banner Configuration
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* CONTENT */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Title *
                </label>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Luxury Bags, Timeless Style"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Badge
                </label>

                <input
                  value={form.badge}
                  onChange={(event) =>
                    updateField(
                      "badge",
                      event.target.value
                    )
                  }
                  placeholder="NEW COLLECTION"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Subtitle
              </label>

              <input
                value={form.subtitle}
                onChange={(event) =>
                  updateField(
                    "subtitle",
                    event.target.value
                  )
                }
                placeholder="Discover statement pieces crafted for every occasion."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Optional supporting content..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
              />
            </div>

            {/* =================================================
                IMAGES
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {/* DESKTOP IMAGE */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Desktop Image
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Recommended: wide 16:7 or 16:8 creative.
                    </p>
                  </div>

                  <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-3 py-1 text-[10px] uppercase tracking-wider text-[#d4af37]">
                    Device
                  </span>
                </div>

                {/* HIDDEN FILE INPUT */}

                <input
                  ref={
                    desktopFileInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageSelection(
                      event,
                      "desktopImage"
                    )
                  }
                  className="hidden"
                />

                {/* SELECT BUTTON */}

                <button
                  type="button"
                  onClick={
                    openDesktopFilePicker
                  }
                  disabled={
                    uploadingImage ===
                    "desktopImage"
                  }
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 px-4 py-4 text-sm font-semibold text-[#e5c866] transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-lg">
                    {uploadingImage ===
                    "desktopImage"
                      ? "⏳"
                      : "📁"}
                  </span>

                  <span>
                    {uploadingImage ===
                    "desktopImage"
                      ? "Uploading..."
                      : form.desktopImage
                          .url
                      ? "Change Desktop Image"
                      : "Select Desktop Image"}
                  </span>
                </button>

                {/* SELECTED IMAGE PREVIEW */}

                {form.desktopImage.url && (
                  <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                    <div className="aspect-[16/7]">
                      <img
                        src={
                          form.desktopImage
                            .url
                        }
                        alt={
                          form.desktopImage
                            .alt ||
                          "Desktop banner preview"
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 backdrop-blur">
                      ✓ Image Selected
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        clearImage(
                          "desktopImage"
                        )
                      }
                      className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-red-300 backdrop-blur transition hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* ALT */}

                <input
                  value={
                    form.desktopImage.alt
                  }
                  onChange={(event) =>
                    updateImageField(
                      "desktopImage",
                      "alt",
                      event.target.value
                    )
                  }
                  placeholder="Desktop image alt text"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs outline-none focus:border-[#d4af37]/60"
                />

                {/* MANUAL URL */}

                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-white/40 transition hover:text-white/70">
                    Or use image URL manually
                  </summary>

                  <input
                    value={
                      form.desktopImage.url
                    }
                    onChange={(event) =>
                      updateImageField(
                        "desktopImage",
                        "url",
                        event.target.value
                      )
                    }
                    placeholder="https://res.cloudinary.com/..."
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs outline-none focus:border-[#d4af37]/60"
                  />
                </details>
              </div>

              {/* MOBILE IMAGE */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Mobile Image
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Recommended: portrait 4:5 or 3:4 creative.
                    </p>
                  </div>

                  <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-3 py-1 text-[10px] uppercase tracking-wider text-[#d4af37]">
                    Device
                  </span>
                </div>

                {/* HIDDEN FILE INPUT */}

                <input
                  ref={
                    mobileFileInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageSelection(
                      event,
                      "mobileImage"
                    )
                  }
                  className="hidden"
                />

                {/* SELECT BUTTON */}

                <button
                  type="button"
                  onClick={
                    openMobileFilePicker
                  }
                  disabled={
                    uploadingImage ===
                    "mobileImage"
                  }
                  className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 px-4 py-4 text-sm font-semibold text-[#e5c866] transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-lg">
                    {uploadingImage ===
                    "mobileImage"
                      ? "⏳"
                      : "📁"}
                  </span>

                  <span>
                    {uploadingImage ===
                    "mobileImage"
                      ? "Uploading..."
                      : form.mobileImage
                          .url
                      ? "Change Mobile Image"
                      : "Select Mobile Image"}
                  </span>
                </button>

                {/* SELECTED IMAGE PREVIEW */}

                {form.mobileImage.url && (
                  <div className="relative mt-4 overflow-hidden rounded-xl border border-white/10 bg-black">
                    <div className="aspect-[4/5]">
                      <img
                        src={
                          form.mobileImage
                            .url
                        }
                        alt={
                          form.mobileImage
                            .alt ||
                          "Mobile banner preview"
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 backdrop-blur">
                      ✓ Image Selected
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        clearImage(
                          "mobileImage"
                        )
                      }
                      className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-red-300 backdrop-blur transition hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* ALT */}

                <input
                  value={
                    form.mobileImage.alt
                  }
                  onChange={(event) =>
                    updateImageField(
                      "mobileImage",
                      "alt",
                      event.target.value
                    )
                  }
                  placeholder="Mobile image alt text"
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs outline-none focus:border-[#d4af37]/60"
                />

                {/* MANUAL URL */}

                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-white/40 transition hover:text-white/70">
                    Or use image URL manually
                  </summary>

                  <input
                    value={
                      form.mobileImage.url
                    }
                    onChange={(event) =>
                      updateImageField(
                        "mobileImage",
                        "url",
                        event.target.value
                      )
                    }
                    placeholder="https://res.cloudinary.com/..."
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs outline-none focus:border-[#d4af37]/60"
                  />
                </details>
              </div>
            </div>

            {/* CTA */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Button Text
                </label>

                <input
                  value={
                    form.buttonText
                  }
                  onChange={(event) =>
                    updateField(
                      "buttonText",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Button Link
                </label>

                <input
                  value={
                    form.buttonLink
                  }
                  onChange={(event) =>
                    updateField(
                      "buttonLink",
                      event.target.value
                    )
                  }
                  placeholder="/shop or /bags/ladies-bags"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                />
              </div>
            </div>

            {/* SETTINGS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Link Type
                </label>

                <select
                  value={form.linkType}
                  onChange={(event) =>
                    updateField(
                      "linkType",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                >
                  <option value="shop">
                    Shop
                  </option>

                  <option value="category">
                    Category
                  </option>

                  <option value="product">
                    Product
                  </option>

                  <option value="custom">
                    Custom
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Text Position
                </label>

                <select
                  value={
                    form.textPosition
                  }
                  onChange={(event) =>
                    updateField(
                      "textPosition",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                >
                  <option value="left">
                    Left
                  </option>

                  <option value="center">
                    Center
                  </option>

                  <option value="right">
                    Right
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Priority
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.priority
                  }
                  onChange={(event) =>
                    updateField(
                      "priority",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.sortOrder
                  }
                  onChange={(event) =>
                    updateField(
                      "sortOrder",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                />
              </div>
            </div>

            {/* DATES */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.startAt
                  }
                  onChange={(event) =>
                    updateField(
                      "startAt",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  End Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.endAt
                  }
                  onChange={(event) =>
                    updateField(
                      "endAt",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
                />
              </div>
            </div>

            {/* ADVANCED */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Overlay Opacity
                </label>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={
                    form.overlayOpacity
                  }
                  onChange={(event) =>
                    updateField(
                      "overlayOpacity",
                      event.target.value
                    )
                  }
                  className="mt-4 w-full accent-[#d4af37]"
                />

                <p className="mt-2 text-xs text-white/40">
                  {Math.round(
                    Number(
                      form.overlayOpacity
                    ) * 100
                  )}
                  %
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Theme
                </label>

                <select
                  value={form.theme}
                  onChange={(event) =>
                    updateField(
                      "theme",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                >
                  <option value="luxury">
                    Luxury
                  </option>

                  <option value="gold">
                    Gold
                  </option>

                  <option value="dark">
                    Dark
                  </option>

                  <option value="light">
                    Light
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 accent-[#d4af37]"
                />

                <span>
                  <span className="block text-sm font-semibold">
                    Active
                  </span>

                  <span className="block text-xs text-white/40">
                    Show when schedule allows
                  </span>
                </span>
              </label>
            </div>

            {/* PREVIEW */}

            {previewImage && (
              <div className="overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-black">
                <div className="border-b border-white/10 px-5 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                    Live Preview
                  </p>
                </div>

                <div className="relative min-h-[300px] overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Banner preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div
                    className="absolute inset-0 bg-black"
                    style={{
                      opacity:
                        Number(
                          form.overlayOpacity
                        ) || 0.45,
                    }}
                  />

                  <div className="relative z-10 flex min-h-[300px] items-center p-8">
                    <div className="max-w-xl">
                      {form.badge && (
                        <span className="inline-block rounded-full border border-[#d4af37]/40 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#e5c866]">
                          {form.badge}
                        </span>
                      )}

                      <h3 className="mt-4 text-3xl font-black">
                        {form.title ||
                          "Banner Title"}
                      </h3>

                      <p className="mt-3 text-white/70">
                        {form.subtitle ||
                          "Banner subtitle"}
                      </p>

                      {form.buttonText && (
                        <span className="mt-5 inline-flex rounded-full bg-[#d4af37] px-5 py-3 text-sm font-bold text-black">
                          {form.buttonText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT */}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  Boolean(
                    uploadingImage
                  )
                }
                className="rounded-xl bg-[#d4af37] px-7 py-3 text-sm font-bold text-black transition hover:bg-[#e7ca67] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : uploadingImage
                  ? "Uploading Image..."
                  : editingId
                  ? "Update Banner"
                  : "Create Banner"}
              </button>
            </div>
          </form>
        </section>

        {/* FILTERS */}

        <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 md:flex-row">
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
                loadBanners();
              }
            }}
            placeholder="Search banners..."
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
          >
            <option value="all">
              All Banners
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          <button
            type="button"
            onClick={loadBanners}
            className="rounded-xl border border-[#d4af37]/30 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/10"
          >
            Search
          </button>
        </section>

        {/* LIST */}

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-16 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#d4af37]" />

              <p className="mt-4 text-sm text-white/50">
                Loading banners...
              </p>
            </div>
          ) : banners.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-16 text-center">
              <p className="text-4xl">
                🖼️
              </p>

              <h3 className="mt-4 text-lg font-semibold">
                No banners found
              </h3>

              <p className="mt-2 text-sm text-white/40">
                Create your first BHB promotional banner above.
              </p>
            </div>
          ) : (
            banners.map(
              (banner) => (
                <article
                  key={banner._id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">

                    {/* IMAGE */}

                    <div className="relative min-h-[210px] bg-black">
                      {banner
                        .desktopImage
                        ?.url ? (
                        <img
                          src={
                            banner
                              .desktopImage
                              .url
                          }
                          alt={
                            banner
                              .desktopImage
                              .alt ||
                            banner.title
                          }
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[210px] items-center justify-center text-4xl">
                          🖼️
                        </div>
                      )}

                      <div className="absolute left-4 top-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                            banner.isActive
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-red-400/15 text-red-300"
                          }`}
                        >
                          {banner.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                        <div className="min-w-0">
                          {banner.badge && (
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                              {banner.badge}
                            </p>
                          )}

                          <h3 className="mt-2 text-xl font-bold">
                            {banner.title}
                          </h3>

                          {banner.subtitle && (
                            <p className="mt-2 text-sm text-white/60">
                              {banner.subtitle}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/40">
                            <span className="rounded-full border border-white/10 px-3 py-1.5">
                              Priority:{" "}
                              {banner.priority}
                            </span>

                            <span className="rounded-full border border-white/10 px-3 py-1.5">
                              Order:{" "}
                              {banner.sortOrder}
                            </span>

                            <span className="rounded-full border border-white/10 px-3 py-1.5">
                              {banner.linkType}
                            </span>

                            {banner.startAt && (
                              <span className="rounded-full border border-white/10 px-3 py-1.5">
                                Starts:{" "}
                                {new Date(
                                  banner.startAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                            {banner.endAt && (
                              <span className="rounded-full border border-white/10 px-3 py-1.5">
                                Ends:{" "}
                                {new Date(
                                  banner.endAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                banner
                              )
                            }
                            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-[#d4af37]/30 hover:text-[#d4af37]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                banner._id
                              )
                            }
                            className="rounded-xl border border-[#d4af37]/20 px-4 py-2.5 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/10"
                          >
                            {banner.isActive
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                banner._id
                              )
                            }
                            className="rounded-xl border border-red-400/20 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* MOBILE IMAGE */}

                      {banner.mobileImage
                        ?.url && (
                        <div className="mt-5 border-t border-white/10 pt-5">
                          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/30">
                            Mobile Creative
                          </p>

                          <div className="h-28 overflow-hidden rounded-xl bg-black sm:h-36">
                            <img
                              src={
                                banner
                                  .mobileImage
                                  .url
                              }
                              alt={
                                banner
                                  .mobileImage
                                  .alt ||
                                banner.title
                              }
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            )
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminBanners;