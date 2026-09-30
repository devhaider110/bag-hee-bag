import { useEffect } from "react";

const setMeta = (
  attribute,
  key,
  content
) => {
  if (!content) {
    return;
  }

  let element =
    document.head.querySelector(
      `meta[${attribute}="${key}"]`
    );

  if (!element) {
    element =
      document.createElement("meta");

    element.setAttribute(
      attribute,
      key
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
      document.createElement("link");

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

const SEOHead = ({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  robots = "index,follow",
  siteName = "BAG HEE BAG",
}) => {
  useEffect(() => {
    const finalTitle =
      title ||
      "BAG HEE BAG | Luxury Bags & Accessories";

    const finalDescription =
      description ||
      "Shop premium handbags, purses, travel bags, school bags and more at BAG HEE BAG.";

    const finalKeywords =
      Array.isArray(keywords)
        ? keywords.join(", ")
        : keywords || "";

    document.title =
      finalTitle;

    setMeta(
      "name",
      "description",
      finalDescription
    );

    setMeta(
      "name",
      "keywords",
      finalKeywords
    );

    setMeta(
      "name",
      "robots",
      robots
    );

    setMeta(
      "property",
      "og:title",
      finalTitle
    );

    setMeta(
      "property",
      "og:description",
      finalDescription
    );

    setMeta(
      "property",
      "og:type",
      "website"
    );

    setMeta(
      "property",
      "og:site_name",
      siteName
    );

    if (ogImage) {
      setMeta(
        "property",
        "og:image",
        ogImage
      );
    }

    setMeta(
      "name",
      "twitter:card",
      ogImage
        ? "summary_large_image"
        : "summary"
    );

    setMeta(
      "name",
      "twitter:title",
      finalTitle
    );

    setMeta(
      "name",
      "twitter:description",
      finalDescription
    );

    if (ogImage) {
      setMeta(
        "name",
        "twitter:image",
        ogImage
      );
    }

    if (canonicalUrl) {
      setLink(
        "canonical",
        canonicalUrl
      );
    }
  }, [
    title,
    description,
    keywords,
    ogImage,
    canonicalUrl,
    robots,
    siteName,
  ]);

  return null;
};

export default SEOHead;