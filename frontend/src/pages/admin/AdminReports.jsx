import {
  useEffect,
  useState,
} from "react";

import {
  getAllReports,
} from "../../services/reportService";

const money = (value) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(Number(value || 0));

export default function AdminReports() {
  const [
    range,
    setRange,
  ] = useState("30d");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    summary,
    setSummary,
  ] = useState({});

  const [
    sales,
    setSales,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    customers,
    setCustomers,
  ] = useState([]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        salesResponse,
        productsResponse,
        categoriesResponse,
        customersResponse,
      ] = await getAllReports({
        range,
      });

      setSummary(
        summaryResponse?.data
          ?.summary || {}
      );

      setSales(
        salesResponse?.data?.sales ||
          []
      );

      setProducts(
        productsResponse?.data
          ?.products || []
      );

      setCategories(
        categoriesResponse
          ?.data?.categories || []
      );

      setCustomers(
        customersResponse
          ?.data?.customers || []
      );
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [range]);

  const cards = [
    [
      "Revenue",
      money(summary.revenue),
      "💰",
    ],

    [
      "Orders",
      summary.orders || 0,
      "📦",
    ],

    [
      "Average Order",
      money(
        summary.averageOrderValue
      ),
      "🧾",
    ],

    [
      "Tax Collected",
      money(
        summary.taxCollected
      ),
      "🏷️",
    ],

    [
      "Shipping Revenue",
      money(
        summary.shippingRevenue
      ),
      "🚚",
    ],

    [
      "Total Discount",
      money(
        summary.totalDiscount
      ),
      "🎁",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            
            <h1 className="mt-2 text-3xl font-semibold">
              Sales & Financial Reports
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-neutral-400">
              Revenue, orders, discounts,
              tax, shipping, products and
              customer performance.
            </p>
          </div>

          <select
            value={range}
            onChange={(event) =>
              setRange(
                event.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none"
          >
            <option value="today">
              Today
            </option>

            <option value="7d">
              Last 7 Days
            </option>

            <option value="30d">
              Last 30 Days
            </option>

            <option value="6m">
              Last 6 Months
            </option>

            <option value="1y">
              Last 1 Year
            </option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-neutral-500">
            Loading reports...
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(
                ([label, value, icon]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-[#d4af37]/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-neutral-500">
                        {label}
                      </span>

                      <span className="text-xl">
                        {icon}
                      </span>
                    </div>

                    <p className="mt-5 text-2xl font-semibold text-[#e4c76b]">
                      {value}
                    </p>
                  </div>
                )
              )}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">
                    Sales Overview
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Revenue and order activity
                  </p>
                </div>

                <div className="space-y-3">
                  {sales.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No sales data available.
                    </p>
                  ) : (
                    sales
                      .slice(-10)
                      .map(
                        (item) => (
                          <div
                            key={item.date}
                            className="rounded-2xl border border-white/5 bg-black/20 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-500">
                                {
                                  item.date
                                }
                              </span>

                              <span className="text-sm font-semibold text-[#e4c76b]">
                                {money(
                                  item.revenue
                                )}
                              </span>
                            </div>

                            <div className="mt-3 flex justify-between text-xs text-neutral-500">
                              <span>
                                {
                                  item.orders
                                }{" "}
                                orders
                              </span>

                              <span>
                                Tax{" "}
                                {money(
                                  item.tax
                                )}
                              </span>

                              <span>
                                Discount{" "}
                                {money(
                                  item.discounts
                                )}
                              </span>
                            </div>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">
                    Category Sales
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Revenue generated by category
                  </p>
                </div>

                <div className="space-y-3">
                  {categories.length ===
                  0 ? (
                    <p className="text-sm text-neutral-500">
                      No category data available.
                    </p>
                  ) : (
                    categories
                      .slice(0, 10)
                      .map(
                        (
                          category
                        ) => (
                          <div
                            key={
                              String(
                                category.categoryId
                              )
                            }
                            className="rounded-2xl border border-white/5 bg-black/20 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {
                                  category.name
                                }
                              </span>

                              <span className="text-sm font-semibold text-[#e4c76b]">
                                {money(
                                  category.revenue
                                )}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-neutral-500">
                              {
                                category.quantity
                              }{" "}
                              units sold
                            </p>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">
                    Top Products
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Highest revenue products
                  </p>
                </div>

                <div className="space-y-3">
                  {products.length ===
                  0 ? (
                    <p className="text-sm text-neutral-500">
                      No product data available.
                    </p>
                  ) : (
                    products
                      .slice(0, 10)
                      .map(
                        (
                          product,
                          index
                        ) => (
                          <div
                            key={
                              String(
                                product.productId ||
                                  index
                              )
                            }
                            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-3"
                          >
                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="h-12 w-12 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-xs text-neutral-600">
                                BHB
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-neutral-500">
                                {
                                  product.quantity
                                }{" "}
                                units
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-[#e4c76b]">
                              {money(
                                product.revenue
                              )}
                            </span>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">
                    Top Customers
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Customers by total spending
                  </p>
                </div>

                <div className="space-y-3">
                  {customers.length ===
                  0 ? (
                    <p className="text-sm text-neutral-500">
                      No customer data available.
                    </p>
                  ) : (
                    customers
                      .slice(0, 10)
                      .map(
                        (
                          customer,
                          index
                        ) => (
                          <div
                            key={
                              String(
                                customer.customerId ||
                                  index
                              )
                            }
                            className="rounded-2xl border border-white/5 bg-black/20 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {
                                    customer.name
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-neutral-600">
                                  {
                                    customer.email
                                  }
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-semibold text-[#e4c76b]">
                                {money(
                                  customer.spending
                                )}
                              </p>
                            </div>

                            <p className="mt-3 text-xs text-neutral-500">
                              {
                                customer.orders
                              }{" "}
                              orders • Avg.{" "}
                              {money(
                                customer.averageOrderValue
                              )}
                            </p>
                          </div>
                        )
                      )
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}