import {
  useEffect,
  useState,
} from "react";

import {
  getCustomerById,
  updateCustomerStatus,
  updateCustomerVerification,
} from "../services/customerService";

const navigate = (path) => {
  window.history.pushState(
    {},
    "",
    path
  );

  window.dispatchEvent(
    new PopStateEvent(
      "popstate"
    )
  );
};

const formatCurrency = (
  amount
) => {
  return `₹${Number(
    amount || 0
  ).toLocaleString("en-IN")}`;
};

const formatDate = (
  date
) => {
  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

function AdminCustomerDetails() {
  const [
    customer,
    setCustomer,
  ] = useState(null);

  const [
    stats,
    setStats,
  ] = useState({
    totalOrders: 0,
    totalSpent: 0,
    lastOrderAt: null,
  });

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    wishlist,
    setWishlist,
  ] = useState([]);

  const [
    recentlyViewed,
    setRecentlyViewed,
  ] = useState([]);

  const [
    addresses,
    setAddresses,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const customerId =
    window.location.pathname
      .split(
        "/admin/customers/"
      )[1]
      ?.split("/")[0];

  const loadCustomer =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getCustomerById(
            customerId
          );

        setCustomer(
          data.customer
        );

        setStats(
          data.stats || {
            totalOrders: 0,
            totalSpent: 0,
            lastOrderAt: null,
          }
        );

        setOrders(
          data.orders || []
        );

        setWishlist(
          data.wishlist || []
        );

        setRecentlyViewed(
          data.recentlyViewed ||
            []
        );

        setAddresses(
          data.addresses ||
            []
        );
      } catch (err) {
        console.error(
          "Load customer details error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load customer details."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!customerId) {
      setError(
        "Invalid customer ID."
      );
      setLoading(false);
      return;
    }

    loadCustomer();
  }, [
    customerId,
  ]);

  const handleStatus =
    async () => {
      if (!customer) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        await updateCustomerStatus(
          customer._id,
          !customer.isActive
        );

        await loadCustomer();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update customer status."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  const handleVerification =
    async () => {
      if (!customer) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        await updateCustomerVerification(
          customer._id,
          !customer.isVerified
        );

        await loadCustomer();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update verification."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

          <p className="mt-4 text-sm text-neutral-500">
            Loading customer...
          </p>
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="max-w-md text-center">
          <div className="text-5xl">
            👤
          </div>

          <h1 className="mt-4 text-2xl font-semibold">
            Customer Not Found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {error ||
              "This customer could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/customers"
              )
            }
            className="mt-6 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e4c76b]"
          >
            Back to Customers
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            BACK
        ===================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/customers"
            )
          }
          className="mb-6 text-sm text-neutral-500 transition hover:text-[#e4c76b]"
        >
          ← Back to Customers
        </button>

        {/* =====================================================
            PROFILE HEADER
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

          <div className="h-28 bg-gradient-to-r from-[#d4af37]/10 via-transparent to-[#d4af37]/5" />

          <div className="-mt-12 px-5 pb-6 sm:px-7">

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-[#111] text-3xl font-semibold text-[#e4c76b] shadow-2xl">
                  {customer.avatar ? (
                    <img
                      src={
                        customer.avatar
                      }
                      alt={
                        customer.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    customer.name
                      ?.charAt(
                        0
                      )
                      ?.toUpperCase()
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                      {
                        customer.name
                      }
                    </h1>

                    {customer.isVerified && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-neutral-500">
                    {
                      customer.email
                    }
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    {customer.phone ||
                      "No phone number"}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={
                    handleVerification
                  }
                  className="rounded-xl border border-[#d4af37]/30 px-4 py-2.5 text-xs font-medium text-[#e4c76b] transition hover:bg-[#d4af37]/10 disabled:opacity-50"
                >
                  {customer.isVerified
                    ? "Remove Verification"
                    : "Verify Customer"}
                </button>

                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={
                    handleStatus
                  }
                  className={`rounded-xl px-4 py-2.5 text-xs font-medium transition disabled:opacity-50 ${
                    customer.isActive
                      ? "border border-red-500/20 text-red-300 hover:bg-red-500/10"
                      : "bg-[#d4af37] text-black hover:bg-[#e4c76b]"
                  }`}
                >
                  {customer.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-600">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                stats.totalOrders
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-600">
              Total Purchase
            </p>

            <p className="mt-2 text-3xl font-semibold text-[#e4c76b]">
              {formatCurrency(
                stats.totalSpent
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-600">
              Last Order
            </p>

            <p className="mt-2 text-lg font-semibold">
              {formatDate(
                stats.lastOrderAt
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-600">
              Joined
            </p>

            <p className="mt-2 text-lg font-semibold">
              {formatDate(
                customer.createdAt
              )}
            </p>
          </div>

        </section>

        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Account
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs text-neutral-600">
                Name
              </p>

              <p className="mt-1 text-sm text-neutral-300">
                {
                  customer.name
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Email
              </p>

              <p className="mt-1 break-all text-sm text-neutral-300">
                {
                  customer.email
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Phone
              </p>

              <p className="mt-1 text-sm text-neutral-300">
                {customer.phone ||
                  "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Role
              </p>

              <p className="mt-1 text-sm capitalize text-neutral-300">
                {
                  customer.role
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Account Status
              </p>

              <p
                className={`mt-1 text-sm ${
                  customer.isActive
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {customer.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Verification
              </p>

              <p
                className={`mt-1 text-sm ${
                  customer.isVerified
                    ? "text-emerald-400"
                    : "text-neutral-400"
                }`}
              >
                {customer.isVerified
                  ? "Verified"
                  : "Not Verified"}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Registered
              </p>

              <p className="mt-1 text-sm text-neutral-300">
                {formatDate(
                  customer.createdAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-600">
                Last Login
              </p>

              <p className="mt-1 text-sm text-neutral-300">
                {formatDate(
                  customer.lastLogin
                )}
              </p>
            </div>

          </div>
        </section>

        {/* =====================================================
            ORDER HISTORY
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">

          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                Purchases
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Order History
              </h2>
            </div>

            <span className="text-xs text-neutral-600">
              {
                orders.length
              }{" "}
              orders
            </span>
          </div>

          {orders.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-neutral-600">
              No orders found.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(
                (order) => (
                  <div
                    key={
                      order._id
                    }
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        #
                        {String(
                          order._id
                        ).slice(
                          -8
                        ).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs text-[#e4c76b]">
                        {
                          order.orderStatus
                        }
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(
                          order.totalAmount
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/orders/${order._id}`
                          )
                        }
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
                      >
                        View
                      </button>

                    </div>
                  </div>
                )
              )}
            </div>
          )}

        </section>

        {/* =====================================================
            ADDRESSES
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Delivery
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Saved Addresses
            </h2>
          </div>

          {addresses.length ===
          0 ? (
            <p className="text-sm text-neutral-600">
              No saved addresses.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {addresses.map(
                (address) => (
                  <div
                    key={
                      address._id
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">
                        {
                          address.fullName
                        }
                      </p>

                      {address.isDefault && (
                        <span className="rounded-full bg-[#d4af37]/10 px-2.5 py-1 text-[10px] text-[#e4c76b]">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      {
                        address.house
                      }
                      {address.street &&
                        `, ${address.street}`}
                      {address.landmark &&
                        `, ${address.landmark}`}
                      <br />
                      {
                        address.city
                      }
                      {address.state &&
                        `, ${address.state}`}
                      {address.pinCode &&
                        ` - ${address.pinCode}`}
                    </p>

                    <p className="mt-2 text-xs text-neutral-600">
                      {
                        address.phone
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          )}

        </section>

        {/* =====================================================
            WISHLIST
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Shopping Activity
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Wishlist
            </h2>
          </div>

          {wishlist.length ===
          0 ? (
            <p className="text-sm text-neutral-600">
              Wishlist is empty.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map(
                (item) => {
                  const product =
                    item.product;

                  if (!product) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        item._id
                      }
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex gap-3">
                        {product.image && (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {
                              product.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#e4c76b]">
                            {formatCurrency(
                              product.discountPrice ||
                                product.price
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

        </section>

        {/* =====================================================
            RECENTLY VIEWED
        ===================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Browsing Activity
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Recently Viewed
            </h2>
          </div>

          {recentlyViewed.length ===
          0 ? (
            <p className="text-sm text-neutral-600">
              No recently viewed products.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map(
                (item) => {
                  const product =
                    item.product;

                  if (!product) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        item._id
                      }
                      className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                    >
                      {product.image && (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="h-36 w-full object-cover"
                        />
                      )}

                      <div className="p-3">
                        <p className="truncate text-sm font-medium">
                          {
                            product.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {formatDate(
                            item.viewedAt ||
                              item.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default AdminCustomerDetails;