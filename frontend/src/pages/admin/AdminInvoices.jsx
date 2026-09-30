import {
  useEffect,
  useState,
} from "react";

import {
  getAdminInvoices,
} from "../../services/invoiceService";

const money = (value) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
    }
  ).format(Number(value || 0));

const date = (value) =>
  value
    ? new Date(
        value
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "—";

const navigate = (path) => {
  window.history.pushState(
    {},
    "",
    path
  );

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
};

const getStatusClass = (
  status
) => {
  if (status === "PAID") {
    return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
  }

  if (status === "REFUNDED") {
    return "bg-blue-400/10 text-blue-300 border-blue-400/20";
  }

  if (status === "CANCELLED") {
    return "bg-red-400/10 text-red-300 border-red-400/20";
  }

  return "bg-[#d4af37]/10 text-[#e4c76b] border-[#d4af37]/20";
};

export default function AdminInvoices() {
  const [
    invoices,
    setInvoices,
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
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminInvoices({
          search,
          status,
          page: 1,
          limit: 50,
        });

      setInvoices(
        response?.data?.invoices ||
          []
      );
    } catch (err) {
      console.error(
        "Admin invoice error:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [status]);

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            MODULE 20
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Invoice Management
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Manage customer invoices,
            payment status and billing
            records.
          </p>
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_220px_auto]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                loadInvoices();
              }
            }}
            placeholder="Search invoice, customer..."
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#d4af37]/40"
          />

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">
              All Statuses
            </option>

            <option value="GENERATED">
              Generated
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="REFUNDED">
              Refunded
            </option>
          </select>

          <button
            type="button"
            onClick={loadInvoices}
            className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e4c76b]"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-4">
                    Invoice
                  </th>

                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-sm text-neutral-500"
                    >
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-sm text-neutral-500"
                    >
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map(
                    (invoice) => (
                      <tr
                        key={invoice._id}
                        className="border-b border-white/5 transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold text-[#e4c76b]">
                            {
                              invoice.invoiceNumber
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-neutral-600">
                            Order #
                            {String(
                              invoice.order?._id ||
                                invoice.order ||
                                ""
                            ).slice(
                              -8
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium">
                            {invoice.user
                              ?.name ||
                              invoice.customerSnapshot
                                ?.name ||
                              "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {invoice.user
                              ?.email ||
                              invoice.customerSnapshot
                                ?.email ||
                              ""}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm text-neutral-400">
                          {date(
                            invoice.issuedAt
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-xs text-neutral-300">
                            {
                              invoice.paymentMethod
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-neutral-500">
                            {
                              invoice.paymentStatus
                            }
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${getStatusClass(
                              invoice.invoiceStatus
                            )}`}
                          >
                            {
                              invoice.invoiceStatus
                            }
                          </span>
                        </td>

                        <td className="px-5 py-5 text-right text-sm font-semibold">
                          {money(
                            invoice.totalAmount
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/invoices/${invoice.order?._id || invoice.order}`
                              )
                            }
                            className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/5 px-4 py-2 text-xs font-semibold text-[#e4c76b] transition hover:bg-[#d4af37]/10"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}