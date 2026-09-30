import React, { useEffect, useState } from "react";

import { getMyInvoiceByOrder } from "../services/invoiceService";

// ============================================================
// NAVIGATION
// ============================================================

const navigate = (path) => {
  window.history.pushState({}, "", path);

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
};

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("bhb_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("bhb_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};

// ============================================================
// ORDER ID
// ============================================================

const getOrderIdFromPath = () => {
  const parts = window.location.pathname
    .split("/")
    .filter(Boolean);

  if (
    parts[0] !== "invoice" ||
    parts.length !== 2
  ) {
    return "";
  }

  return parts[1];
};

// ============================================================
// FORMAT MONEY
// ============================================================

const formatAmount = (amount) => {
  return `₹${Number(
    amount || 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ============================================================
// FORMAT DATE + TIME
// ============================================================

const formatDateTime = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// ============================================================
// STATUS CLASS
// ============================================================

const getStatusClass = (status) => {
  const normalized = String(
    status || ""
  ).toUpperCase();

  if (
    normalized === "PAID" ||
    normalized === "DELIVERED"
  ) {
    return "text-emerald-400";
  }

  if (
    normalized === "CANCELLED" ||
    normalized === "FAILED"
  ) {
    return "text-red-400";
  }

  if (
    normalized === "REFUNDED"
  ) {
    return "text-purple-400";
  }

  return "text-yellow-400";
};

// ============================================================
// ADDRESS COMPONENT
// ============================================================

const AddressBlock = ({
  title,
  address,
}) => {
  if (!address) {
    return (
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b9953f]">
          {title}
        </p>

        <p className="text-sm text-gray-500">
          Address not available
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b9953f]">
        {title}
      </p>

      <div className="space-y-1 text-sm leading-6 text-gray-400">

        {address.name ||
          address.fullName ||
          address.contactName ? (
          <p className="font-semibold text-white">
            {address.name ||
              address.fullName ||
              address.contactName}
          </p>
        ) : null}

        {address.phone ? (
          <p>
            {address.phone}
          </p>
        ) : null}

        {address.email ? (
          <p>
            {address.email}
          </p>
        ) : null}

        {address.house ? (
          <p>
            {address.house}
          </p>
        ) : null}

        {address.addressLine1 ? (
          <p>
            {address.addressLine1}
          </p>
        ) : null}

        {address.addressLine2 ? (
          <p>
            {address.addressLine2}
          </p>
        ) : null}

        {address.street ? (
          <p>
            {address.street}
          </p>
        ) : null}

        {address.landmark ? (
          <p>
            {address.landmark}
          </p>
        ) : null}

        {(address.city ||
          address.state ||
          address.pinCode ||
          address.pincode) && (
          <p>
            {address.city || ""}
            {address.city &&
            address.state
              ? ", "
              : ""}
            {address.state || ""}
            {(address.city ||
              address.state) &&
            (address.pinCode ||
              address.pincode)
              ? " - "
              : ""}
            {address.pinCode ||
              address.pincode ||
              ""}
          </p>
        )}

        {address.country ? (
          <p>
            {address.country}
          </p>
        ) : null}

      </div>
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const Invoice = () => {
  const [invoice, setInvoice] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const orderId =
    getOrderIdFromPath();

  // ==========================================================
  // LOAD INVOICE
  // ==========================================================

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        if (!orderId) {
          throw new Error(
            "Invalid order ID."
          );
        }

        const token = getToken();

        if (!token) {
          throw new Error(
            "Please login to view your invoice."
          );
        }

        const response =
          await getMyInvoiceByOrder(
            orderId
          );

        /*
         * Axios response normally:
         *
         * response.data
         *
         * Backend may return:
         *
         * {
         *   invoice: {...}
         * }
         *
         * OR directly:
         *
         * {
         *   ...
         * }
         *
         * Handle both formats.
         */

        const responseData =
          response?.data || response;

        const invoiceData =
          responseData?.invoice ||
          responseData?.data ||
          responseData;

        if (!invoiceData) {
          throw new Error(
            "Invoice data was not found."
          );
        }

        setInvoice(invoiceData);
      } catch (err) {
        console.error(
          "Customer invoice error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load invoice."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [orderId]);

  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const handleDownload = () => {
    /*
     * Browser-native PDF flow.
     *
     * The print dialog allows:
     *
     * Destination -> Save as PDF
     */

    window.print();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-16 text-white">

        <div className="mx-auto max-w-5xl">

          <div className="animate-pulse">

            <div className="mx-auto h-8 w-56 rounded bg-white/10" />

            <div className="mx-auto mt-3 h-4 w-40 rounded bg-white/5" />

            <div className="mt-10 h-[700px] rounded-2xl border border-white/10 bg-white/[0.03]" />

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#080808] px-4 py-16 text-white">

        <div className="mx-auto max-w-lg">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-7 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-2xl">
              !
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Unable to Load Invoice
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              {error ||
                "Invoice could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/orders/${orderId}`
                )
              }
              className="mt-6 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Back to Order
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // INVOICE DATA
  // ==========================================================

  const shop =
    invoice.shop ||
    invoice.shopDetails ||
    {
      name: "BAG HEE BAG",
      address:
        "Kothari Milestone, Shop No. 2",
      city:
        "S.V. Road, Malad West, Mumbai",
      phone: "",
      email: "",
    };

  const invoiceNumber =
    invoice.invoiceNumber ||
    invoice.invoiceNo ||
    `BHB-INV-${String(
      invoice._id || orderId
    ).slice(-8).toUpperCase()}`;

  const invoiceDate =
    invoice.issuedAt ||
    invoice.invoiceDate ||
    invoice.createdAt;

  const orderDate =
    invoice.orderDate ||
    invoice.order?.createdAt ||
    invoice.createdAt;

  const billingAddress =
    invoice.billingAddress ||
    invoice.billing ||
    invoice.customerAddress ||
    null;

  const shippingAddress =
    invoice.shippingAddress ||
    invoice.shipping ||
    null;

  const items =
    Array.isArray(invoice.items)
      ? invoice.items
      : Array.isArray(
          invoice.orderItems
        )
      ? invoice.orderItems
      : [];

  const subtotal =
    invoice.subtotal ??
    invoice.amounts?.subtotal ??
    0;

  const productDiscount =
    invoice.productDiscount ??
    invoice.amounts?.productDiscount ??
    0;

  const couponDiscount =
    invoice.couponDiscount ??
    invoice.amounts?.couponDiscount ??
    0;

  const discount =
    invoice.discount ??
    invoice.totalDiscount ??
    invoice.amounts?.discount ??
    0;

  const shippingCharge =
    invoice.shippingCharge ??
    invoice.shippingCost ??
    invoice.amounts?.shippingCharge ??
    0;

  const tax =
    invoice.tax ??
    invoice.taxAmount ??
    invoice.amounts?.tax ??
    0;

  const totalAmount =
    invoice.totalAmount ??
    invoice.total ??
    invoice.amounts?.total ??
    0;

  const paymentStatus =
    invoice.paymentStatus ||
    invoice.payment?.status ||
    "PENDING";

  const paymentMethod =
    invoice.paymentMethod ||
    invoice.payment?.method ||
    "—";

  const orderStatus =
    invoice.orderStatus ||
    invoice.order?.orderStatus ||
    "";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ======================================================
          PRINT STYLES
      ====================================================== */}

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            html,
            body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            body {
              color: #111111 !important;
            }

            nav,
            header,
            footer,
            .no-print {
              display: none !important;
            }

            .invoice-page {
              min-height: auto !important;
              background: #ffffff !important;
              padding: 0 !important;
            }

            .invoice-paper {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #111111 !important;
            }

            .invoice-paper * {
              color: #111111 !important;
              border-color: #dddddd !important;
            }

            .gold-print {
              color: #8a6a20 !important;
            }

            .print-table-head {
              background: #f3f3f3 !important;
            }
          }
        `}
      </style>

      <div className="invoice-page min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">

        {/* ==================================================
            ACTION BAR
        ================================================== */}

        <div className="no-print mx-auto mb-6 flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/orders/${orderId}`
              )
            }
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Order
          </button>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-5 py-3 text-sm font-medium text-[#d4af37] transition hover:bg-[#d4af37]/20"
            >
              🖨
              <span>
                Print Invoice
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5c45a]"
            >
              ↓
              <span>
                Download Invoice
              </span>
            </button>

          </div>

        </div>

        {/* ==================================================
            INVOICE PAPER
        ================================================== */}

        <div className="invoice-paper mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#111] shadow-2xl shadow-black/50">

          {/* ==================================================
              TOP GOLD LINE
          ================================================== */}

          <div className="h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          <div className="p-6 sm:p-8 lg:p-10">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-8 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#d4af37]/5 text-sm font-bold tracking-wider text-[#d4af37]">
                    BHB
                  </div>

                  <div>

                    <h1 className="text-2xl font-semibold tracking-[0.2em] text-white">
                      BAG HEE BAG
                    </h1>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-gray-500">
                      LUXURY • STYLE • EVERYDAY
                    </p>

                  </div>

                </div>

                <div className="mt-5 space-y-1 text-sm leading-6 text-gray-400">

                  <p>
                    {shop.address ||
                      "Kothari Milestone, Shop No. 2"}
                  </p>

                  <p>
                    {shop.city ||
                      "S.V. Road, Malad West, Mumbai"}
                  </p>

                  {shop.phone && (
                    <p>
                      {shop.phone}
                    </p>
                  )}

                  {shop.email && (
                    <p>
                      {shop.email}
                    </p>
                  )}

                </div>

              </div>

              <div className="sm:text-right">

                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                  TAX INVOICE
                </p>

                <h2 className="mt-3 text-xl font-semibold text-white">
                  {invoiceNumber}
                </h2>

                <div className="mt-4 space-y-1 text-sm text-gray-400">

                  <p>
                    Invoice Date:{" "}
                    <span className="text-white">
                      {formatDate(
                        invoiceDate
                      )}
                    </span>
                  </p>

                  <p>
                    Order Date:{" "}
                    <span className="text-white">
                      {formatDateTime(
                        orderDate
                      )}
                    </span>
                  </p>

                  <p>
                    Order ID:{" "}
                    <span className="font-mono text-white">
                      #
                      {String(
                        invoice.orderId ||
                          invoice.order?._id ||
                          orderId
                      )
                        .slice(-10)
                        .toUpperCase()}
                    </span>
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                BILLING / SHIPPING
            ================================================= */}

            <div className="grid gap-8 border-b border-white/10 py-8 sm:grid-cols-2">

              <AddressBlock
                title="Bill To"
                address={
                  billingAddress
                }
              />

              <AddressBlock
                title="Ship To"
                address={
                  shippingAddress
                }
              />

            </div>

            {/* =================================================
                PAYMENT STATUS
            ================================================= */}

            <div className="flex flex-col gap-4 border-b border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {paymentMethod}
                </p>

              </div>

              <div className="sm:text-right">

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Payment Status
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${getStatusClass(
                    paymentStatus
                  )}`}
                >
                  {paymentStatus}
                </p>

              </div>

              {orderStatus && (
                <div className="sm:text-right">

                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Order Status
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${getStatusClass(
                      orderStatus
                    )}`}
                  >
                    {orderStatus}
                  </p>

                </div>
              )}

            </div>

            {/* =================================================
                ITEMS
            ================================================= */}

            <div className="py-8">

              <h2 className="mb-5 text-lg font-semibold">
                Invoice Items
              </h2>

              <div className="overflow-hidden rounded-xl border border-white/10">

                <table className="w-full border-collapse text-sm">

                  <thead className="print-table-head bg-white/[0.04]">

                    <tr>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Item
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Qty
                      </th>

                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Price
                      </th>

                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {items.length === 0 ? (
                      <tr>

                        <td
                          colSpan="4"
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No invoice items found.
                        </td>

                      </tr>
                    ) : (
                      items.map(
                        (item, index) => {
                          const quantity =
                            Number(
                              item.quantity ||
                                1
                            );

                          const price =
                            Number(
                              item.unitPrice ??
                                item.price ??
                                item.finalPrice ??
                                item.discountPrice ??
                                0
                            );

                          const lineTotal =
                            Number(
                              item.total ??
                                item.amount ??
                                price *
                                  quantity
                            );

                          return (
                            <tr
                              key={
                                item._id ||
                                item.product ||
                                index
                              }
                              className="border-t border-white/10"
                            >

                              <td className="px-4 py-4">

                                <p className="font-medium text-white">
                                  {item.name ||
                                    item.productName ||
                                    "Bag"}
                                </p>

                                {item.sku && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    SKU:{" "}
                                    {item.sku}
                                  </p>
                                )}

                              </td>

                              <td className="px-4 py-4 text-center text-gray-300">
                                {quantity}
                              </td>

                              <td className="px-4 py-4 text-right text-gray-300">
                                {formatAmount(
                                  price
                                )}
                              </td>

                              <td className="px-4 py-4 text-right font-medium text-white">
                                {formatAmount(
                                  lineTotal
                                )}
                              </td>

                            </tr>
                          );
                        }
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =================================================
                TOTALS
            ================================================= */}

            <div className="flex justify-end border-t border-white/10 pt-7">

              <div className="w-full max-w-md space-y-3 text-sm">

                <div className="flex justify-between gap-5">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="text-white">
                    {formatAmount(
                      subtotal
                    )}
                  </span>

                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between gap-5">

                    <span className="text-gray-500">
                      Product Discount
                    </span>

                    <span className="text-emerald-400">
                      -
                      {formatAmount(
                        productDiscount
                      )}
                    </span>

                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between gap-5">

                    <span className="text-gray-500">
                      Coupon Discount
                    </span>

                    <span className="text-emerald-400">
                      -
                      {formatAmount(
                        couponDiscount
                      )}
                    </span>

                  </div>
                )}

                {discount > 0 &&
                  productDiscount ===
                    0 &&
                  couponDiscount ===
                    0 && (
                    <div className="flex justify-between gap-5">

                      <span className="text-gray-500">
                        Discount
                      </span>

                      <span className="text-emerald-400">
                        -
                        {formatAmount(
                          discount
                        )}
                      </span>

                    </div>
                  )}

                <div className="flex justify-between gap-5">

                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="text-white">
                    {shippingCharge > 0
                      ? formatAmount(
                          shippingCharge
                        )
                      : "FREE"}
                  </span>

                </div>

                <div className="flex justify-between gap-5">

                  <span className="text-gray-500">
                    Tax
                  </span>

                  <span className="text-white">
                    {formatAmount(tax)}
                  </span>

                </div>

                <div className="my-4 border-t border-white/10" />

                <div className="flex items-end justify-between gap-5">

                  <span className="text-base font-semibold text-white">
                    Grand Total
                  </span>

                  <span className="text-2xl font-bold text-[#d4af37]">
                    {formatAmount(
                      totalAmount
                    )}
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mt-10 border-t border-white/10 pt-7 text-center">

              <p className="text-sm font-medium text-white">
                Thank you for shopping with BAG HEE BAG.
              </p>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                This is a computer-generated invoice
                and does not require a physical signature.
              </p>

              <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-[#b9953f]">
                BAG HEE BAG • LUXURY • STYLE • EVERYDAY
              </p>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default Invoice;