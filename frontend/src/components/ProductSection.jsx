function ProductSection({ title, subtitle, products }) {
  return (
    <section className="bg-[#050505] px-5 py-24 text-white sm:px-8 lg:px-12">

      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-5 mb-12 sm:flex-row sm:items-end">

          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a84e]">
              BHB Collection
            </p>

            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {title}
            </h2>

            <p className="mt-3 text-sm text-neutral-500">
              {subtitle}
            </p>
          </div>

          <a
            href="/shop"
            className="text-sm text-neutral-400 transition hover:text-[#e4c76b]"
          >
            View Collection →
          </a>

        </div>

        {products.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">

            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4af37]/5 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-2xl">
                👜
              </div>

              <p className="mt-6 text-lg font-medium text-neutral-300">
                New collection coming soon.
              </p>

              <p className="max-w-md mx-auto mt-2 text-sm leading-6 text-neutral-600">
                Our curated products will appear here once the BHB collection
                is added.
              </p>
            </div>

          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => (
              <a
                href={`/product/${product._id}`}
                key={product._id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition duration-500 hover:-translate-y-2 hover:border-[#d4af37]/30"
              >

                <div className="relative overflow-hidden">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full transition duration-700 aspect-square group-hover:scale-105"
                  />

                  <div className="absolute inset-0 transition opacity-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:opacity-100" />

                </div>

                <div className="p-5">

                  <h3 className="font-medium">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-[#e4c76b]">
                    ₹{product.price}
                  </p>

                </div>
              </a>
            ))}

          </div>
        )}
      </div>
    </section>
  );
}

export default ProductSection;