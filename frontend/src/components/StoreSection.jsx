function StoreSection({ store }) {
  return (
    <section className="bg-[#080808] px-5 py-24 text-white sm:px-8 lg:px-12">

      <div className="mx-auto max-w-7xl">

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.045] to-transparent p-7 sm:p-10 lg:p-14">

          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">

            {/* Content */}
            <div>

              <p className="text-[10px] uppercase tracking-[0.4em] text-[#c8a84e]">
                Visit BHB
              </p>

              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-5xl">
                Experience BHB
                <span className="gold-text"> In Person.</span>
              </h2>

              <p className="max-w-xl mt-6 text-sm leading-7 text-neutral-500 sm:text-base">
                {store.description}
              </p>

              <div className="flex gap-4 mt-8">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5">
                  📍
                </div>

                <div>
                  <p className="font-medium">{store.name}</p>

                  <p className="max-w-lg mt-2 text-sm leading-6 text-neutral-500">
                    {store.address}
                  </p>
                </div>

              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Kothari+Milestone+Shop+No+2+SV+Road+Malad+West+Mumbai"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/30 px-7 py-3.5 text-sm font-medium text-[#e4c76b] transition duration-500 hover:-translate-y-1 hover:bg-[#d4af37] hover:text-black"
              >
                Get Directions
                <span>↗</span>
              </a>

            </div>

            {/* Visual */}
            <div className="relative hidden min-h-[320px] items-center justify-center md:flex">

              <div className="absolute h-60 w-60 rounded-full border border-[#d4af37]/10" />

              <div className="absolute h-44 w-44 rounded-full border border-[#d4af37]/10" />

              <div className="relative flex h-36 w-36 rotate-3 items-center justify-center rounded-[2rem] border border-[#d4af37]/30 bg-[#d4af37]/5 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">

                <div className="text-center">
                  <p className="text-xl font-semibold tracking-[0.15em] text-[#e4c76b]">
                    BHB
                  </p>

                  <p className="mt-2 text-[8px] uppercase tracking-[0.35em] text-neutral-500">
                    Mumbai
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default StoreSection;