function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5">
              <span className="text-xs tracking-widest text-[#e4c76b]">
                BHB
              </span>
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-[0.22em]">
                BAG HEE BAG
              </h1>

              <p className="mt-1 text-[8px] uppercase tracking-[0.35em] text-neutral-600">
                Admin Panel
              </p>
            </div>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-neutral-400 transition hover:border-[#d4af37]/30 hover:text-[#e4c76b]"
          >
            View Store
          </a>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}

export default AdminLayout;