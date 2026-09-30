import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import NotificationBell from "./NotificationBell";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const isAdmin = user?.role === "admin";

  // =====================================================
  // CLOSE MENUS
  // =====================================================

  const closeMenu = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    setMobileAdminOpen(false);
  };

  // =====================================================
  // PREVENT BODY SCROLL WHEN MOBILE MENU IS OPEN
  // =====================================================

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = (path) => {
    window.history.pushState({}, "", path);

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );

    closeMenu();
  };

  // =====================================================
  // ACCOUNT
  // =====================================================

  const handleAccount = () => {
    if (user) {
      setAccountOpen((current) => !current);
    } else {
      navigate("/login");
    }
  };

  // =====================================================
  // ADDRESSES
  // =====================================================

  const handleAddresses = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/addresses");
  };

  // =====================================================
  // ORDERS
  // =====================================================

  const handleOrders = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/orders");
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleWishlist = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/wishlist");
  };

  // =====================================================
  // CART
  // =====================================================

  const handleCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/cart");
  };

  // =====================================================
  // SUPPORT TICKETS
  // =====================================================

  const handleSupportTickets = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/support/tickets");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // =====================================================
  // NORMAL NAVIGATION
  // =====================================================

  const navItems = [
    ["Home", "/"],
    ["Shop", "/shop"],
    ["Offers", "/offers"],
    ["Contact", "/contact"],
  ];

  // =====================================================
  // ADMIN NAVIGATION
  // =====================================================

  const adminItems = [
    {
      label: "Admin Panel",
      path: "/admin",
      icon: "👑",
    },
    {
      label: "Product Management",
      path: "/admin/products",
      icon: "🛍️",
    },
    {
      label: "Category Management",
      path: "/admin/categories",
      icon: "🗂️",
    },
    {
      label: "Coupons & Offers",
      path: "/admin/coupons",
      icon: "🎟️",
    },
    {
      label: "Order Management",
      path: "/admin/orders",
      icon: "📋",
    },
    {
      label: "Customer Management",
      path: "/admin/customers",
      icon: "👥",
    },
    {
      label: "Inventory Management",
      path: "/admin/inventory",
      icon: "📦",
    },
    {
      label: "Cancellations & Returns",
      path: "/admin/returns",
      icon: "↩️",
    },
    {
      label: "Refund Management",
      path: "/admin/refunds",
      icon: "💰",
    },
    {
      label: "Invoice Management",
      path: "/admin/invoices",
      icon: "🧾",
    },
    {
      label: "Reports & Tax",
      path: "/admin/reports",
      icon: "📊",
    },
    {
      label: "Banners & Content",
      path: "/admin/banners",
      icon: "🎨",
    },
    {
      label: "Physical Store & Offline",
      path: "/admin/physical-store",
      icon: "🏪",
    },
    {
      label: "Support Tickets",
      path: "/admin/support",
      icon: "🎧",
    },
    {
      label: "Admin Security",
      path: "/admin/security",
      icon: "🔐",
    },
    {
      label: "System Settings",
      path: "/admin/settings",
      icon: "⚙️",
    },
    {
      label: "SEO Management",
      path: "/admin/seo",
      icon: "🔎",
    },
  ];

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-[100] border-b border-white/10 bg-black/90 text-white shadow-xl shadow-black/20 backdrop-blur-2xl">

        <nav className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-6">

          {/* =================================================
              MAIN NAVBAR ROW
          ================================================= */}

          <div className="flex min-h-[64px] items-center justify-between gap-2 sm:min-h-[72px] sm:gap-3">

            {/* =================================================
                LOGO
            ================================================= */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex min-w-0 shrink items-center gap-2 text-left sm:gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/5 transition duration-500 group-hover:rotate-6 group-hover:border-[#d4af37] sm:h-11 sm:w-11">
                <span className="text-[10px] font-semibold tracking-widest text-[#e4c76b] sm:text-sm">
                  BHB
                </span>
              </div>

              <div className="hidden min-[390px]:block min-w-0">
                <h1 className="truncate text-xs font-semibold tracking-[0.14em] sm:text-base sm:tracking-[0.25em]">
                  BAG HEE BAG
                </h1>

                <p className="mt-0.5 hidden text-[7px] tracking-[0.32em] text-neutral-500 sm:block sm:text-[9px] sm:tracking-[0.42em]">
                  LUXURY • STYLE • EVERYDAY
                </p>
              </div>
            </button>

            {/* =================================================
                DESKTOP / TABLET NAV
            ================================================= */}

            <div className="hidden items-center gap-3 md:flex lg:gap-6 xl:gap-8">

              {navItems.map(([label, path], index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`whitespace-nowrap text-xs transition hover:text-white lg:text-sm ${
                    index === 0
                      ? "text-neutral-300"
                      : "text-neutral-400"
                  }`}
                >
                  {label}
                </button>
              ))}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="whitespace-nowrap rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#e4c76b] transition hover:bg-[#d4af37] hover:text-black lg:px-4"
                >
                  Admin
                </button>
              )}
            </div>

            {/* =================================================
                DESKTOP ACTIONS
            ================================================= */}

            <div className="hidden items-center gap-1.5 md:flex lg:gap-2">

              {/* SEARCH */}

              <button
                type="button"
                aria-label="Search"
                onClick={() => navigate("/shop")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b] lg:h-10 lg:w-10"
              >
                ⌕
              </button>

              {/* WISHLIST */}

              <button
                type="button"
                aria-label="Wishlist"
                onClick={handleWishlist}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-lg text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b] lg:h-10 lg:w-10"
              >
                {user ? "♥" : "♡"}
              </button>

              {/* NOTIFICATIONS */}

              {user && <NotificationBell />}

              {/* CART */}

              <button
                type="button"
                aria-label="Shopping Cart"
                onClick={handleCart}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-base text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b] lg:h-10 lg:w-10"
              >
                <span>🛍</span>

                {user && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[9px] font-bold leading-none text-black shadow-lg shadow-[#d4af37]/20">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* =================================================
                  DESKTOP ACCOUNT
              ================================================= */}

              <div className="relative">

                <button
                  type="button"
                  onClick={handleAccount}
                  className="flex max-w-[170px] items-center gap-2 whitespace-nowrap rounded-full border border-[#d4af37]/40 px-3 py-2 text-xs text-[#e4c76b] transition duration-300 hover:bg-[#d4af37] hover:text-black lg:px-5 lg:text-sm"
                >
                  <span className="truncate">
                    {user
                      ? "My Account"
                      : "Login / Register"}
                  </span>

                  {user && (
                    <span
                      className={`shrink-0 text-[10px] transition-transform duration-300 ${
                        accountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      ▾
                    </span>
                  )}
                </button>

                {/* =================================================
                    DESKTOP ACCOUNT DROPDOWN
                ================================================= */}

                {user && accountOpen && (
                  <div
                    className="absolute right-0 top-full z-[200] mt-3 w-[290px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/10 bg-[#111]/98 shadow-2xl shadow-black/60 backdrop-blur-2xl"
                  >

                    <div
                      className="max-h-[calc(100vh-95px)] overflow-y-auto overscroll-contain p-2"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "#d4af37 transparent",
                      }}
                    >

                      {/* USER ITEMS */}

                      <button
                        type="button"
                        onClick={() => navigate("/account")}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>👤</span>
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOrders}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>📦</span>
                        <span>My Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/notifications")
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>🔔</span>
                        <span>Notifications</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddresses}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>📍</span>
                        <span>My Addresses</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSupportTickets}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>🎧</span>
                        <span>My Support Tickets</span>
                      </button>

                      {/* =================================================
                          ADMIN SECTION
                      ================================================= */}

                      {isAdmin && (
                        <>
                          <div className="my-2 h-px bg-white/10" />

                          <div className="px-3 pb-2 pt-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                              Administration
                            </p>
                          </div>

                          {adminItems.map((item) => (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() =>
                                navigate(item.path)
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[#e4c76b] transition hover:bg-[#d4af37]/10"
                            >
                              <span className="flex w-5 shrink-0 justify-center">
                                {item.icon}
                              </span>

                              <span className="min-w-0 truncate">
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </>
                      )}

                      <div className="my-2 h-px bg-white/10" />

                      {/* LOGOUT */}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                MOBILE TOP ACTIONS
            ================================================= */}

            <div className="flex items-center gap-1.5 md:hidden">

              {/* MOBILE CART */}

              <button
                type="button"
                aria-label="Shopping Cart"
                onClick={handleCart}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm text-neutral-300 transition active:scale-95"
              >
                🛍

                {user && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[8px] font-bold leading-none text-black">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* MOBILE MENU BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setMenuOpen((current) => !current)
                }
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl text-neutral-200 transition active:scale-95 hover:border-[#d4af37]/50"
              >
                {menuOpen ? "×" : "☰"}
              </button>
            </div>
          </div>

          {/* =====================================================
              MOBILE MENU BACKDROP
          ===================================================== */}

          {menuOpen && (
            <div
              className="fixed inset-0 top-[64px] z-[-1] bg-black/60 backdrop-blur-sm sm:top-[72px]"
              onClick={closeMenu}
            />
          )}

          {/* =====================================================
              MOBILE MENU
          ===================================================== */}

          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              menuOpen
                ? "max-h-[calc(100vh-64px)] opacity-100 sm:max-h-[calc(100vh-72px)]"
                : "max-h-0 opacity-0"
            }`}
          >
            <div
              className="max-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain border-t border-white/10 py-4 sm:max-h-[calc(100vh-72px)] sm:py-5"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor:
                  "#d4af37 transparent",
              }}
            >

              {/* =================================================
                  MAIN LINKS
              ================================================= */}

              <div className="flex flex-col gap-1">

                {navItems.map(([label, path]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(path)}
                    className="flex min-h-[48px] w-full items-center rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition active:bg-white/10 hover:bg-white/5 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="my-4 h-px bg-white/10" />

              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <div className="grid grid-cols-2 gap-2">

                {/* SEARCH */}

                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="flex min-h-[50px] items-center justify-center rounded-xl border border-white/10 px-2 text-xs text-neutral-300 transition active:scale-[0.98] hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
                >
                  <span className="mr-1.5 text-base">
                    ⌕
                  </span>
                  Search
                </button>

                {/* WISHLIST */}

                <button
                  type="button"
                  onClick={handleWishlist}
                  className="relative flex min-h-[50px] items-center justify-center rounded-xl border border-white/10 px-2 text-xs text-neutral-300 transition active:scale-[0.98] hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
                >
                  <span className="mr-1.5 text-base">
                    {user ? "♥" : "♡"}
                  </span>
                  Wishlist
                </button>

                {/* NOTIFICATIONS */}

                {user && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/notifications")
                    }
                    className="flex min-h-[50px] items-center justify-center rounded-xl border border-white/10 px-2 text-xs text-neutral-300 transition active:scale-[0.98] hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
                  >
                    <span className="mr-1.5 text-base">
                      🔔
                    </span>
                    Notifications
                  </button>
                )}

                {/* CART */}

                <button
                  type="button"
                  onClick={handleCart}
                  className="relative flex min-h-[50px] items-center justify-center rounded-xl border border-white/10 px-2 text-xs text-neutral-300 transition active:scale-[0.98] hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
                >
                  <span className="mr-1.5 text-base">
                    🛍
                  </span>

                  Cart

                  {user && cartCount > 0 && (
                    <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[8px] font-bold leading-none text-black">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* =================================================
                  MOBILE ACCOUNT
              ================================================= */}

              {user ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-white/[0.025]">

                  {/* ACCOUNT HEADER */}

                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen((current) => !current)
                    }
                    className="flex min-h-[54px] w-full items-center justify-between px-4 py-3 text-sm text-[#e4c76b]"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span>👤</span>
                      <span>My Account</span>
                    </span>

                    <span
                      className={`text-sm transition-transform duration-300 ${
                        accountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {/* ACCOUNT CONTENT */}

                  {accountOpen && (
                    <div className="border-t border-white/10 p-2">

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/account")
                        }
                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition active:bg-white/10 hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>👤</span>
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOrders}
                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition active:bg-white/10 hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>📦</span>
                        <span>My Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/notifications")
                        }
                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition active:bg-white/10 hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>🔔</span>
                        <span>Notifications</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddresses}
                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition active:bg-white/10 hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>📍</span>
                        <span>My Addresses</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSupportTickets}
                        className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-neutral-300 transition active:bg-white/10 hover:bg-white/5 hover:text-[#e4c76b]"
                      >
                        <span>🎧</span>
                        <span>My Support Tickets</span>
                      </button>

                      {/* =================================================
                          MOBILE ADMIN
                      ================================================= */}

                      {isAdmin && (
                        <div className="mt-2 border-t border-white/10 pt-2">

                          {/* ADMIN COLLAPSIBLE HEADER */}

                          <button
                            type="button"
                            onClick={() =>
                              setMobileAdminOpen(
                                (current) => !current
                              )
                            }
                            className="flex min-h-[54px] w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-[#e4c76b] transition hover:bg-[#d4af37]/10"
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <span>👑</span>
                              <span>Admin Panel</span>
                            </span>

                            <span
                              className={`text-sm transition-transform duration-300 ${
                                mobileAdminOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            >
                              ▾
                            </span>
                          </button>

                          {/* ADMIN LINKS */}

                          {mobileAdminOpen && (
                            <div className="mt-1 rounded-xl border border-[#d4af37]/10 bg-black/20 p-1">

                              {adminItems.map((item) => (
                                <button
                                  key={item.path}
                                  type="button"
                                  onClick={() =>
                                    navigate(item.path)
                                  }
                                  className="flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] text-[#e4c76b] transition active:bg-[#d4af37]/15 hover:bg-[#d4af37]/10"
                                >
                                  <span className="flex w-6 shrink-0 items-center justify-center text-base">
                                    {item.icon}
                                  </span>

                                  <span className="min-w-0 flex-1 truncate">
                                    {item.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* =================================================
                          LOGOUT
                      ================================================= */}

                      <div className="mt-2 border-t border-white/10 pt-2">

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-300 transition active:bg-red-500/10 hover:bg-red-500/10"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>

                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* =================================================
                    MOBILE LOGIN
                ================================================= */

                <button
                  type="button"
                  onClick={handleAccount}
                  className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#d4af37]/30 px-4 py-3 text-sm font-medium text-[#e4c76b] transition active:scale-[0.99] hover:bg-[#d4af37] hover:text-black"
                >
                  Login / Register
                </button>
              )}

              {/* =================================================
                  MOBILE ADMIN SHORTCUT
                  ONLY FOR ADMIN
              ================================================= */}

              {isAdmin && !user && null}

              {/* =================================================
                  BOTTOM SAFE SPACE
              ================================================= */}

              <div className="h-4 sm:h-6" />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Navbar;