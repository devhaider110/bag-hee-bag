import { useEffect, useState } from "react";

import AdminLayout from "../../layouts/AdminLayout";
import CategoryForm from "../../components/CategoryForm";
import CategoryList from "../../components/CategoryList";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();

      setCategories(response.data || []);
    } catch (err) {
      console.error("Category loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingCategory) {
        await updateCategory(
          editingCategory._id,
          formData
        );

        setMessage("Category updated successfully.");
        setEditingCategory(null);
      } else {
        await createCategory(formData);

        setMessage("Category created successfully.");
      }

      await loadCategories();
    } catch (err) {
      console.error("Category save error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteCategory(category._id);

      setMessage("Category deleted successfully.");

      await loadCategories();
    } catch (err) {
      console.error("Category delete error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete category."
      );
    }
  };

  const handleToggle = async (id) => {
    try {
      setError("");
      setMessage("");

      await toggleCategoryStatus(id);

      setMessage("Category status updated.");

      await loadCategories();
    } catch (err) {
      console.error("Category status error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update category status."
      );
    }
  };

  const activeCount = categories.filter(
    (category) => category.isActive
  ).length;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a84e]">
            BHB Administration
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
                Category Management
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
                Organize the BHB collection into clear,
                discoverable shopping categories.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4">
                <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                  Total
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {categories.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/10 bg-[#d4af37]/5 px-5 py-4">
                <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                  Active
                </p>

                <p className="mt-1 text-xl font-semibold text-[#e4c76b]">
                  {activeCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <CategoryForm
              editingCategory={editingCategory}
              onSubmit={handleSubmit}
              onCancel={() => setEditingCategory(null)}
              saving={saving}
            />
          </div>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-600">
                  Collection Structure
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  All Categories
                </h2>
              </div>

              <button
                onClick={loadCategories}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-500 transition hover:border-white/20 hover:text-white"
              >
                Refresh
              </button>
            </div>

            <CategoryList
              categories={categories}
              loading={loading}
              onEdit={setEditingCategory}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Categories;