function CategoryList({
  categories,
  loading,
  onEdit,
  onDelete,
  onToggle,
}) {
  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-10 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#d4af37]" />

        <p className="mt-5 text-sm text-neutral-500">
          Loading categories...
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5">
          👜
        </div>

        <h3 className="mt-5 text-lg font-medium">
          No categories yet
        </h3>

        <p className="mt-2 text-sm text-neutral-600">
          Create your first BHB category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category._id}
          className="group rounded-3xl border border-white/10 bg-white/[0.025] p-4 transition duration-300 hover:border-[#d4af37]/20 sm:p-5"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">
                  👜
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-medium text-white">
                  {category.name}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${
                    category.isActive
                      ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border border-red-500/20 bg-red-500/10 text-red-400"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-2 text-xs text-neutral-600">
                /{category.slug}
              </p>

              {category.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                  {category.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                onClick={() => onToggle(category._id)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-400 transition hover:border-[#d4af37]/30 hover:text-[#e4c76b]"
              >
                {category.isActive ? "Disable" : "Enable"}
              </button>

              <button
                onClick={() => onEdit(category)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-400 transition hover:border-white/20 hover:text-white"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(category)}
                className="rounded-xl border border-red-500/10 px-3 py-2 text-xs text-red-400 transition hover:border-red-500/30 hover:bg-red-500/5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryList;