function CategorySection({ categories }) {
  return (
    <section className="relative overflow-hidden bg-[#080808] px-5 py-24 text-white sm:px-8 lg:px-12">

      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-5 mb-12 sm:flex-row sm:items-end">

          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a84e]">
              Explore BHB
            </p>

            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">
              Shop by Category
            </h2>

            <p className="max-w-xl mt-4 text-sm leading-7 text-neutral-500">
              From everyday essentials to statement pieces, find a bag for
              every chapter of your journey.
            </p>
          </div>

          <a
            href="/categories"
            className="text-sm text-neutral-400 transition hover:text-[#e4c76b]"
          >
            View all categories →
          </a>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {categories.map((category, index) => (
            <a
              href={`/bags/${category.slug}`}
              key={category.slug}
              className="group relative min-h-[270px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-transparent p-6 transition duration-500 hover:-translate-y-2 hover:border-[#d4af37]/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
            >

              {/* Number */}
              <span className="absolute right-5 top-5 text-[10px] tracking-widest text-neutral-700">
                0{index + 1}
              </span>

              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-2xl transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                👜
              </div>

              <div className="absolute bottom-6 left-6 right-6">

                <h3 className="text-lg font-medium transition group-hover:text-[#e4c76b]">
                  {category.name}
                </h3>

                <p className="mt-3 text-xs leading-6 text-neutral-500">
                  {category.description}
                </p>

                <div className="flex items-center gap-2 mt-5 text-xs text-neutral-400">
                  <span>Explore</span>

                  <span className="transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>

              </div>

            </a>
          ))}

        </div>
      </div>
    </section>
  );
}

export default CategorySection;