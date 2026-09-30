import {
  useEffect,
  useState,
} from "react";

import {
  getMyInvoices,
} from "../services/invoiceService";

const formatCurrency = (value) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

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

const statusClass = (status) => {
  switch (status) {
    case "PAID":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "REFUNDED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-[#d4af37]/20 bg-[#d4af37]/10 text-[#e4c76b]";
  }
};

export default function MyInvoices() {
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

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMyInvoices();

        setInvoices(
          response?.data?.invoices ||
            []
        );
      } catch (err) {
        console.error(
          "Invoices loading error:",
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

    loadInvoices();
  }, []);

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            BAG HEE BAG
          </p>

          <h1 className="text-3xl font-semibold sm:text-4xl">
            My Invoices
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            View your BHB invoices, order
            billing details and payment
            information.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-neutral-400">
            Loading invoices...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          invoices.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-2xl">
                🧾
              </div>

              <h2 className="text-xl font-semibold">
                No invoices yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
                Your invoice will appear
                here after you place an
                order.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/shop")
                }
                className="mt-6 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e4c76b]"
              >
                Continue Shopping
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          invoices.length > 0 && (
            <div className="grid gap-5">
              {invoices.map(
                (invoice) => (
                  <div
                    key={invoice._id}
                    className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-[#d4af37]/30 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-semibold text-[#e4c76b]">
                            {
                              invoice.invoiceNumber
                            }
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(
                              invoice.invoiceStatus
                            )}`}
                          >
                            {
                              invoice.invoiceStatus
                            }
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-neutral-400">
                          Issued on{" "}
                          {formatDate(
                            invoice.issuedAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          Payment:{" "}
                          {invoice.paymentMethod ||
                            "COD"}{" "}
                          •{" "}
                          {invoice.paymentStatus ||
                            "PENDING"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="sm:text-right">
                          <p className="text-xs uppercase tracking-wider text-neutral-500">
                            Total
                          </p>

                          <p className="mt-1 text-xl font-semibold text-white">
                            {formatCurrency(
                              invoice.totalAmount
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/invoices/${invoice.order?._id || invoice.order}`
                            )
                          }
                          className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-5 py-3 text-sm font-semibold text-[#e4c76b] transition hover:bg-[#d4af37]/20"
                        >
                          View Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </main>
  );
}