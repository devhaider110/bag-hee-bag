import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  createReview,
  deleteReview,
  getMyProductReview,
  getProductReviews,
  updateReview,
} from "../services/reviewService";

const ProductReviews = ({ productId }) => {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);

  const [stats, setStats] = useState({
    averageRating: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  const loadReviews = async (requestedPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const data = await getProductReviews(productId, {
        page: requestedPage,
        limit: 6,
      });

      setReviews(data?.reviews || []);

      setStats(
        data?.stats || {
          averageRating: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        }
      );

      setPage(data?.pagination?.page || requestedPage);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Product reviews error:", err);

      setError(
        err?.response?.data?.message || "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MY REVIEW
  // =====================================================

  const loadMyReview = async () => {
    if (!user || !productId) {
      setMyReview(null);
      return;
    }

    try {
      const data = await getMyProductReview(productId);
      const review = data?.review || null;

      setMyReview(review);

      if (review) {
        setRating(review.rating || 5);
        setTitle(review.title || "");
        setComment(review.comment || "");
      }
    } catch (err) {
      console.error("My review error:", err);
    }
  };

  useEffect(() => {
    if (!productId) {
      return;
    }

    loadReviews(1);
    loadMyReview();
  }, [productId, user]);

  // =====================================================
  // FORM RESET
  // =====================================================

  const resetForm = () => {
    setRating(5);
    setTitle("");
    setComment("");
    setHoverRating(0);
    setEditing(false);
  };

  const startEditing = () => {
    if (!myReview) {
      return;
    }

    setRating(myReview.rating || 5);
    setTitle(myReview.title || "");
    setComment(myReview.comment || "");
    setEditing(true);
    setSuccess("");
    setError("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setError("Please login to write a review.");
      return;
    }

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editing && myReview) {
        await updateReview(myReview._id, {
          rating,
          title,
          comment,
        });

        setSuccess("Your review has been updated.");
      } else {
        await createReview({
          productId,
          rating,
          title,
          comment,
        });

        setSuccess(
          "Thank you! Your review has been submitted."
        );
      }

      resetForm();

      await Promise.all([loadReviews(1), loadMyReview()]);
    } catch (err) {
      console.error("Submit review error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!myReview) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteReview(myReview._id);

      resetForm();
      setMyReview(null);
      setSuccess("Your review has been deleted.");

      await loadReviews(1);
    } catch (err) {
      console.error("Delete review error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  // =====================================================
  // STAR COMPONENT
  // =====================================================

  const renderStars = (value, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active =
            star <=
            (interactive ? hoverRating || rating : value);

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onMouseEnter={() =>
                interactive && setHoverRating(star)
              }
              onMouseLeave={() =>
                interactive && setHoverRating(0)
              }
              onClick={() => interactive && setRating(star)}
              className={`text-2xl transition ${
                active ? "text-[#d4af37]" : "text-gray-700"
              } ${
                interactive
                  ? "cursor-pointer hover:scale-110"
                  : "cursor-default"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>
    );
  };

  const ratingRows = useMemo(() => [5, 4, 3, 2, 1], []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="mt-12 border-t border-white/10 pt-10">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[#b89b45]">
          Customer Experience
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Reviews & Ratings
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Honest experiences from customers who purchased this
          product from BAG HEE BAG.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#17130a] to-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Overall Rating
          </p>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-semibold text-[#e4c76b]">
              {Number(stats.averageRating || 0).toFixed(1)}
            </span>

            <span className="pb-2 text-sm text-gray-500">/ 5</span>
          </div>

          <div className="mt-2">
            {renderStars(Math.round(stats.averageRating || 0))}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Based on{" "}
            <span className="text-gray-300">{stats.total || 0}</span>{" "}
            reviews
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Rating Distribution
          </p>

          <div className="mt-5 space-y-3">
            {ratingRows.map((star) => {
              const count = stats.distribution?.[star] || 0;
              const total = stats.total || 0;
              const percentage =
                total > 0 ? (count / total) * 100 : 0;

              return (
                <div
                  key={star}
                  className="flex items-center gap-3"
                >
                  <span className="w-8 text-sm text-gray-400">
                    {star} ★
                  </span>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-[#d4af37] transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-8 text-right text-xs text-gray-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {editing
                ? "Edit Your Review"
                : myReview
                ? "Your Review"
                : "Share Your Experience"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {myReview
                ? "You have already reviewed this product."
                : user
                ? "Tell other customers what you think."
                : "Login after purchasing to write a review."}
            </p>
          </div>

          {myReview && (
            <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              ✓ Verified Purchase
            </span>
          )}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="mt-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your Rating
              </label>

              {renderStars(rating, true)}

              <p className="mt-1 text-xs text-gray-500">
                {rating === 5
                  ? "Excellent"
                  : rating === 4
                  ? "Very Good"
                  : rating === 3
                  ? "Good"
                  : rating === 2
                  ? "Needs Improvement"
                  : "Poor"}
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Review Title
                <span className="ml-1 text-gray-600">
                  (optional)
                </span>
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Example: Beautiful and spacious bag"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#d4af37]/60"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your Review
              </label>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="How was the quality, design, size and overall experience?"
                className="w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-[#d4af37]/60"
              />

              <p className="mt-1 text-right text-xs text-gray-600">
                {comment.length}/2000
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editing
                  ? "Update Review"
                  : "Submit Review"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
              )}

              {myReview && !editing && (
                <>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-xl border border-[#d4af37]/30 px-6 py-3 text-sm font-medium text-[#e4c76b] transition hover:bg-[#d4af37]/10"
                  >
                    Edit Review
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-xl border border-red-500/20 px-6 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5 text-center">
            <p className="text-sm text-gray-400">
              Login to share your experience after purchasing
              this product.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Customer Reviews
          </h3>

          <span className="text-xs text-gray-500">
            {stats.total || 0} total
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-4xl">✦</div>

            <h4 className="mt-3 font-medium">No reviews yet</h4>

            <p className="mt-1 text-sm text-gray-500">
              Be the first customer to share your experience.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#d4af37]/20 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 text-sm font-semibold text-[#e4c76b]">
                      {(
                        review.user?.name ||
                        review.user?.username ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        {review.user?.name ||
                          review.user?.username ||
                          "Customer"}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-600">
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>

                  {review.isVerifiedPurchase && (
                    <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:inline-flex">
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {renderStars(review.rating)}
                </div>

                {review.title && (
                  <h4 className="mt-3 font-medium text-white">
                    {review.title}
                  </h4>
                )}

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                  {review.comment}
                </p>

                {review.isVerifiedPurchase && (
                  <span className="mt-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:hidden">
                    ✓ Verified Purchase
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => loadReviews(page - 1)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>

          <span className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2 text-xs text-[#e4c76b]">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => loadReviews(page + 1)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductReviews;