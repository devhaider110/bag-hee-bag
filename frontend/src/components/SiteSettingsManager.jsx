import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  getPublicStoreSettings,
} from "../services/storeService";

/* =====================================================
   META HELPER
===================================================== */

const setMeta = (
  name,
  content,
  attribute = "name"
) => {
  if (!content) {
    return;
  }

  let element =
    document.head.querySelector(
      `meta[${attribute}="${name}"]`
    );

  if (!element) {
    element =
      document.createElement(
        "meta"
      );

    element.setAttribute(
      attribute,
      name
    );

    document.head.appendChild(
      element
    );
  }

  element.setAttribute(
    "content",
    content
  );
};

/* =====================================================
   LINK HELPER
===================================================== */

const setLink = (
  rel,
  href
) => {
  if (!href) {
    return;
  }

  let element =
    document.head.querySelector(
      `link[rel="${rel}"]`
    );

  if (!element) {
    element =
      document.createElement(
        "link"
      );

    element.setAttribute(
      "rel",
      rel
    );

    document.head.appendChild(
      element
    );
  }

  element.setAttribute(
    "href",
    href
  );
};

/* =====================================================
   COMPONENT
===================================================== */

const SiteSettingsManager =
  () => {
    const {
      isAdmin,
    } = useAuth();

    const [
      settings,
      setSettings,
    ] = useState(null);

    const [
      path,
      setPath,
    ] = useState(
      window.location.pathname
    );

    /* ================================================
       NAVIGATION LISTENER
    ================================================ */

    useEffect(() => {
      const handleNavigation =
        () => {
          setPath(
            window.location.pathname
          );
        };

      window.addEventListener(
        "popstate",
        handleNavigation
      );

      return () => {
        window.removeEventListener(
          "popstate",
          handleNavigation
        );
      };
    }, []);

    /* ================================================
       LOAD PUBLIC SETTINGS
    ================================================ */

    useEffect(() => {
      let cancelled =
        false;

      const load =
        async () => {
          try {
            const response =
              await getPublicStoreSettings();

            if (
              !cancelled
            ) {
              setSettings(
                response?.store ||
                  null
              );
            }
          } catch (error) {
            console.error(
              "Public site settings error:",
              error
            );
          }
        };

      load();

      return () => {
        cancelled = true;
      };
    }, []);

    /* ================================================
       APPLY SEO
    ================================================ */

    useEffect(() => {
      if (!settings) {
        return;
      }

      const seo =
        settings.seo || {};

      const title =
        seo.title ||
        settings.storeName ||
        "BAG HEE BAG";

      document.title =
        title;

      setMeta(
        "description",
        seo.description ||
          ""
      );

      setMeta(
        "keywords",
        seo.keywords ||
          ""
      );

      setMeta(
        "robots",
        seo.robots ||
          "index, follow"
      );

      setMeta(
        "theme-color",
        settings.themeColor ||
          "#d4af37"
      );

      setMeta(
        "google-site-verification",
        seo.googleSiteVerification ||
          ""
      );

      setMeta(
        "msvalidate.01",
        seo.bingSiteVerification ||
          ""
      );

      setMeta(
        "og:title",
        seo.ogTitle ||
          title,
        "property"
      );

      setMeta(
        "og:description",
        seo.ogDescription ||
          seo.description ||
          "",
        "property"
      );

      setMeta(
        "og:type",
        "website",
        "property"
      );

      if (
        seo.ogImage
      ) {
        setMeta(
          "og:image",
          seo.ogImage,
          "property"
        );
      }

      setMeta(
        "twitter:card",
        seo.twitterCard ||
          "summary_large_image"
      );

      setMeta(
        "twitter:title",
        seo.ogTitle ||
          title
      );

      setMeta(
        "twitter:description",
        seo.ogDescription ||
          seo.description ||
          ""
      );

      if (
        seo.ogImage
      ) {
        setMeta(
          "twitter:image",
          seo.ogImage
        );
      }

      /* ==============================================
         CANONICAL
      ============================================== */

      if (
        seo.canonicalUrl
      ) {
        const cleanPath =
          window.location
            .pathname === "/"
            ? ""
            : window.location
                .pathname;

        const canonicalBase =
          seo.canonicalUrl.replace(
            /\/$/,
            ""
          );

        setLink(
          "canonical",
          `${canonicalBase}${cleanPath}`
        );
      }

      /* ==============================================
         FAVICON
      ============================================== */

      if (
        settings.faviconUrl
      ) {
        setLink(
          "icon",
          settings.faviconUrl
        );
      }

      /* ==============================================
         JSON-LD
      ============================================== */

      const oldSchema =
        document.getElementById(
          "bhb-structured-data"
        );

      if (oldSchema) {
        oldSchema.remove();
      }

      const schema =
        document.createElement(
          "script"
        );

      schema.id =
        "bhb-structured-data";

      schema.type =
        "application/ld+json";

      schema.textContent =
        JSON.stringify({
          "@context":
            "https://schema.org",

          "@type":
            seo.schemaType ||
            "Store",

          name:
            settings.storeName ||
            "BAG HEE BAG",

          url:
            seo.canonicalUrl ||
            window.location.origin,

          telephone:
            settings.phone ||
            undefined,

          email:
            settings.email ||
            undefined,

          image:
            settings.logoUrl ||
            undefined,

          address: {
            "@type":
              "PostalAddress",

            streetAddress:
              [
                settings.addressLine1,
                settings.addressLine2,
              ]
                .filter(Boolean)
                .join(", "),

            addressLocality:
              settings.city ||
              "Mumbai",

            addressRegion:
              settings.state ||
              "Maharashtra",

            postalCode:
              settings.pincode ||
              undefined,

            addressCountry:
              settings.country ||
              "IN",
          },

          sameAs: [
            settings
              .socialLinks
              ?.instagram,

            settings
              .socialLinks
              ?.facebook,

            settings
              .socialLinks
              ?.youtube,
          ].filter(Boolean),
        });

      document.head.appendChild(
        schema
      );
    }, [
      settings,
      path,
    ]);

    /* ================================================
       MAINTENANCE
    ================================================ */

    const isAuthPage =
      path === "/login" ||
      path === "/register";

    const isAdminRoute =
      path === "/admin" ||
      path.startsWith(
        "/admin/"
      );

    const maintenanceMode =
      Boolean(
        settings?.system
          ?.maintenanceMode
      );

    if (
      !maintenanceMode ||
      isAdmin ||
      isAdminRoute ||
      isAuthPage
    ) {
      return null;
    }

    /* ================================================
       MAINTENANCE SCREEN
    ================================================ */

    return (
      <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-y-auto bg-[#050505] px-5 py-10 text-white">

        <div className="w-full max-w-xl rounded-3xl border border-[#d4af37]/20 bg-white/[0.025] p-7 text-center shadow-2xl shadow-black/50 sm:p-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/5">
            <span className="text-sm font-semibold tracking-[0.2em] text-[#e4c76b]">
              BHB
            </span>
          </div>

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
            BAG HEE BAG
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            We’ll Be Back Soon
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/45">
            {settings?.system
              ?.maintenanceMessage ||
              "Our store is temporarily unavailable. Please check back shortly."}
          </p>

          {settings?.phone && (
            <p className="mt-6 text-sm text-white/65">
              Need help?{" "}
              {settings.phone}
            </p>
          )}

          {settings?.email && (
            <p className="mt-2 text-sm text-white/45">
              {settings.email}
            </p>
          )}
        </div>
      </div>
    );
  };

export default SiteSettingsManager;