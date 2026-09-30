import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getActiveBanners,
} from "../services/bannerService";

/* =====================================================
   NAVIGATION
===================================================== */

const navigate = (path) => {
  if (!path) return;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    window.location.href = path;
    return;
  }

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
   IMAGE FALLBACK
===================================================== */

const getDesktopImage = (
  banner
) => {
  return (
    banner?.desktopImage?.url ||
    banner?.mobileImage?.url ||
    ""
  );
};

const getMobileImage = (
  banner
) => {
  return (
    banner?.mobileImage?.url ||
    banner?.desktopImage?.url ||
    ""
  );
};

/* =====================================================
   COMPONENT
===================================================== */

const HomeBanner = () => {
  const [banners, setBanners] =
    useState([]);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     LOAD
  =================================================== */

  useEffect(() => {
    let mounted = true;

    const loadBanners = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getActiveBanners();

        if (!mounted) return;

        const list =
          Array.isArray(
            data?.banners
          )
            ? data.banners
            : [];

        setBanners(list);
        setActiveIndex(0);
      } catch (err) {
        console.error(
          "Home banner error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load promotional banners."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBanners();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================================================
     AUTO SLIDER
  =================================================== */

  useEffect(() => {
    if (banners.length <= 1) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setActiveIndex(
          (current) =>
            (current + 1) %
            banners.length
        );
      }, 6000);

    return () =>
      window.clearInterval(timer);
  }, [banners.length]);

  const currentBanner =
    banners[activeIndex];

  const desktopImage = useMemo(
    () =>
      getDesktopImage(
        currentBanner
      ),
    [currentBanner]
  );

  const mobileImage = useMemo(
    () =>
      getMobileImage(
        currentBanner
      ),
    [currentBanner]
  );

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-[#080808]">
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center justify-center px-5 sm:min-h-[520px]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#d4af37]" />

            <p className="mt-4 text-sm text-white/50">
              Loading offers...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ===================================================
     EMPTY
  =================================================== */

  if (
    !currentBanner ||
    !desktopImage
  ) {
    return null;
  }

  /* ===================================================
     POSITION
  =================================================== */

  const textPosition =
    currentBanner.textPosition ||
    "left";

  const alignment =
    textPosition === "center"
      ? "items-center text-center"
      : textPosition === "right"
      ? "items-end text-right"
      : "items-start text-left";

  const contentWidth =
    textPosition === "center"
      ? "mx-auto"
      : textPosition === "right"
      ? "ml-auto"
      : "";

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <section className="relative overflow-hidden bg-[#050505]">
      <div className="relative min-h-[520px] sm:min-h-[600px] lg:min-h-[680px]">

        {/* BACKGROUND IMAGE */}

        <picture className="absolute inset-0 block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet={mobileImage}
          />

          <img
            src={desktopImage}
            alt={
              currentBanner
                ?.desktopImage?.alt ||
              currentBanner?.title ||
              "BAG HEE BAG"
            }
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </picture>

        {/* IMAGE OVERLAY */}

        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity:
              Number(
                currentBanner.overlayOpacity
              ) || 0.45,
          }}
        />

        {/* LUXURY GRADIENT */}

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* CONTENT */}

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-5 py-16 sm:min-h-[600px] sm:px-8 lg:min-h-[680px] lg:px-10">
          <div
            className={`flex w-full ${alignment}`}
          >
            <div
              className={`${contentWidth} max-w-xl`}
            >
              {/* BADGE */}

              {currentBanner.badge && (
                <div className="mb-5 inline-flex rounded-full border border-[#d4af37]/40 bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e5c866] backdrop-blur-md sm:text-xs">
                  {currentBanner.badge}
                </div>
              )}

              {/* TITLE */}

              <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.03em] text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                {currentBanner.title}
              </h1>

              {/* SUBTITLE */}

              {currentBanner.subtitle && (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8 md:text-xl">
                  {currentBanner.subtitle}
                </p>
              )}

              {/* DESCRIPTION */}

              {currentBanner.description && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                  {currentBanner.description}
                </p>
              )}

              {/* CTA */}

              {currentBanner.buttonText &&
                currentBanner.buttonLink && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        currentBanner.buttonLink
                      )
                    }
                    className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#d4af37] px-6 py-3.5 text-sm font-bold text-black shadow-[0_12px_40px_rgba(212,175,55,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e7ca67] sm:px-8 sm:py-4"
                  >
                    {currentBanner.buttonText}

                    <span
                      aria-hidden="true"
                      className="text-lg"
                    >
                      →
                    </span>
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* DOTS */}

        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {banners.map(
              (banner, index) => (
                <button
                  key={
                    banner._id ||
                    index
                  }
                  type="button"
                  aria-label={`Go to banner ${
                    index + 1
                  }`}
                  onClick={() =>
                    setActiveIndex(index)
                  }
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-8 bg-[#d4af37]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-red-400/20 bg-black/70 px-4 py-2 text-xs text-red-300 backdrop-blur-md">
          {error}
        </div>
      )}
    </section>
  );
};

export default HomeBanner;