import { useEffect, useState } from "react";

import {
  deleteReview,
  getMyReviews,
  updateReview,
} from "../services/reviewService";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyReviews();
      setReviews(data?.reviews || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const startEdit = (review) => {
    setEditingId(review._id);
    setRating(review.rating || 5);
    setTitle(review.title || "");
    setComment(review.comment || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRating(5);
    setTitle("");
    setComment("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      setError("Review comment cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateReview(editingId, {
        rating,
        title,
        comment,
      });

      cancelEdit();
      await loadReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update review."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteReview(id);
      await loadReviews();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  const stars = (value) =>
    [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={
          star <= value ? "text-[#d4af37]" : "text-gray-700"
        }
      >
        ★
      </span>
    ));

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

          <p className="mt-3 text-sm text-gray-500">
            Loading your reviews...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/account")}
          className="mb-5 text-sm text-gray-500 transition hover:text-[#e4c76b]"
        >
          ← Back to Account
        </button>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#b89b45]">
            Customer Experience
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            My Reviews
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your product ratings and reviews.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-5xl">★</div>

            <h2 className="mt-4 text-xl font-semibold">
              No Reviews Yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your product reviews will appear here after you
              submit them.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="mt-6 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div
                    className="h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black"
                    onClick={() =>
                      review.product?._id &&
                      navigate(`/product/${review.product._id}`)
                    }
                  >
                    {review.product?.images?.[0] ? (
                      <img
                        src={review.product.images[0]}
                        alt={review.product?.name || "Product"}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        👜
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            review.product?._id &&
                            navigate(
                              `/product/${review.product._id}`
                            )
                          }
                          className="text-left text-lg font-semibold transition hover:text-[#e4c76b]"
                        >
                          {review.product?.name || "Product"}
                        </button>

                        <div className="mt-1 text-xs text-gray-600">
                          SKU: {review.product?.sku || "—"}
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-[10px] ${
                          review.status === "APPROVED"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : review.status === "REJECTED"
                            ? "border-red-500/20 bg-red-500/10 text-red-300"
                            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {review.status || "PENDING"}
                      </span>
                    </div>

                    <div className="mt-3 text-xl">
                      {stars(review.rating)}
                    </div>

                    {editingId === review._id ? (
                      <form
                        onSubmit={saveEdit}
                        className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-black/30 p-4"
                      >
                        <div className="flex gap-1 text-2xl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={
                                star <= rating
                                  ? "text-[#d4af37]"
                                  : "text-gray-700"
                              }
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={title}
                          onChange={(event) =>
                            setTitle(event.target.value)
                          }
                          placeholder="Review title"
                          className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
                        />

                        <textarea
                          value={comment}
                          onChange={(event) =>
                            setComment(event.target.value)
                          }
                          rows={4}
                          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/60"
                        />

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {review.title && (
                          <h3 className="mt-3 font-medium">
                            {review.title}
                          </h3>
                        )}

                        <p className="mt-2 text-sm leading-6 text-gray-400">
                          {review.comment}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(review)}
                            className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-xs text-[#e4c76b] transition hover:bg-[#d4af37]/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(review._id)
                            }
                            className="rounded-xl border border-red-500/20 px-4 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
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

export default MyReviews;