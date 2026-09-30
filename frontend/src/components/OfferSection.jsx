function OfferSection({ offer }) {
  return (
    <section className="bg-[#080808] px-5 py-24 text-white sm:px-8 lg:px-12">

      <div className="mx-auto max-w-7xl">

        <div className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/20 bg-gradient-to-br from-[#17140c] via-[#0d0d0d] to-black px-7 py-20 text-center sm:px-12 lg:py-24">

          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-3xl" />

          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-3xl" />

          <div className="relative">

            <p className="text-[10px] uppercase tracking-[0.45em] text-[#c8a84e]">
              The BHB Edit
            </p>

            <h2 className="max-w-3xl mx-auto mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {offer.title}
            </h2>

            <p className="max-w-2xl mx-auto mt-6 text-sm leading-7 text-neutral-400 sm:text-base">
              {offer.description}
            </p>

            <a
              href="/shop"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#e8d39a] px-7 py-3.5 text-sm font-semibold text-black transition duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(212,175,55,0.18)]"
            >
              {offer.buttonText}
              <span>→</span>
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}

export default OfferSection;