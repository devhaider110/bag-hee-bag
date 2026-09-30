import { useEffect, useState } from "react";

import { getPublicStoreSettings } from "../services/storeService";

function Footer() {
  const [store, setStore] = useState(null);

  // =====================================================
  // LOAD STORE SETTINGS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadStoreSettings = async () => {
      try {
        const response = await getPublicStoreSettings();

        if (!mounted) return;

        setStore(
          response?.store ||
            response?.data?.store ||
            response?.data ||
            null
        );
      } catch (error) {
        console.error("Footer store settings error:", error);
      }
    };

    loadStoreSettings();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // STORE DATA
  // =====================================================

  const storeName = store?.storeName || "BAG HEE BAG";

  const storePhone =
    store?.phone ||
    store?.contact?.phone ||
    "";

  const storeEmail =
    store?.email ||
    store?.contact?.email ||
    "";

  const formattedAddress =
    store?.formattedAddress ||
    [
      store?.addressLine1,
      store?.addressLine2,
      store?.city,
      store?.state,
      store?.pincode,
      store?.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Mumbai, Maharashtra, India";

  const socialLinks = store?.socialLinks || {};

  // =====================================================
  // SOCIAL URL HELPER
  // =====================================================

  const normalizeSocialUrl = (value, type) => {
    if (!value) return "";

    const trimmed = String(value).trim();

    if (!trimmed) return "";

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      return trimmed;
    }

    if (type === "instagram") {
      return `https://instagram.com/${trimmed.replace(/^@/, "")}`;
    }

    if (type === "facebook") {
      return `https://facebook.com/${trimmed}`;
    }

    if (type === "youtube") {
      return `https://youtube.com/${trimmed}`;
    }

    if (type === "whatsapp") {
      const number = trimmed.replace(/[^0-9+]/g, "");

      return `https://wa.me/${number.replace(/^\+/, "")}`;
    }

    return trimmed;
  };

  // =====================================================
  // SOCIAL URLS
  // =====================================================

  const instagramUrl = normalizeSocialUrl(
    socialLinks.instagram,
    "instagram"
  );

  const facebookUrl = normalizeSocialUrl(
    socialLinks.facebook,
    "facebook"
  );

  const youtubeUrl = normalizeSocialUrl(
    socialLinks.youtube,
    "youtube"
  );

  const whatsappUrl = normalizeSocialUrl(
    socialLinks.whatsapp ||
      store?.whatsapp ||
      store?.contact?.whatsapp,
    "whatsapp"
  );

  // =====================================================
  // COMMON STYLES
  // =====================================================

  const linkClass =
    "block text-[11px] leading-5 text-neutral-500 transition-colors duration-200 hover:text-[#e4c76b] sm:text-[12px]";

  const headingClass =
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-200 sm:text-[12px]";

  return (
    <footer className="mt-10 border-t border-white/[0.07] bg-[#030303] text-white sm:mt-12">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        {/* =================================================
            MAIN FOOTER
        ================================================= */}

        <div
          className="
            grid
            grid-cols-2
            gap-x-7
            gap-y-7

            sm:grid-cols-3
            sm:gap-x-8
            sm:gap-y-8

            lg:grid-cols-5
            lg:gap-x-10
            lg:gap-y-0
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              {/* Logo */}
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#d4af37]/30
                  text-[9px]
                  font-medium
                  tracking-[0.12em]
                  text-[#e4c76b]
                "
              >
                {store?.storeCode || "BHB"}
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    truncate
                    text-[12px]
                    font-semibold
                    tracking-[0.16em]
                    text-white
                  "
                >
                  {storeName}
                </h2>

                <p className="mt-0.5 text-[7px] tracking-[0.24em] text-neutral-600">
                  LUXURY • STYLE • EVERYDAY
                </p>
              </div>
            </div>

            <p className="mt-2.5 max-w-[230px] text-[11px] leading-[1.6] text-neutral-600">
              Stylish, practical and occasion-ready bags
              for every journey.
            </p>

            {/* SOCIAL */}
            {(instagramUrl ||
              facebookUrl ||
              youtubeUrl ||
              whatsappUrl) && (
              <div className="mt-3 flex items-center gap-1.5">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      text-[8px]
                      text-neutral-500
                      transition
                      hover:border-[#d4af37]/50
                      hover:text-[#e4c76b]
                    "
                  >
                    IG
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      text-[8px]
                      text-neutral-500
                      transition
                      hover:border-[#d4af37]/50
                      hover:text-[#e4c76b]
                    "
                  >
                    FB
                  </a>
                )}

                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      text-[8px]
                      text-neutral-500
                      transition
                      hover:border-[#d4af37]/50
                      hover:text-[#e4c76b]
                    "
                  >
                    YT
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      text-[8px]
                      text-neutral-500
                      transition
                      hover:border-[#d4af37]/50
                      hover:text-[#e4c76b]
                    "
                  >
                    WA
                  </a>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              SHOP
          ================================================= */}

          <div>
            <h3 className={headingClass}>Shop</h3>

            <div className="mt-2.5 space-y-0.5">
              <a href="/bags/ladies" className={linkClass}>
                Ladies Bags
              </a>

              <a href="/bags/men" className={linkClass}>
                Men's Bags
              </a>

              <a href="/bags/travel" className={linkClass}>
                Travel Bags
              </a>

              <a
                href="/bags/school-college"
                className={linkClass}
              >
                School & College
              </a>

              <a
                href="/bags/wedding-party"
                className={linkClass}
              >
                Wedding & Party
              </a>

              <a href="/shop" className={linkClass}>
                All Bags
              </a>

              <a href="/offers" className={linkClass}>
                Offers
              </a>
            </div>
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div>
            <h3 className={headingClass}>Information</h3>

            <div className="mt-2.5 space-y-0.5">
              <a href="/about" className={linkClass}>
                About BHB
              </a>

              <a href="/faq" className={linkClass}>
                FAQ
              </a>

              <a href="/contact" className={linkClass}>
                Contact Us
              </a>

              <a href="/shipping" className={linkClass}>
                Shipping
              </a>

              <a href="/returns" className={linkClass}>
                Returns
              </a>

              <a href="/support" className={linkClass}>
                Customer Support
              </a>
            </div>
          </div>

          {/* =================================================
              CUSTOMER
          ================================================= */}

          <div>
            <h3 className={headingClass}>Customer</h3>

            <div className="mt-2.5 space-y-0.5">
              <a href="/login" className={linkClass}>
                Login
              </a>

              <a href="/register" className={linkClass}>
                Create Account
              </a>

              <a href="/account" className={linkClass}>
                My Account
              </a>

              <a href="/orders" className={linkClass}>
                My Orders
              </a>

              <a href="/wishlist" className={linkClass}>
                Wishlist
              </a>

              <a href="/cart" className={linkClass}>
                Shopping Cart
              </a>

              <a href="/track-order" className={linkClass}>
                Track Order
              </a>
            </div>
          </div>

          {/* =================================================
              VISIT US
          ================================================= */}

          <div className="col-span-2 sm:col-span-1">
            <h3 className={headingClass}>Visit Us</h3>

            <p className="mt-2.5 max-w-[260px] text-[11px] leading-[1.6] text-neutral-600 sm:text-[12px]">
              {formattedAddress}
            </p>

            <div className="mt-2.5 space-y-0.5">
              {storePhone && (
                <a
                  href={`tel:${storePhone}`}
                  className={linkClass}
                >
                  {storePhone}
                </a>
              )}

              {storeEmail && (
                <a
                  href={`mailto:${storeEmail}`}
                  className={`${linkClass} break-all`}
                >
                  {storeEmail}
                </a>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <a
                href="/contact"
                className="
                  text-[11px]
                  font-medium
                  text-[#c8a84e]
                  transition
                  hover:text-[#e4c76b]
                "
              >
                Contact BHB →
              </a>

              {store?.googleMapsUrl && (
                <a
                  href={store.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    text-[11px]
                    text-neutral-600
                    transition
                    hover:text-neutral-300
                  "
                >
                  Maps →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            BOTTOM AREA
        ================================================= */}

        <div
          className="
            mt-7
            border-t
            border-white/[0.06]
            pt-4

            sm:mt-8
            sm:pt-5
          "
        >
          {/* LEGAL LINKS */}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-600">
              Legal
            </span>

            <a
              href="/privacy-policy"
              className="text-[10px] text-neutral-600 transition hover:text-neutral-300"
            >
              Privacy
            </a>

            <a
              href="/terms"
              className="text-[10px] text-neutral-600 transition hover:text-neutral-300"
            >
              Terms
            </a>

            <a
              href="/shipping"
              className="text-[10px] text-neutral-600 transition hover:text-neutral-300"
            >
              Shipping
            </a>

            <a
              href="/returns"
              className="text-[10px] text-neutral-600 transition hover:text-neutral-300"
            >
              Returns
            </a>

            <a
              href="/cookie-policy"
              className="text-[10px] text-neutral-600 transition hover:text-neutral-300"
            >
              Cookies
            </a>

            <a
              href="/faq"
              className="text-[10px] text-neutral-600 transition hover:text-neutral-300"
            >
              FAQ
            </a>
          </div>

          {/* COPYRIGHT */}

          <div
            className="
              mt-3
              flex
              flex-col
              gap-1.5
              text-[9px]
              text-neutral-700

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:text-[10px]
            "
          >
            <p>
              © {new Date().getFullYear()} {storeName}.
              All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <span>{store?.storeCode || "BHB"}</span>

              <span>•</span>

              <span>
                {store?.city || "MUMBAI"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;