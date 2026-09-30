function WhyChooseUs({ items }) {
  return (
    <section className="bg-[#050505] px-5 py-24 text-white sm:px-8 lg:px-12">

      <div className="mx-auto max-w-7xl">

        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a84e]">
            The BHB Promise
          </p>

          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Why Choose BAG HEE BAG?
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {items.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-2 hover:border-[#d4af37]/25"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-sm text-[#e4c76b]">
                0{index + 1}
              </div>

              <h3 className="mt-7 text-lg font-medium transition group-hover:text-[#e4c76b]">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-neutral-500">
                {item.description}
              </p>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;