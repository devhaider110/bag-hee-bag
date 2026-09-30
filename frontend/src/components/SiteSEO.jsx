import { useEffect } from "react";

import {
  getPublicSystemSettings,
} from "../services/systemSettingsService";

const upsertMeta = (
  name,
  content
) => {
  if (!name) {
    return;
  }

  let element =
    document.head.querySelector(
      `meta[name="${name}"]`
    );

  if (!content) {
    if (element) {
      element.remove();
    }

    return;
  }

  if (!element) {
    element =
      document.createElement(
        "meta"
      );

    element.setAttribute(
      "name",
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

const upsertProperty = (
  property,
  content
) => {
  if (!property) {
    return;
  }

  let element =
    document.head.querySelector(
      `meta[property="${property}"]`
    );

  if (!content) {
    if (element) {
      element.remove();
    }

    return;
  }

  if (!element) {
    element =
      document.createElement(
        "meta"
      );

    element.setAttribute(
      "property",
      property
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

const upsertCanonical = (
  href
) => {
  let element =
    document.head.querySelector(
      'link[rel="canonical"]'
    );

  if (!href) {
    if (element) {
      element.remove();
    }

    return;
  }

  if (!element) {
    element =
      document.createElement(
        "link"
      );

    element.setAttribute(
      "rel",
      "canonical"
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

const SiteSEO = () => {
  useEffect(() => {
    let cancelled = false;

    const applySEO =
      async () => {
        try {
          const response =
            await getPublicSystemSettings();

          if (cancelled) {
            return;
          }

          const seo =
            response?.settings
              ?.seo || {};

          const storeName =
            response?.settings
              ?.storeName ||
            "BAG HEE BAG";

          document.title =
            seo.siteTitle ||
            storeName;

          upsertMeta(
            "description",
            seo.metaDescription ||
              ""
          );

          upsertMeta(
            "robots",
            seo.robots ||
              "index,follow"
          );

          upsertMeta(
            "keywords",
            Array.isArray(
              seo.keywords
            )
              ? seo.keywords.join(
                  ", "
                )
              : ""
          );

          upsertProperty(
            "og:title",
            seo.siteTitle ||
              storeName
          );

          upsertProperty(
            "og:description",
            seo.metaDescription ||
              ""
          );

          upsertProperty(
            "og:image",
            seo.ogImage ||
              ""
          );

          upsertProperty(
            "og:site_name",
            storeName
          );

          const canonical =
            seo.canonicalUrl ||
            window.location.href;

          upsertCanonical(
            canonical
          );
        } catch (error) {
          console.error(
            "SEO load error:",
            error
          );
        }
      };

    applySEO();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default SiteSEO;