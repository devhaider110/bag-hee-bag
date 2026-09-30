import { useEffect, useState } from "react";

import {
  adminDeleteReview,
  getAllReviews,
  updateReviewStatus,
} from "../../services/reviewService";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [savingId, setSavingId] = useState(null);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllReviews({
        search,
        status,
        rating,
      });

      setReviews(data?.reviews || []);
    } catch (err) {
      console.error("Admin reviews error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [status, rating]);

  const handleStatus = async (id, nextStatus) => {
    try {
      setSavingId(id);
      setError("");

      await updateReviewStatus(id, { status: nextStatus });

      await loadReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update review."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this review permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSavingId(id);
      setError("");

      await adminDeleteReview(id);

      await loadReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete review."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadReviews();
  };

  const renderStars = (ratingValue) =>
    [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={
          star <= ratingValue
            ? "text-[#d4af37]"
            : "text-gray-700"
        }
      >
        ★
      </span>
    ));

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="mb-3 text-sm text-gray-500 transition hover:text-[#e4c76b]"
            >
              ← Back to Admin
            </button>

            <p className="text-xs uppercase tracking-[0.25em] text-[#b89b45]">
              Module 15
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Reviews & Ratings
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage customer feedback, ratings and review
              moderation.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-4">
            <p className="text-xs text-gray-500">Total Reviews</p>

            <p className="mt-1 text-2xl font-semibold text-[#e4c76b]">
              {reviews.length}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_auto]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, customer or review..."
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#d4af37]/60"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
            >
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-5xl">★</div>

            <h2 className="mt-4 text-xl font-semibold">
              No Reviews Found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#d4af37]/20 sm:p-6"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
                        {review.product?.images?.[0] ? (
                          <img
                            src={review.product.images[0]}
                            alt={review.product?.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">
                            👜
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-semibold">
                          {review.product?.name || "Product"}
                        </h2>

                        <p className="mt-1 text-xs text-gray-600">
                          SKU: {review.product?.sku || "—"}
                        </p>

                        <div className="mt-2 text-lg">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Customer
                        </p>

                        <p className="mt-1 text-sm">
                          {review.user?.name ||
                            review.user?.username ||
                            "Customer"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Email
                        </p>

                        <p className="mt-1 break-all text-xs text-gray-400">
                          {review.user?.email || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Order
                        </p>

                        <p className="mt-1 break-all font-mono text-xs text-gray-400">
                          {review.order?._id || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      {review.title && (
                        <h3 className="font-medium">
                          {review.title}
                        </h3>
                      )}

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                        {review.comment}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {review.isVerifiedPurchase && (
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-300">
                            ✓ Verified Purchase
                          </span>
                        )}

                        <span className="text-[10px] text-gray-600">
                          {review.createdAt
                            ? new Date(
                                review.createdAt
                              ).toLocaleString("en-IN")
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[190px] flex-col justify-between gap-4 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-600">
                        Moderation
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                          review.status === "APPROVED"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : review.status === "REJECTED"
                            ? "border-red-500/20 bg-red-500/10 text-red-300"
                            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={savingId === review._id}
                        onClick={() =>
                          handleStatus(review._id, "APPROVED")
                        }
                        className="w-full rounded-xl border border-emerald-500/20 px-4 py-2.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>

                      <button
                        type="button"
                        disabled={savingId === review._id}
                        onClick={() =>
                          handleStatus(review._id, "REJECTED")
                        }
                        className="w-full rounded-xl border border-red-500/20 px-4 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>

                      <button
                        type="button"
                        disabled={savingId === review._id}
                        onClick={() => handleDelete(review._id)}
                        className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminReviews;