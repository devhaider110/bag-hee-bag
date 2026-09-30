import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
} from "../../services/couponService";

const initialForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "1",
  startDate: "",
  endDate: "",
  isActive: true,
};

// ==========================================
// INDIA IST → UTC ISO DATE
// ==========================================
const convertISTToISO = (value) => {
  if (!value) return "";

  // datetime-local gives:
  // 2026-09-13T22:30
  //
  // Treat the selected time as IST (UTC+05:30)
  const isoDate = new Date(`${value}:00+05:30`);

  if (Number.isNaN(isoDate.getTime())) {
    return "";
  }

  return isoDate.toISOString();
};

// ==========================================
// UTC → INDIA IST FOR DATETIME-LOCAL INPUT
// ==========================================
const convertUTCToISTLocal = (date) => {
  if (!date) return "";

  const utcDate = new Date(date);

  if (Number.isNaN(utcDate.getTime())) {
    return "";
  }

  // Convert UTC → IST
  const istDate = new Date(
    utcDate.getTime() + 5.5 * 60 * 60 * 1000
  );

  return istDate.toISOString().slice(0, 16);
};

const Coupons = () => {
  const { token } = useAuth();

  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // LOAD COUPONS
  // ==========================================
  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCoupons(token);

      setCoupons(response.coupons || []);
    } catch (err) {
      console.error("Load coupons error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCoupons();
    }
  }, [token]);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  // ==========================================
  // CREATE / UPDATE COUPON
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      // ------------------------------
      // BASIC VALIDATION
      // ------------------------------
      if (!form.code.trim()) {
        setError("Coupon code is required.");
        return;
      }

      if (!form.discountValue) {
        setError("Discount value is required.");
        return;
      }

      if (!form.startDate || !form.endDate) {
        setError(
          "Please select both start date and end date."
        );
        return;
      }

      // ------------------------------
      // CONVERT INDIA TIME TO UTC
      // ------------------------------
      const startDate = convertISTToISO(
        form.startDate
      );

      const endDate = convertISTToISO(
        form.endDate
      );

      if (!startDate || !endDate) {
        setError(
          "Invalid date. Please select valid start and end dates."
        );
        return;
      }

      // ------------------------------
      // DATE VALIDATION
      // ------------------------------
      if (
        new Date(endDate) <=
        new Date(startDate)
      ) {
        setError(
          "End date must be after start date."
        );
        return;
      }

      // ------------------------------
      // BUILD REQUEST DATA
      // ------------------------------
      const data = {
        code: form.code.trim().toUpperCase(),

        description:
          form.description.trim(),

        discountType:
          form.discountType,

        discountValue:
          Number(form.discountValue),

        minOrderValue:
          Number(form.minOrderValue) || 0,

        maxDiscount:
          Number(form.maxDiscount) || 0,

        usageLimit:
          Number(form.usageLimit) || 0,

        perUserLimit:
          Number(form.perUserLimit) || 1,

        startDate,
        endDate,

        isActive:
          form.isActive,
      };

      // ------------------------------
      // UPDATE
      // ------------------------------
      if (editingId) {
        await updateCoupon(
          token,
          editingId,
          data
        );

        setMessage(
          "Coupon updated successfully."
        );
      }

      // ------------------------------
      // CREATE
      // ------------------------------
      else {
        await createCoupon(
          token,
          data
        );

        setMessage(
          "Coupon created successfully."
        );
      }

      resetForm();

      await loadCoupons();
    } catch (err) {
      console.error(
        "Coupon save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT COUPON
  // ==========================================
  const handleEdit = (coupon) => {
    setEditingId(coupon._id);

    setForm({
      code: coupon.code || "",

      description:
        coupon.description || "",

      discountType:
        coupon.discountType || "percentage",

      discountValue:
        coupon.discountValue ?? "",

      minOrderValue:
        coupon.minOrderValue ?? "",

      maxDiscount:
        coupon.maxDiscount ?? "",

      usageLimit:
        coupon.usageLimit ?? "",

      perUserLimit:
        coupon.perUserLimit ?? "1",

      startDate:
        convertUTCToISTLocal(
          coupon.startDate
        ),

      endDate:
        convertUTCToISTLocal(
          coupon.endDate
        ),

      isActive:
        coupon.isActive ?? true,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // TOGGLE COUPON
  // ==========================================
  const handleToggle = async (id) => {
    try {
      setError("");
      setMessage("");

      await toggleCoupon(token, id);

      setMessage(
        "Coupon status updated successfully."
      );

      await loadCoupons();
    } catch (err) {
      console.error(
        "Toggle coupon error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to change coupon status."
      );
    }
  };

  // ==========================================
  // DELETE COUPON
  // ==========================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteCoupon(token, id);

      setMessage(
        "Coupon deleted successfully."
      );

      await loadCoupons();
    } catch (err) {
      console.error(
        "Delete coupon error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete coupon."
      );
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            BHB Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Coupons & Offers
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Create and manage promotional coupon
            codes for BAG HEE BAG customers.
          </p>
        </div>

        {/* ALERTS */}

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CREATE / EDIT */}

        <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingId
                ? "Edit Coupon"
                : "Create New Coupon"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure the discount and validity
              rules.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >

            {/* CODE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Coupon Code
              </label>

              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="BHB10"
                required
                maxLength={30}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white uppercase outline-none focus:border-white/30"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Description
              </label>

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="10% off on your order"
                maxLength={200}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />
            </div>

            {/* DISCOUNT TYPE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Discount Type
              </label>

              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              >
                <option value="percentage">
                  Percentage (%)
                </option>

                <option value="fixed">
                  Fixed Amount (₹)
                </option>
              </select>
            </div>

            {/* DISCOUNT VALUE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Discount Value
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={
                  form.discountType ===
                  "percentage"
                    ? "10"
                    : "200"
                }
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />
            </div>

            {/* MIN ORDER */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Minimum Order Value
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="minOrderValue"
                value={form.minOrderValue}
                onChange={handleChange}
                placeholder="999"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />
            </div>

            {/* MAX DISCOUNT */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Maximum Discount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="maxDiscount"
                value={form.maxDiscount}
                onChange={handleChange}
                placeholder="300"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />

              <p className="mt-1 text-xs text-gray-600">
                Used mainly for percentage coupons.
                0 = no cap.
              </p>
            </div>

            {/* USAGE LIMIT */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Total Usage Limit
              </label>

              <input
                type="number"
                min="0"
                step="1"
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="100"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />

              <p className="mt-1 text-xs text-gray-600">
                0 = unlimited.
              </p>
            </div>

            {/* PER USER */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Usage Per Customer
              </label>

              <input
                type="number"
                min="1"
                step="1"
                name="perUserLimit"
                value={form.perUserLimit}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />
            </div>

            {/* START DATE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Start Date & Time
              </label>

              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />

              <p className="mt-1 text-xs text-gray-600">
                India Standard Time (IST)
              </p>
            </div>

            {/* END DATE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                End Date & Time
              </label>

              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-white/30"
              />

              <p className="mt-1 text-xs text-gray-600">
                India Standard Time (IST)
              </p>
            </div>

            {/* ACTIVE */}

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-300">
                Coupon is active
              </span>
            </label>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-3 md:col-span-2">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Coupon"
                  : "Create Coupon"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

            </div>
          </form>
        </div>

        {/* COUPON LIST */}

        <div>

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-semibold">
                All Coupons
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {coupons.length} coupon
                {coupons.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="rounded-2xl border border-white/10 p-8 text-center text-gray-500">
              Loading coupons...
            </div>
          )

          /* EMPTY */

          : coupons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <p className="text-gray-400">
                No coupons created yet.
              </p>
            </div>
          )

          /* COUPONS */

          : (
            <div className="grid gap-5 lg:grid-cols-2">

              {coupons.map((coupon) => (

                <div
                  key={coupon._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold tracking-wider text-black">
                          {coupon.code}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            coupon.isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {coupon.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                      <p className="mt-3 text-gray-400">
                        {coupon.description ||
                          "No description"}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xl font-bold">
                        {coupon.discountType ===
                        "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                      </p>

                      <p className="text-xs text-gray-600">
                        discount
                      </p>

                    </div>

                  </div>

                  {/* INFO */}

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">

                    <div className="rounded-xl bg-black/30 p-3">

                      <p className="text-xs text-gray-600">
                        Min Order
                      </p>

                      <p className="mt-1 text-gray-300">
                        ₹
                        {coupon.minOrderValue}
                      </p>

                    </div>

                    <div className="rounded-xl bg-black/30 p-3">

                      <p className="text-xs text-gray-600">
                        Usage
                      </p>

                      <p className="mt-1 text-gray-300">
                        {coupon.usedCount} /{" "}
                        {coupon.usageLimit === 0
                          ? "∞"
                          : coupon.usageLimit}
                      </p>

                    </div>

                  </div>

                  {/* DATE */}

                  <div className="mt-4 text-xs leading-5 text-gray-600">

                    <p>
                      <span className="text-gray-500">
                        Starts:
                      </span>{" "}
                      {coupon.startDate
                        ? new Date(
                            coupon.startDate
                          ).toLocaleString(
                            "en-IN",
                            {
                              timeZone:
                                "Asia/Kolkata",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "Invalid date"}
                    </p>

                    <p className="mt-1">
                      <span className="text-gray-500">
                        Ends:
                      </span>{" "}
                      {coupon.endDate
                        ? new Date(
                            coupon.endDate
                          ).toLocaleString(
                            "en-IN",
                            {
                              timeZone:
                                "Asia/Kolkata",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "Invalid date"}
                    </p>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-wrap gap-2">

                    <button
                      onClick={() =>
                        handleEdit(coupon)
                      }
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleToggle(
                          coupon._id
                        )
                      }
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                    >
                      {coupon.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          coupon._id
                        )
                      }
                      className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Coupons;