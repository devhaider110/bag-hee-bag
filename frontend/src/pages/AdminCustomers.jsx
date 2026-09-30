import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCustomers,
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
    return "Never";
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

function AdminCustomers() {
  const [
    customers,
    setCustomers,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    verification,
    setVerification,
  ] = useState("");

  const [
    role,
    setRole,
  ] = useState("");

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
  ] = useState("");

  const loadCustomers =
    useCallback(
      async (
        pageNumber = 1
      ) => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getCustomers({
              search,
              status,
              verification,
              role,
              page:
                pageNumber,
              limit: 10,
            });

          setCustomers(
            data.customers ||
              []
          );

          setPagination(
            data.pagination || {
              page:
                pageNumber,
              limit: 10,
              total: 0,
              totalPages: 0,
            }
          );
        } catch (err) {
          console.error(
            "Load customers error:",
            err
          );

          setError(
            err.response?.data
              ?.message ||
              "Unable to load customers."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        search,
        status,
        verification,
        role,
      ]
    );

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadCustomers(1);
      }, 350);

    return () =>
      clearTimeout(timer);
  }, [
    loadCustomers,
  ]);

  const handleStatus =
    async (
      customer
    ) => {
      try {
        setActionLoading(
          `${customer._id}-status`
        );

        await updateCustomerStatus(
          customer._id,
          !customer.isActive
        );

        await loadCustomers(
          pagination.page
        );
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update customer status."
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleVerification =
    async (
      customer
    ) => {
      try {
        setActionLoading(
          `${customer._id}-verification`
        );

        await updateCustomerVerification(
          customer._id,
          !customer.isVerified
        );

        await loadCustomers(
          pagination.page
        );
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update verification."
        );
      } finally {
        setActionLoading("");
      }
    };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
           

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Customer Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Manage customers, accounts,
              verification status,
              activity and purchase history.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Total Customers
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#e4c76b]">
              {pagination.total}
            </p>
          </div>

        </div>

        {/* =====================================================
            FILTER PANEL
        ===================================================== */}

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.025] p-4 shadow-2xl shadow-black/20 sm:p-5">

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

            {/* SEARCH */}

            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-500">
                Search
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, email or phone..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#d4af37]/50"
                />
              </div>
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-500">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50"
              >
                <option value="">
                  All Status
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            {/* VERIFICATION */}

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-500">
                Verification
              </label>

              <select
                value={verification}
                onChange={(event) =>
                  setVerification(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50"
              >
                <option value="">
                  All Customers
                </option>
                <option value="verified">
                  Verified
                </option>
                <option value="unverified">
                  Unverified
                </option>
              </select>
            </div>

          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]/50"
            >
              <option value="">
                Customer Role
              </option>
              <option value="customer">
                Customer
              </option>
              <option value="admin">
                Admin
              </option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
                setVerification("");
                setRole("");
              }}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
            >
              Clear Filters
            </button>

          </div>

        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =====================================================
            CUSTOMER LIST
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />

                <p className="mt-4 text-sm text-neutral-500">
                  Loading customers...
                </p>
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center px-5 text-center">
              <div>
                <div className="text-5xl">
                  👥
                </div>

                <h2 className="mt-4 text-xl font-semibold">
                  No customers found
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Try changing your search
                  or filters.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-widest text-neutral-500">
                      <th className="px-5 py-4">
                        Customer
                      </th>

                      <th className="px-5 py-4">
                        Contact
                      </th>

                      <th className="px-5 py-4">
                        Orders
                      </th>

                      <th className="px-5 py-4">
                        Total Spent
                      </th>

                      <th className="px-5 py-4">
                        Last Order
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map(
                      (customer) => (
                        <tr
                          key={
                            customer._id
                          }
                          className="border-b border-white/5 transition hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-sm font-semibold text-[#e4c76b]">
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
                                <p className="font-medium text-white">
                                  {
                                    customer.name
                                  }
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs text-neutral-500">
                                    {
                                      customer.role
                                    }
                                  </span>

                                  {customer.isVerified && (
                                    <span className="text-xs text-emerald-400">
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                              </div>

                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm text-neutral-300">
                              {
                                customer.email
                              }
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {customer.phone ||
                                "No phone"}
                            </p>
                          </td>

                          <td className="px-5 py-5 text-sm text-neutral-300">
                            {
                              customer.totalOrders
                            }
                          </td>

                          <td className="px-5 py-5 text-sm font-medium text-[#e4c76b]">
                            {formatCurrency(
                              customer.totalSpent
                            )}
                          </td>

                          <td className="px-5 py-5 text-sm text-neutral-400">
                            {formatDate(
                              customer.lastOrderAt
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                customer.isActive
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {customer.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/admin/customers/${customer._id}`
                                  )
                                }
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b]"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                disabled={
                                  actionLoading ===
                                  `${customer._id}-status`
                                }
                                onClick={() =>
                                  handleStatus(
                                    customer
                                  )
                                }
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b] disabled:opacity-50"
                              >
                                {customer.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARDS */}

              <div className="grid gap-3 p-3 lg:hidden">
                {customers.map(
                  (customer) => (
                    <article
                      key={
                        customer._id
                      }
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 text-sm font-semibold text-[#e4c76b]">
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

                          <div className="min-w-0">
                            <h3 className="truncate font-medium">
                              {
                                customer.name
                              }
                            </h3>

                            <p className="truncate text-xs text-neutral-500">
                              {
                                customer.email
                              }
                            </p>
                          </div>

                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${
                            customer.isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {customer.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-white/[0.03] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                            Orders
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {
                              customer.totalOrders
                            }
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/[0.03] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                            Spent
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#e4c76b]">
                            {formatCurrency(
                              customer.totalSpent
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/[0.03] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                            Verified
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {customer.isVerified
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/customers/${customer._id}`
                            )
                          }
                          className="flex-1 rounded-xl border border-[#d4af37]/30 px-3 py-2.5 text-xs font-medium text-[#e4c76b]"
                        >
                          View Customer
                        </button>

                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            `${customer._id}-status`
                          }
                          onClick={() =>
                            handleStatus(
                              customer
                            )
                          }
                          className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-neutral-300 disabled:opacity-50"
                        >
                          {customer.isActive
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            </>
          )}
        </section>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading &&
          pagination.totalPages >
            1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-neutral-500">
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.totalPages
                }
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    pagination.page <=
                    1
                  }
                  onClick={() =>
                    loadCustomers(
                      pagination.page -
                        1
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    loadCustomers(
                      pagination.page +
                        1
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-neutral-300 transition hover:border-[#d4af37]/40 hover:text-[#e4c76b] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next →
                </button>
              </div>

            </div>
          )}

      </div>
    </main>
  );
}

export default AdminCustomers;