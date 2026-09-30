import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  uploadProductImage,
  deleteProductImage,
  setPrimaryProductImage,
  uploadProductVideo,
  deleteProductVideo,
} from "../services/productService";

/* =========================================================
   PRODUCT MEDIA
   Images + Videos only

   Variant management intentionally removed.
   Product details such as:
   Color, Size, Price, Discount Price, Stock, SKU
   are handled by ProductForm.jsx.
========================================================= */

function ProductMediaVariants({
  product,
  onUpdated,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  /* =======================================================
     IMAGE STATE
  ======================================================= */

  const [uploadType, setUploadType] =
    useState("other");

  const [altText, setAltText] =
    useState("");

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [deletingImage, setDeletingImage] =
    useState("");

  const [settingPrimaryImage, setSettingPrimaryImage] =
    useState("");

  /* =======================================================
     VIDEO STATE
  ======================================================= */

  const [videoTitle, setVideoTitle] =
    useState("");

  const [uploadingVideo, setUploadingVideo] =
    useState(false);

  const [deletingVideo, setDeletingVideo] =
    useState("");

  /* =======================================================
     PREVIEW
  ======================================================= */

  const [previewImage, setPreviewImage] =
    useState(null);

  const [previewVideo, setPreviewVideo] =
    useState(null);

  /* =======================================================
     MESSAGE
  ======================================================= */

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     PRODUCT CHANGE
  ======================================================= */

  useEffect(() => {
    setMessage("");
    setError("");
    setPreviewImage(null);
    setPreviewVideo(null);

    setUploadType("other");
    setAltText("");
    setVideoTitle("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }, [product?._id]);

  /* =======================================================
     HELPERS
  ======================================================= */

  const refreshProduct = (data) => {
    if (data) {
      onUpdated?.(data);
    }
  };

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload = async (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    clearMessages();

    for (const file of files) {
      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {
        setError(
          `"${file.name}" is not a valid image file.`
        );
        continue;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          `"${file.name}" is larger than 5 MB.`
        );
        continue;
      }

      try {
        setUploadingImage(true);

        const response =
          await uploadProductImage(
            product._id,
            file,
            {
              type: uploadType,
              alt:
                altText.trim() ||
                product.name ||
                "BAG HEE BAG product",
            }
          );

        refreshProduct(response?.data);

        setMessage(
          `${file.name} uploaded successfully.`
        );
      } catch (uploadError) {
        console.error(
          "Image upload error:",
          uploadError
        );

        setError(
          uploadError?.response?.data?.message ||
            uploadError?.message ||
            `Unable to upload ${file.name}.`
        );
      } finally {
        setUploadingImage(false);
      }
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  /* =======================================================
     DELETE IMAGE
  ======================================================= */

  const handleDeleteImage = async (
    imageId
  ) => {
    if (!imageId) {
      return;
    }

    clearMessages();

    try {
      setDeletingImage(imageId);

      const response =
        await deleteProductImage(
          product._id,
          imageId
        );

      refreshProduct(response?.data);

      setMessage(
        "Product image deleted successfully."
      );
    } catch (deleteError) {
      console.error(
        "Delete image error:",
        deleteError
      );

      setError(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Unable to delete product image."
      );
    } finally {
      setDeletingImage("");
    }
  };

  /* =======================================================
     SET PRIMARY IMAGE
  ======================================================= */

  const handleSetPrimaryImage = async (
    imageId
  ) => {
    if (!imageId) {
      return;
    }

    clearMessages();

    try {
      setSettingPrimaryImage(imageId);

      const response =
        await setPrimaryProductImage(
          product._id,
          imageId
        );

      refreshProduct(response?.data);

      setMessage(
        "Primary product image changed successfully."
      );
    } catch (primaryError) {
      console.error(
        "Set primary image error:",
        primaryError
      );

      setError(
        primaryError?.response?.data?.message ||
          primaryError?.message ||
          "Unable to change primary image."
      );
    } finally {
      setSettingPrimaryImage("");
    }
  };

  /* =======================================================
     VIDEO UPLOAD
  ======================================================= */

  const handleVideoUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    clearMessages();

    if (
      !file.type ||
      !file.type.startsWith("video/")
    ) {
      setError(
        "Please select a valid video file."
      );

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }

      return;
    }

    /* 50 MB limit */

    if (
      file.size >
      50 * 1024 * 1024
    ) {
      setError(
        "Product video must be 50 MB or smaller."
      );

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }

      return;
    }

    try {
      setUploadingVideo(true);

      const response =
        await uploadProductVideo(
          product._id,
          file,
          videoTitle.trim()
        );

      refreshProduct(response?.data);

      setVideoTitle("");

      setMessage(
        "Product video uploaded successfully."
      );
    } catch (uploadError) {
      console.error(
        "Video upload error:",
        uploadError
      );

      setError(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          "Unable to upload product video."
      );
    } finally {
      setUploadingVideo(false);

      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  /* =======================================================
     DELETE VIDEO
  ======================================================= */

  const handleDeleteVideo = async (
    videoId
  ) => {
    if (!videoId) {
      return;
    }

    clearMessages();

    try {
      setDeletingVideo(videoId);

      const response =
        await deleteProductVideo(
          product._id,
          videoId
        );

      refreshProduct(response?.data);

      setMessage(
        "Product video deleted successfully."
      );
    } catch (deleteError) {
      console.error(
        "Delete video error:",
        deleteError
      );

      setError(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Unable to delete product video."
      );
    } finally {
      setDeletingVideo("");
    }
  };

  /* =======================================================
     DATA
  ======================================================= */

  const images =
    Array.isArray(product?.images)
      ? product.images
      : [];

  const videos =
    Array.isArray(product?.videos)
      ? product.videos
      : [];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#d4af37]">
            PRODUCT MEDIA
          </span>

          <span className="h-px flex-1 bg-white/5" />
        </div>

        <h2 className="mt-3 text-xl font-bold text-white">
          Images & Videos
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          Manage product gallery images and
          promotional videos.
        </p>
      </div>

      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs leading-5 text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-400">
          {error}
        </div>
      )}

      {/* ===================================================
          IMAGES
      =================================================== */}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-xl">

        <div className="border-b border-white/10 p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">
                  Product Images
                </h3>

                <CountBadge count={images.length} />
              </div>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Upload multiple product images and
                choose the primary image.
              </p>
            </div>

            <div className="text-[10px] text-zinc-600">
              Maximum 5 MB per image
            </div>

          </div>

          {/* IMAGE UPLOAD CONTROLS */}

          <div className="mt-6 grid gap-4 lg:grid-cols-[180px_1fr_auto]">

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                Image Type
              </label>

              <select
                value={uploadType}
                onChange={(event) =>
                  setUploadType(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/50"
              >
                <option value="front">
                  Front
                </option>

                <option value="back">
                  Back
                </option>

                <option value="side">
                  Side
                </option>

                <option value="inside">
                  Inside
                </option>

                <option value="handle">
                  Handle
                </option>

                <option value="lifestyle">
                  Lifestyle
                </option>

                <option value="feature">
                  Feature
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                Alt Text
              </label>

              <input
                type="text"
                value={altText}
                onChange={(event) =>
                  setAltText(
                    event.target.value
                  )
                }
                maxLength={150}
                placeholder="Classic Ladies Handbag"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/50"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  imageInputRef.current?.click()
                }
                disabled={uploadingImage}
                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e3c15a] disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              >
                {uploadingImage
                  ? "Uploading..."
                  : "Upload Images"}
              </button>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

          </div>
        </div>

        {/* IMAGE GRID */}

        <div className="p-5 sm:p-6">

          {images.length === 0 ? (
            <EmptyMedia
              icon="▧"
              title="No product images"
              description="Upload product images to create the gallery."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {images.map(
                (image) => (
                  <ImageCard
                    key={
                      image._id ||
                      image.publicId ||
                      image.url
                    }
                    image={image}
                    onPreview={() =>
                      setPreviewImage(image)
                    }
                    onDelete={() =>
                      handleDeleteImage(
                        image._id
                      )
                    }
                    onSetPrimary={() =>
                      handleSetPrimaryImage(
                        image._id
                      )
                    }
                    deleting={
                      deletingImage ===
                      image._id
                    }
                    settingPrimary={
                      settingPrimaryImage ===
                      image._id
                    }
                  />
                )
              )}

            </div>
          )}

        </div>
      </section>

      {/* ===================================================
          VIDEOS
      =================================================== */}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-xl">

        <div className="border-b border-white/10 p-5 sm:p-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">
                  Product Videos
                </h3>

                <CountBadge count={videos.length} />
              </div>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Add product demo, showcase or
                promotional videos.
              </p>
            </div>

            <div className="text-[10px] text-zinc-600">
              Maximum 50 MB per video
            </div>

          </div>

          {/* VIDEO UPLOAD */}

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                Video Title
              </label>

              <input
                type="text"
                value={videoTitle}
                onChange={(event) =>
                  setVideoTitle(
                    event.target.value
                  )
                }
                maxLength={150}
                placeholder="Classic Ladies Handbag Showcase"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#d4af37]/50"
              />
            </div>

            <div className="flex items-end">

              <button
                type="button"
                onClick={() =>
                  videoInputRef.current?.click()
                }
                disabled={uploadingVideo}
                className="w-full rounded-2xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e3c15a] disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              >
                {uploadingVideo
                  ? "Uploading..."
                  : "Upload Video"}
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />

            </div>

          </div>
        </div>

        {/* VIDEO GRID */}

        <div className="p-5 sm:p-6">

          {videos.length === 0 ? (
            <EmptyMedia
              icon="▶"
              title="No product videos"
              description="Upload a product video to showcase it to customers."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {videos.map(
                (video) => (
                  <VideoCard
                    key={
                      video._id ||
                      video.publicId ||
                      video.url
                    }
                    video={video}
                    onPreview={() =>
                      setPreviewVideo(video)
                    }
                    onDelete={() =>
                      handleDeleteVideo(
                        video._id
                      )
                    }
                    deleting={
                      deletingVideo ===
                      video._id
                    }
                  />
                )
              )}

            </div>
          )}

        </div>
      </section>

      {/* ===================================================
          IMAGE PREVIEW
      =================================================== */}

      {previewImage && (
        <ImagePreview
          image={previewImage}
          onClose={() =>
            setPreviewImage(null)
          }
        />
      )}

      {/* ===================================================
          VIDEO PREVIEW
      =================================================== */}

      {previewVideo && (
        <VideoPreview
          video={previewVideo}
          onClose={() =>
            setPreviewVideo(null)
          }
        />
      )}

    </section>
  );
}

/* =========================================================
   IMAGE CARD
========================================================= */

function ImageCard({
  image,
  onPreview,
  onDelete,
  onSetPrimary,
  deleting,
  settingPrimary,
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30">

      <div
        className="relative aspect-square cursor-pointer overflow-hidden bg-black"
        onClick={onPreview}
      >
        <img
          src={image.url}
          alt={
            image.alt ||
            "Product image"
          }
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

        {image.isPrimary && (
          <div className="absolute left-3 top-3 rounded-full border border-[#d4af37]/30 bg-black/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#d4af37] backdrop-blur">
            Primary
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1.5 text-[9px] text-zinc-300 backdrop-blur">
          {formatImageType(
            image.type
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">

        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-200">
            {image.alt ||
              "Product image"}
          </p>

          <p className="mt-1 text-[9px] text-zinc-600">
            {formatImageType(
              image.type
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">

          {!image.isPrimary && (
            <button
              type="button"
              onClick={onSetPrimary}
              disabled={settingPrimary}
              className="rounded-xl border border-[#d4af37]/20 px-3 py-2 text-[10px] font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {settingPrimary
                ? "Setting..."
                : "Set Primary"}
            </button>
          )}

          {image.isPrimary && (
            <div className="flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] text-zinc-600">
              Primary Image
            </div>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-xl border border-red-500/20 px-3 py-2 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   VIDEO CARD
========================================================= */

function VideoCard({
  video,
  onPreview,
  onDelete,
  deleting,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">

      <div
        className="relative aspect-video cursor-pointer overflow-hidden bg-black"
        onClick={onPreview}
      >

        <video
          src={video.url}
          poster={video.thumbnailUrl || undefined}
          preload="metadata"
          muted
          playsInline
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/35">

          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-lg text-white backdrop-blur">
            ▶
          </span>

        </div>

      </div>

      <div className="space-y-4 p-4">

        <div>

          <p className="truncate text-sm font-semibold text-zinc-200">
            {video.title ||
              "Product Video"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">

            {video.format && (
              <MiniBadge>
                {String(
                  video.format
                ).toUpperCase()}
              </MiniBadge>
            )}

            {video.duration && (
              <MiniBadge>
                {formatDuration(
                  video.duration
                )}
              </MiniBadge>
            )}

            {video.bytes && (
              <MiniBadge>
                {formatFileSize(
                  video.bytes
                )}
              </MiniBadge>
            )}

          </div>

        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="w-full rounded-xl border border-red-500/20 px-3 py-2.5 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting
            ? "Deleting Video..."
            : "Delete Video"}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   IMAGE PREVIEW
========================================================= */

function ImagePreview({
  image,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >

      <div
        className="relative max-h-[90vh] max-w-5xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white"
        >
          ×
        </button>

        <img
          src={image.url}
          alt={
            image.alt ||
            "Product image"
          }
          className="max-h-[90vh] max-w-full rounded-2xl object-contain"
        />

      </div>
    </div>
  );
}

/* =========================================================
   VIDEO PREVIEW
========================================================= */

function VideoPreview({
  video,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >

      <div
        className="relative w-full max-w-5xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white"
        >
          ×
        </button>

        <video
          src={video.url}
          poster={
            video.thumbnailUrl ||
            undefined
          }
          controls
          autoPlay
          playsInline
          className="max-h-[85vh] w-full rounded-2xl bg-black"
        />

      </div>
    </div>
  );
}

/* =========================================================
   EMPTY MEDIA
========================================================= */

function EmptyMedia({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-lg text-zinc-600">
        {icon}
      </div>

      <h4 className="mt-4 text-sm font-semibold text-zinc-300">
        {title}
      </h4>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-zinc-600">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   COUNT BADGE
========================================================= */

function CountBadge({
  count,
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-semibold text-zinc-500">
      {count}
    </span>
  );
}

/* =========================================================
   MINI BADGE
========================================================= */

function MiniBadge({
  children,
}) {
  return (
    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[8px] font-medium uppercase tracking-[0.08em] text-zinc-500">
      {children}
    </span>
  );
}

/* =========================================================
   IMAGE TYPE FORMATTER
========================================================= */

function formatImageType(
  type
) {
  if (!type) {
    return "Other";
  }

  return type
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(
  bytes
) {
  if (!bytes) {
    return "0 KB";
  }

  const mb =
    bytes /
    (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  const kb =
    bytes / 1024;

  return `${kb.toFixed(0)} KB`;
}

/* =========================================================
   VIDEO DURATION
========================================================= */

function formatDuration(
  seconds
) {
  const totalSeconds =
    Math.floor(
      Number(seconds) || 0
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default ProductMediaVariants;