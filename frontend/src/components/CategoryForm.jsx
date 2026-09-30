import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

function CategoryForm({
  editingCategory,
  onSubmit,
  onCancel,
  saving,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        image: editingCategory.image || "",
        isActive: editingCategory.isActive,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingCategory]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    await onSubmit(form);

    if (!editingCategory) {
      setForm(initialForm);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8"
    >
      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a84e]">
          {editingCategory ? "Edit Category" : "New Category"}
        </p>

        <h2 className="mt-3 text-2xl font-semibold">
          {editingCategory
            ? "Update category"
            : "Create a new category"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Keep your BHB collection organized and easy to discover.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-400">
            Category Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Ladies Bags"
            maxLength={60}
            required
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-700 focus:border-[#d4af37]/40"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-400">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description of this category..."
            rows="4"
            maxLength={250}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-700 focus:border-[#d4af37]/40"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-400">
            Image URL
          </label>

          <input
            type="url"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-700 focus:border-[#d4af37]/40"
          />

          <p className="mt-2 text-[11px] text-neutral-700">
            Cloudinary upload will be integrated in the appropriate media module.
          </p>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
          <div>
            <p className="text-sm text-neutral-300">
              Active Category
            </p>

            <p className="mt-1 text-xs text-neutral-600">
              Active categories can be shown in the storefront.
            </p>
          </div>

          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-5 w-5 accent-[#d4af37]"
          />
        </label>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-[#e8d39a] px-6 py-3.5 text-sm font-semibold text-black transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editingCategory
              ? "Update Category"
              : "Add Category"}
        </button>

        {editingCategory && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-6 py-3.5 text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default CategoryForm;