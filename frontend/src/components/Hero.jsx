function Hero({ hero }) {
  return (
    <section className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden bg-[#050505]">

      {/* Background Glow */}
      <div className="animate-pulse-glow absolute -right-40 top-10 h-80 w-80 rounded-full bg-[#d4af37]/10 blur-3xl" />

      <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-[#8b5e34]/10 blur-3xl" />

      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* Decorative Circle */}
      <div className="animate-float absolute right-[7%] top-[18%] hidden h-[360px] w-[360px] rounded-full border border-[#d4af37]/10 lg:block" />

      <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-12">

        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Hero Content */}
          <div className="max-w-3xl animate-fade-up">

            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />

              <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#e4c76b] sm:text-xs">
                BAG HEE BAG • BHB
              </span>
            </div>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Carry Your
              <span className="block gold-text">Style.</span>
            </h1>

            <p className="max-w-2xl text-base leading-7 mt-7 text-neutral-400 sm:text-lg sm:leading-8">
              {hero.subtitle}
            </p>

            <div className="flex flex-col gap-3 mt-9 sm:flex-row">

              <a
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#e8d39a] px-7 py-3.5 text-sm font-semibold text-black transition duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)]"
              >
                {hero.buttonText}

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="/categories"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-7 py-3.5 text-sm font-medium text-white transition duration-500 hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-white/[0.05]"
              >
                Explore Collection
              </a>
            </div>

            {/* Small Stats */}
            <div className="flex flex-wrap mt-12 border-t gap-x-8 gap-y-5 border-white/10 pt-7">

              <div>
                <p className="text-xl font-semibold text-white">BHB</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">
                  Signature Store
                </p>
              </div>

              <div>
                <p className="text-xl font-semibold text-white">5+</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">
                  Bag Categories
                </p>
              </div>

              <div>
                <p className="text-xl font-semibold text-white">Mumbai</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">
                  Physical Store
                </p>
              </div>

            </div>
          </div>

          {/* 3D Visual */}
          <div className="relative hidden min-h-[500px] items-center justify-center lg:flex">

            <div className="absolute h-[330px] w-[330px] rounded-full bg-[#d4af37]/10 blur-3xl" />

            <div className="relative h-[390px] w-[300px] [perspective:1200px]">

              {/* Back Card */}
              <div className="absolute right-0 top-4 h-[330px] w-[230px] rotate-[13deg] rounded-[40px] border border-[#d4af37]/20 bg-gradient-to-br from-neutral-800/60 to-black/80 shadow-2xl backdrop-blur-xl" />

              {/* Main Bag Card */}
              <div className="absolute left-1/2 top-10 h-[350px] w-[250px] -translate-x-1/2 rotate-[-7deg] rounded-[42px] border border-white/15 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black shadow-[0_35px_80px_rgba(0,0,0,0.7)] transition duration-700 hover:rotate-0">

                {/* Handle */}
                <div className="absolute left-1/2 -top-16 h-28 w-36 -translate-x-1/2 rounded-t-full border-x-[10px] border-t-[10px] border-[#b89035]/70" />

                <div className="flex flex-col items-center justify-center h-full px-8 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/40">
                    <span className="text-sm tracking-[0.2em] text-[#e4c76b]">
                      BHB
                    </span>
                  </div>

                  <p className="mt-7 text-[10px] uppercase tracking-[0.4em] text-neutral-500">
                    BAG HEE BAG
                  </p>

                  <div className="mt-7 h-px w-16 bg-[#d4af37]/40" />

                  <p className="mt-6 text-sm leading-6 text-neutral-500">
                    Elegance that travels with you.
                  </p>

                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute px-5 py-4 border shadow-2xl -bottom-2 -left-8 rounded-2xl border-white/10 bg-black/70 backdrop-blur-xl">
                <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500">
                  Discover
                </p>

                <p className="mt-1 text-sm font-medium text-[#e4c76b]">
                  Your Perfect Bag
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;