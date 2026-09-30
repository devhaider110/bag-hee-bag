import { useCallback, useEffect, useState } from "react";
import { getActiveOffers } from "../services/couponService";

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDiscountText = (offer) => {
  if (offer.discountType === "percentage") {
    return `${offer.discountValue}% OFF`;
  }

  return `₹${offer.discountValue} OFF`;
};

const getRemainingUses = (offer) => {
  if (!offer.usageLimit || offer.usageLimit <= 0) {
    return null;
  }

  return Math.max(
    offer.usageLimit - offer.usedCount,
    0
  );
};

export default function Offers({ navigate }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getActiveOffers();

      const currentDate = new Date();

      const activeOffers = (
        response?.offers || []
      ).filter((offer) => {
        const startDate = new Date(
          offer.startDate
        );

        const endDate = new Date(
          offer.endDate
        );

        const withinDate =
          currentDate >= startDate &&
          currentDate <= endDate;

        const usageAvailable =
          !offer.usageLimit ||
          offer.usageLimit <= 0 ||
          offer.usedCount < offer.usageLimit;

        return (
          offer.isActive &&
          withinDate &&
          usageAvailable
        );
      });

      setOffers(activeOffers);
    } catch (err) {
      console.error(
        "Load offers error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load offers right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch (error) {
      console.error(
        "Copy coupon code error:",
        error
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              BAG HEE BAG • EXCLUSIVE OFFERS
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Save More.
              <br />
              Shop Smarter.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Discover our currently available offers
              and use the coupon codes at checkout to
              unlock your savings.
            </p>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Available Now
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Current Offers
            </h2>
          </div>

          <button
            type="button"
            onClick={loadOffers}
            className="w-fit rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/75 transition hover:border-white/35 hover:bg-white/5"
          >
            Refresh Offers
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-7"
              >
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="mt-5 h-10 w-40 rounded bg-white/10" />
                <div className="mt-5 h-4 w-full rounded bg-white/10" />
                <div className="mt-2 h-4 w-3/4 rounded bg-white/10" />
                <div className="mt-8 h-12 rounded-2xl bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <h3 className="text-lg font-semibold">
              Offers could not be loaded
            </h3>

            <p className="mt-2 text-sm text-white/55">
              {error}
            </p>

            <button
              type="button"
              onClick={loadOffers}
              className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          offers.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl">
                %
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                No active offers right now
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
                New offers may arrive soon. Keep an
                eye on this page for the latest BAG HEE
                BAG deals.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="mt-7 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Continue Shopping
              </button>
            </div>
          )}

        {/* OFFER CARDS */}
        {!loading &&
          !error &&
          offers.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer) => {
                const remainingUses =
                  getRemainingUses(offer);

                return (
                  <article
                    key={offer._id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055]"
                  >
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/[0.04] blur-2xl transition group-hover:bg-white/[0.08]" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                          Exclusive
                        </span>

                        <span className="text-xs text-white/40">
                          Until {formatDate(offer.endDate)}
                        </span>
                      </div>

                      <div className="mt-7">
                        <p className="text-4xl font-semibold tracking-tight">
                          {getDiscountText(offer)}
                        </p>

                        {offer.description && (
                          <p className="mt-3 min-h-[48px] text-sm leading-6 text-white/55">
                            {offer.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-black/20 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                          Coupon Code
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="truncate font-mono text-lg font-semibold tracking-wider">
                            {offer.code}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              copyCode(
                                offer.code
                              )
                            }
                            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
                          >
                            {copiedCode ===
                            offer.code
                              ? "Copied"
                              : "Copy"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2 text-xs text-white/45">
                        {offer.minOrderValue >
                          0 && (
                          <p>
                            Minimum order: ₹
                            {offer.minOrderValue}
                          </p>
                        )}

                        {offer.maxDiscount >
                          0 &&
                          offer.discountType ===
                            "percentage" && (
                            <p>
                              Maximum discount: ₹
                              {
                                offer.maxDiscount
                              }
                            </p>
                          )}

                        <p>
                          Valid from{" "}
                          {formatDate(
                            offer.startDate
                          )}{" "}
                          to{" "}
                          {formatDate(
                            offer.endDate
                          )}
                        </p>

                        {remainingUses !==
                          null && (
                          <p>
                            {remainingUses}{" "}
                            uses remaining
                          </p>
                        )}

                        {offer.perUserLimit >
                          0 && (
                          <p>
                            Per-user limit:{" "}
                            {offer.perUserLimit}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/shop")
                        }
                        className="mt-7 w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
                      >
                        Shop Now
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}