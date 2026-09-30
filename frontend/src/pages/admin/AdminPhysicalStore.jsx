import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminStoreSettings,
  updateAdminStoreSettings,
} from "../../services/storeService";

import {
  getOfflineProducts,
  createOfflineSale,
  getOfflineSales,
  getOfflineSaleById,
  getOfflineSummary,
} from "../../services/offlineSaleService";

const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
};

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

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const getToday = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    String(
      now.getMonth() + 1
    ).padStart(2, "0"),
    String(
      now.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

const emptySettings = {
  storeName: "BAG HEE BAG",
  storeCode: "BHB",
  phone: "",
  whatsapp: "",
  email: "",
  gstin: "",
  addressLine1:
    "Kothari Milestone, Shop No. 2",
  addressLine2:
    "S.V. Road, Malad West",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "",
  country: "India",
  currency: "INR",
  defaultTaxRate: 0,
  receiptFooter:
    "Thank you for shopping with BAG HEE BAG.",
  businessHours: [],
  isActive: true,
};

const AdminPhysicalStore = () => {
  const [activeTab, setActiveTab] =
    useState("pos");

  const [settings, setSettings] =
    useState(emptySettings);

  const [settingsLoading, setSettingsLoading] =
    useState(true);

  const [settingsSaving, setSettingsSaving] =
    useState(false);

  const [settingsMessage, setSettingsMessage] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [products, setProducts] =
    useState([]);

  const [productsLoading, setProductsLoading] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [selectedVariantId, setSelectedVariantId] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [cart, setCart] =
    useState([]);

  const [customerName, setCustomerName] =
    useState("Walk-in Customer");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [paymentStatus, setPaymentStatus] =
    useState("PAID");

  const [notes, setNotes] =
    useState("");

  const [saleLoading, setSaleLoading] =
    useState(false);

  const [saleMessage, setSaleMessage] =
    useState("");

  const [lastSale, setLastSale] =
    useState(null);

  const [summary, setSummary] =
    useState({
      totalSales: 0,
      totalRevenue: 0,
      totalDiscount: 0,
      totalTax: 0,
      itemsSold: 0,
    });

  const [paymentBreakdown, setPaymentBreakdown] =
    useState([]);

  const [recentSales, setRecentSales] =
    useState([]);

  const [sales, setSales] =
    useState([]);

  const [salesLoading, setSalesLoading] =
    useState(false);

  const [salesSearch, setSalesSearch] =
    useState("");

  const [salesPaymentMethod, setSalesPaymentMethod] =
    useState("");

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState(getToday());

  const [historyPage, setHistoryPage] =
    useState(1);

  const [historyPagination, setHistoryPagination] =
    useState({
      page: 1,
      limit: 15,
      total: 0,
      totalPages: 0,
    });

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);

      const data =
        await getAdminStoreSettings();

      if (data?.store) {
        setSettings({
          ...emptySettings,
          ...data.store,
        });
      }
    } catch (error) {
      console.error(
        "Store settings error:",
        error
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadSummary = async (
    date = selectedDate
  ) => {
    try {
      const data =
        await getOfflineSummary(
          date
        );

      setSummary(
        data?.summary || {
          totalSales: 0,
          totalRevenue: 0,
          totalDiscount: 0,
          totalTax: 0,
          itemsSold: 0,
        }
      );

      setPaymentBreakdown(
        data?.paymentBreakdown || []
      );

      setRecentSales(
        data?.recentSales || []
      );
    } catch (error) {
      console.error(
        "Offline summary error:",
        error
      );
    }
  };

  const loadSales = async () => {
    try {
      setSalesLoading(true);

      const data =
        await getOfflineSales({
          search: salesSearch,
          paymentMethod:
            salesPaymentMethod,
          page: historyPage,
          limit: 15,
        });

      setSales(
        data?.sales || []
      );

      setHistoryPagination(
        data?.pagination || {
          page: historyPage,
          limit: 15,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error(
        "Offline sales history error:",
        error
      );
    } finally {
      setSalesLoading(false);
    }
  };

  const searchProducts = async (
    search = productSearch
  ) => {
    try {
      setProductsLoading(true);

      const data =
        await getOfflineProducts({
          search,
          limit: 30,
        });

      setProducts(
        data?.products || []
      );
    } catch (error) {
      console.error(
        "Offline product search error:",
        error
      );

      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadSummary();
    loadSales();
  }, []);

  useEffect(() => {
    const timer =
      setTimeout(() => {
        searchProducts(
          productSearch
        );
      }, 350);

    return () =>
      clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    loadSummary(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadSales();
  }, [
    historyPage,
    salesPaymentMethod,
  ]);

  const selectedVariant = useMemo(() => {
    if (
      !selectedProduct ||
      !selectedVariantId
    ) {
      return null;
    }

    return (
      selectedProduct.variants?.find(
        (variant) =>
          String(variant._id) ===
          String(selectedVariantId)
      ) || null
    );
  }, [
    selectedProduct,
    selectedVariantId,
  ]);

  const getSelectedUnitPrice = () => {
    if (selectedVariant) {
      if (
        selectedVariant.discountPrice >
          0 &&
        selectedVariant.discountPrice <
          selectedVariant.price
      ) {
        return selectedVariant.discountPrice;
      }

      return selectedVariant.price;
    }

    if (
      selectedProduct?.discountPrice >
        0 &&
      selectedProduct.discountPrice <
        selectedProduct.price
    ) {
      return selectedProduct.discountPrice;
    }

    return (
      selectedProduct?.price || 0
    );
  };

  const addToCart = () => {
    if (!selectedProduct) {
      setSaleMessage(
        "Please select a product first."
      );
      return;
    }

    if (
      selectedProduct.hasVariants &&
      !selectedVariantId
    ) {
      setSaleMessage(
        "Please select a product variant."
      );
      return;
    }

    const safeQuantity = Math.floor(
      Number(quantity)
    );

    if (
      !safeQuantity ||
      safeQuantity < 1
    ) {
      setSaleMessage(
        "Quantity must be at least 1."
      );
      return;
    }

    const availableStock =
      selectedVariant
        ? selectedVariant.stock
        : selectedProduct.stock;

    if (
      safeQuantity >
      availableStock
    ) {
      setSaleMessage(
        `Only ${availableStock} item(s) available in stock.`
      );
      return;
    }

    const unitPrice =
      getSelectedUnitPrice();

    const existingIndex =
      cart.findIndex(
        (item) =>
          String(item.productId) ===
            String(selectedProduct._id) &&
          String(
            item.variantId || ""
          ) ===
            String(
              selectedVariantId || ""
            )
      );

    if (existingIndex !== -1) {
      const nextCart = [
        ...cart,
      ];

      const newQuantity =
        nextCart[existingIndex]
          .quantity +
        safeQuantity;

      if (
        newQuantity >
        availableStock
      ) {
        setSaleMessage(
          `Only ${availableStock} item(s) available in stock.`
        );
        return;
      }

      nextCart[
        existingIndex
      ] = {
        ...nextCart[
          existingIndex
        ],
        quantity:
          newQuantity,
        lineTotal:
          newQuantity *
          unitPrice,
      };

      setCart(nextCart);
    } else {
      setCart([
        ...cart,
        {
          productId:
            selectedProduct._id,

          variantId:
            selectedVariantId ||
            null,

          productName:
            selectedProduct.name,

          variantName:
            selectedVariant
              ?.variantName || "",

          sku:
            selectedVariant?.sku ||
            selectedProduct.sku ||
            "",

          image:
            selectedVariant?.image ||
            selectedProduct.image ||
            "",

          quantity:
            safeQuantity,

          unitPrice,

          lineTotal:
            safeQuantity *
            unitPrice,
        },
      ]);
    }

    setQuantity(1);
    setSaleMessage("");
  };

  const removeFromCart = (
    index
  ) => {
    setCart(
      cart.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const updateCartQuantity = (
    index,
    nextQuantity
  ) => {
    const item =
      cart[index];

    if (!item) {
      return;
    }

    const safeQuantity =
      Math.floor(
        Number(nextQuantity)
      );

    if (
      !safeQuantity ||
      safeQuantity < 1
    ) {
      removeFromCart(index);
      return;
    }

    const product =
      products.find(
        (productItem) =>
          String(
            productItem._id
          ) ===
          String(item.productId)
      );

    let availableStock = 0;

    if (product) {
      const variant =
        product.variants?.find(
          (variantItem) =>
            String(
              variantItem._id
            ) ===
            String(item.variantId)
        );

      availableStock =
        variant
          ? variant.stock
          : product.stock;
    }

    if (
      availableStock &&
      safeQuantity >
        availableStock
    ) {
      setSaleMessage(
        `Only ${availableStock} item(s) available.`
      );
      return;
    }

    const nextCart = [
      ...cart,
    ];

    nextCart[index] = {
      ...item,
      quantity:
        safeQuantity,
      lineTotal:
        safeQuantity *
        item.unitPrice,
    };

    setCart(nextCart);
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(
            item.lineTotal || 0
          ),
        0
      ),
    [cart]
  );

  const safeDiscount = Math.min(
    Math.max(
      Number(discount) || 0,
      0
    ),
    subtotal
  );

  const taxableAmount =
    Math.max(
      subtotal -
        safeDiscount,
      0
    );

  const taxRate =
    Number(
      settings.defaultTaxRate
    ) || 0;

  const tax =
    taxableAmount *
    (taxRate / 100);

  const grandTotal =
    taxableAmount + tax;

  const totalItems = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  const saveSettings =
    async (event) => {
      event.preventDefault();

      try {
        setSettingsSaving(true);
        setSettingsMessage("");

        const data =
          await updateAdminStoreSettings(
            settings
          );

        if (data?.store) {
          setSettings({
            ...emptySettings,
            ...data.store,
          });
        }

        setSettingsMessage(
          "Store settings saved successfully."
        );
      } catch (error) {
        console.error(
          "Save store settings error:",
          error
        );

        setSettingsMessage(
          error?.response?.data
            ?.message ||
            "Unable to save store settings."
        );
      } finally {
        setSettingsSaving(false);
      }
    };

  const completeSale =
    async () => {
      if (!cart.length) {
        setSaleMessage(
          "Add at least one product to the sale."
        );
        return;
      }

      try {
        setSaleLoading(true);
        setSaleMessage("");

        const data =
          await createOfflineSale({
            items: cart.map(
              (item) => ({
                productId:
                  item.productId,

                variantId:
                  item.variantId,

                quantity:
                  item.quantity,
              })
            ),

            customer: {
              name:
                customerName ||
                "Walk-in Customer",

              phone:
                customerPhone,

              email:
                customerEmail,
            },

            discount:
              safeDiscount,

            paymentMethod,

            paymentStatus,

            notes,
          });

        const sale =
          data?.sale;

        setLastSale(sale);
        setCart([]);
        setSelectedProduct(null);
        setSelectedVariantId("");
        setQuantity(1);
        setDiscount(0);
        setNotes("");
        setSaleMessage(
          "Sale completed successfully."
        );

        await Promise.all([
          loadSummary(selectedDate),
          loadSales(),
          searchProducts(
            productSearch
          ),
        ]);
      } catch (error) {
        console.error(
          "Create offline sale error:",
          error
        );

        setSaleMessage(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to complete sale."
        );
      } finally {
        setSaleLoading(false);
      }
    };

  const viewSale = async (
    id
  ) => {
    try {
      const data =
        await getOfflineSaleById(
          id
        );

      setSelectedSale(
        data?.sale || null
      );
    } catch (error) {
      console.error(
        "View offline sale error:",
        error
      );
    }
  };

  const printSale = (
    sale
  ) => {
    if (!sale) {
      return;
    }

    const popup =
      window.open(
        "",
        "_blank",
        "width=800,height=900"
      );

    if (!popup) {
      window.print();
      return;
    }

    const itemsHtml =
      sale.items
        ?.map(
          (item) => `
            <tr>
              <td>
                ${item.productName}
                ${
                  item.variantName
                    ? `<br><small>${item.variantName}</small>`
                    : ""
                }
              </td>
              <td>${item.quantity}</td>
              <td>₹${Number(
                item.unitPrice || 0
              ).toFixed(2)}</td>
              <td>₹${Number(
                item.lineTotal || 0
              ).toFixed(2)}</td>
            </tr>
          `
        )
        .join("") || "";

    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sale.saleNumber}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #111;
            }

            .receipt {
              max-width: 720px;
              margin: auto;
            }

            h1 {
              margin-bottom: 4px;
            }

            .muted {
              color: #666;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              margin: 7px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 25px;
            }

            th,
            td {
              border-bottom: 1px solid #ddd;
              padding: 10px 6px;
              text-align: left;
            }

            .total {
              font-size: 20px;
              font-weight: bold;
            }

            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="receipt">
            <h1>
              ${
                sale.storeSnapshot
                  ?.storeName ||
                "BAG HEE BAG"
              }
            </h1>

            <div class="muted">
              ${
                sale.storeSnapshot
                  ?.address || ""
              }
            </div>

            <div class="muted">
              ${
                sale.storeSnapshot
                  ?.phone || ""
              }
            </div>

            <hr />

            <div class="row">
              <strong>Sale No.</strong>
              <span>
                ${sale.saleNumber}
              </span>
            </div>

            <div class="row">
              <strong>Date</strong>
              <span>
                ${formatDateTime(
                  sale.createdAt
                )}
              </span>
            </div>

            <div class="row">
              <strong>Customer</strong>
              <span>
                ${
                  sale.customer
                    ?.name ||
                  "Walk-in Customer"
                }
              </span>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top:25px">
              <div class="row">
                <span>Subtotal</span>
                <strong>
                  ₹${Number(
                    sale.subtotal || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <div class="row">
                <span>Discount</span>
                <strong>
                  - ₹${Number(
                    sale.discount || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <div class="row">
                <span>
                  Tax (${Number(
                    sale.taxRate || 0
                  )}%)
                </span>
                <strong>
                  ₹${Number(
                    sale.tax || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <div class="row total">
                <span>Total</span>
                <span>
                  ₹${Number(
                    sale.grandTotal || 0
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div class="row">
              <strong>Payment</strong>
              <span>
                ${sale.paymentMethod}
              </span>
            </div>

            <div class="footer">
              ${
                sale.notes
                  ? `<p>${sale.notes}</p>`
                  : ""
              }

              <p>
                Thank you for shopping with BAG HEE BAG.
              </p>
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    popup.document.close();
  };

  const updateBusinessHour =
    (
      index,
      field,
      value
    ) => {
      const hours = [
        ...(settings.businessHours ||
          []),
      ];

      hours[index] = {
        ...hours[index],
        [field]: value,
      };

      setSettings({
        ...settings,
        businessHours: hours,
      });
    };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#d4af37]" />
          <p className="text-sm text-white/60">
            Loading physical store...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Physical Store & Offline Management
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Manage your physical BAG HEE BAG
              store, record offline sales,
              automatically update inventory,
              and generate printable receipts.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:border-[#d4af37]/40 hover:bg-white/[0.07] lg:w-auto"
          >
            ← Back to Admin
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Today's Sales
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {summary.totalSales}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Today's Revenue
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#d4af37]">
              {formatCurrency(
                summary.totalRevenue
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Items Sold
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {summary.itemsSold}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Tax Collected
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(
                summary.totalTax
              )}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2">
          {[
            ["pos", "Offline POS"],
            ["history", "Sales History"],
            ["store", "Store Settings"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setActiveTab(value)
                }
                className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                  activeTab === value
                    ? "bg-[#d4af37] text-black"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {activeTab === "pos" && (
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Create Offline Sale
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Search products and add them
                  directly to the physical store
                  bill.
                </p>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
                  Search Product
                </label>

                <input
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by product name, SKU, brand or variant..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/60"
                />
              </div>

              {productsLoading && (
                <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
                  Searching products...
                </div>
              )}

              {products.length > 0 && (
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  {products
                    .slice(0, 8)
                    .map(
                      (product) => (
                        <button
                          key={
                            product._id
                          }
                          type="button"
                          onClick={() => {
                            setSelectedProduct(
                              product
                            );

                            setSelectedVariantId(
                              ""
                            );

                            setSaleMessage(
                              ""
                            );
                          }}
                          className={`flex gap-3 rounded-2xl border p-3 text-left transition ${
                            String(
                              selectedProduct?._id
                            ) ===
                            String(
                              product._id
                            )
                              ? "border-[#d4af37]/60 bg-[#d4af37]/[0.07]"
                              : "border-white/10 bg-white/[0.025] hover:border-white/20"
                          }`}
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xl">
                                👜
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              SKU:{" "}
                              {product.sku ||
                                "—"}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#d4af37]">
                              {formatCurrency(
                                product.discountPrice >
                                  0 &&
                                  product.discountPrice <
                                    product.price
                                  ? product.discountPrice
                                  : product.price
                              )}
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              {product.hasVariants
                                ? `${product.variants.length} variants`
                                : `${product.stock} in stock`}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                </div>
              )}

              {selectedProduct && (
                <div className="mb-6 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/[0.035] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      {selectedProduct.image ? (
                        <img
                          src={
                            selectedProduct.image
                          }
                          alt={
                            selectedProduct.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">
                          👜
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {
                          selectedProduct.name
                        }
                      </h3>

                      <p className="mt-1 text-xs text-white/45">
                        SKU:{" "}
                        {selectedProduct.sku ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  {selectedProduct.hasVariants && (
                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
                        Select Variant
                      </label>

                      <select
                        value={
                          selectedVariantId
                        }
                        onChange={(
                          event
                        ) =>
                          setSelectedVariantId(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                      >
                        <option value="">
                          Select variant
                        </option>

                        {selectedProduct.variants?.map(
                          (variant) => (
                            <option
                              key={
                                variant._id
                              }
                              value={
                                variant._id
                              }
                              disabled={
                                variant.stock <=
                                0
                              }
                            >
                              {variant.variantName ||
                                variant.name ||
                                "Variant"}{" "}
                              — Stock:{" "}
                              {
                                variant.stock
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/45">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          quantity
                        }
                        onChange={(
                          event
                        ) =>
                          setQuantity(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        addToCart
                      }
                      className="self-end rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e2c15b]"
                    >
                      Add to Bill
                    </button>
                  </div>
                </div>
              )}

              {cart.length > 0 ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">
                      Current Bill
                    </h3>

                    <span className="text-xs text-white/40">
                      {totalItems} item(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cart.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={`${item.productId}-${item.variantId || "base"}`}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                          <div className="flex gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                              {item.image ? (
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.productName
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  👜
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {
                                  item.productName
                                }
                              </p>

                              {item.variantName && (
                                <p className="mt-1 text-xs text-white/40">
                                  {
                                    item.variantName
                                  }
                                </p>
                              )}

                              <p className="mt-1 text-xs text-white/40">
                                {formatCurrency(
                                  item.unitPrice
                                )}{" "}
                                each
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  index
                                )
                              }
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <input
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(
                                event
                              ) =>
                                updateCartQuantity(
                                  index,
                                  event.target
                                    .value
                                )
                              }
                              className="w-24 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                            />

                            <span className="font-semibold text-[#d4af37]">
                              {formatCurrency(
                                item.lineTotal
                              )}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
                  <div className="text-4xl">
                    🛍️
                  </div>

                  <p className="mt-3 font-medium">
                    No items in current bill
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    Search a product above to
                    start a physical-store sale.
                  </p>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="text-lg font-semibold">
                  Customer
                </h2>

                <div className="mt-4 space-y-3">
                  <input
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value
                      )
                    }
                    placeholder="Customer name"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />

                  <input
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value
                      )
                    }
                    placeholder="Phone number"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />

                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(event) =>
                      setCustomerEmail(
                        event.target.value
                      )
                    }
                    placeholder="Email (optional)"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="text-lg font-semibold">
                  Payment
                </h2>

                <div className="mt-4 space-y-3">
                  <select
                    value={
                      paymentMethod
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="CASH">
                      Cash
                    </option>
                    <option value="UPI">
                      UPI
                    </option>
                    <option value="CARD">
                      Card
                    </option>
                    <option value="OTHER">
                      Other
                    </option>
                  </select>

                  <select
                    value={
                      paymentStatus
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentStatus(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="PAID">
                      Paid
                    </option>
                    <option value="PENDING">
                      Pending
                    </option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      discount
                    }
                    onChange={(
                      event
                    ) =>
                      setDiscount(
                        event.target
                          .value
                      )
                    }
                    placeholder="Discount amount"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />

                  <textarea
                    value={notes}
                    onChange={(
                      event
                    ) =>
                      setNotes(
                        event.target
                          .value
                      )
                    }
                    rows="3"
                    placeholder="Sale notes..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-[#d4af37]/20 bg-[#d4af37]/[0.035] p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-white/60">
                    <span>Discount</span>
                    <span>
                      -{" "}
                      {formatCurrency(
                        safeDiscount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-white/60">
                    <span>
                      Tax ({taxRate}%)
                    </span>
                    <span>
                      {formatCurrency(
                        tax
                      )}
                    </span>
                  </div>

                  <div className="my-3 border-t border-white/10" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#d4af37]">
                      {formatCurrency(
                        grandTotal
                      )}
                    </span>
                  </div>
                </div>

                {saleMessage && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                    {saleMessage}
                  </div>
                )}

                <button
                  type="button"
                  disabled={
                    saleLoading ||
                    cart.length ===
                      0
                  }
                  onClick={
                    completeSale
                  }
                  className="mt-5 w-full rounded-xl bg-[#d4af37] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e2c15b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saleLoading
                    ? "Processing Sale..."
                    : "Complete Offline Sale"}
                </button>
              </section>

              {lastSale && (
                <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
                  <p className="text-xs uppercase tracking-wider text-emerald-300">
                    Sale Completed
                  </p>

                  <h3 className="mt-2 text-lg font-semibold">
                    {
                      lastSale.saleNumber
                    }
                  </h3>

                  <p className="mt-1 text-sm text-white/50">
                    {formatCurrency(
                      lastSale.grandTotal
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      printSale(
                        lastSale
                      )
                    }
                    className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium hover:bg-white/[0.08]"
                  >
                    🖨 Print Receipt
                  </button>
                </section>
              )}
            </aside>
          </div>
        )}

        {activeTab === "history" && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Offline Sales History
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  View and print physical-store
                  sales.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={
                    salesSearch
                  }
                  onChange={(
                    event
                  ) => {
                    setSalesSearch(
                      event.target
                        .value
                    );
                    setHistoryPage(
                      1
                    );
                  }}
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      loadSales();
                    }
                  }}
                  placeholder="Search sale/customer..."
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                />

                <select
                  value={
                    salesPaymentMethod
                  }
                  onChange={(
                    event
                  ) => {
                    setSalesPaymentMethod(
                      event.target
                        .value
                    );
                    setHistoryPage(
                      1
                    );
                  }}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                >
                  <option value="">
                    All Payments
                  </option>
                  <option value="CASH">
                    Cash
                  </option>
                  <option value="UPI">
                    UPI
                  </option>
                  <option value="CARD">
                    Card
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>
            </div>

            {salesLoading ? (
              <div className="py-16 text-center text-sm text-white/40">
                Loading sales...
              </div>
            ) : sales.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <div className="text-4xl">
                  🧾
                </div>

                <p className="mt-3 font-medium">
                  No offline sales found
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Completed physical-store sales
                  will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/35">
                        <th className="px-4 py-3">
                          Sale
                        </th>
                        <th className="px-4 py-3">
                          Customer
                        </th>
                        <th className="px-4 py-3">
                          Amount
                        </th>
                        <th className="px-4 py-3">
                          Payment
                        </th>
                        <th className="px-4 py-3">
                          Sold By
                        </th>
                        <th className="px-4 py-3">
                          Date
                        </th>
                        <th className="px-4 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {sales.map(
                        (sale) => (
                          <tr
                            key={
                              sale._id
                            }
                            className="border-b border-white/[0.06] text-sm"
                          >
                            <td className="px-4 py-4 font-medium">
                              {
                                sale.saleNumber
                              }
                            </td>

                            <td className="px-4 py-4">
                              <div>
                                {
                                  sale
                                    .customer
                                    ?.name
                                }
                              </div>

                              {sale
                                .customer
                                ?.phone && (
                                <div className="mt-1 text-xs text-white/35">
                                  {
                                    sale
                                      .customer
                                      .phone
                                  }
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4 font-semibold text-[#d4af37]">
                              {formatCurrency(
                                sale.grandTotal
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs">
                                {
                                  sale.paymentMethod
                                }
                              </span>
                            </td>

                            <td className="px-4 py-4 text-white/60">
                              {sale
                                .soldBy
                                ?.name ||
                                sale
                                  .soldBy
                                  ?.username ||
                                "Admin"}
                            </td>

                            <td className="px-4 py-4 text-white/50">
                              {formatDateTime(
                                sale.createdAt
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    viewSale(
                                      sale._id
                                    )
                                  }
                                  className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/[0.06]"
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    printSale(
                                      sale
                                    )
                                  }
                                  className="rounded-lg border border-[#d4af37]/30 px-3 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
                                >
                                  Print
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {historyPagination.totalPages >
                  1 && (
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-white/35">
                      Page{" "}
                      {
                        historyPagination.page
                      }{" "}
                      of{" "}
                      {
                        historyPagination.totalPages
                      }
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={
                          historyPage <=
                          1
                        }
                        onClick={() =>
                          setHistoryPage(
                            (page) =>
                              Math.max(
                                page -
                                  1,
                                1
                              )
                          )
                        }
                        className="rounded-lg border border-white/10 px-4 py-2 text-xs disabled:opacity-30"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          historyPage >=
                          historyPagination.totalPages
                        }
                        onClick={() =>
                          setHistoryPage(
                            (page) =>
                              page +
                              1
                          )
                        }
                        className="rounded-lg border border-white/10 px-4 py-2 text-xs disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activeTab === "store" && (
          <form
            onSubmit={
              saveSettings
            }
            className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
          >
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
              <h2 className="text-xl font-semibold">
                Store Information
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "storeName",
                    "Store Name",
                  ],
                  [
                    "storeCode",
                    "Store Code",
                  ],
                  [
                    "phone",
                    "Phone",
                  ],
                  [
                    "whatsapp",
                    "WhatsApp",
                  ],
                  [
                    "email",
                    "Email",
                  ],
                  [
                    "gstin",
                    "GSTIN",
                  ],
                  [
                    "city",
                    "City",
                  ],
                  [
                    "state",
                    "State",
                  ],
                  [
                    "pincode",
                    "Pincode",
                  ],
                  [
                    "country",
                    "Country",
                  ],
                ].map(
                  ([
                    field,
                    label,
                  ]) => (
                    <div
                      key={
                        field
                      }
                    >
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                        {label}
                      </label>

                      <input
                        value={
                          settings[
                            field
                          ] || ""
                        }
                        onChange={(
                          event
                        ) =>
                          setSettings(
                            {
                              ...settings,
                              [field]:
                                event
                                  .target
                                  .value,
                            }
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                      />
                    </div>
                  )
                )}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                    Address Line 1
                  </label>

                  <input
                    value={
                      settings.addressLine1 ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setSettings(
                        {
                          ...settings,
                          addressLine1:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                    Address Line 2
                  </label>

                  <input
                    value={
                      settings.addressLine2 ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setSettings(
                        {
                          ...settings,
                          addressLine2:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                    Default Tax Rate %
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                      settings.defaultTaxRate ??
                      0
                    }
                    onChange={(
                      event
                    ) =>
                      setSettings(
                        {
                          ...settings,
                          defaultTaxRate:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                    Currency
                  </label>

                  <input
                    value={
                      settings.currency ||
                      "INR"
                    }
                    onChange={(
                      event
                    ) =>
                      setSettings(
                        {
                          ...settings,
                          currency:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/40">
                    Receipt Footer
                  </label>

                  <textarea
                    rows="3"
                    value={
                      settings.receiptFooter ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setSettings(
                        {
                          ...settings,
                          receiptFooter:
                            event.target
                              .value,
                        }
                      )
                    }
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
              <h2 className="text-xl font-semibold">
                Business Hours
              </h2>

              <div className="mt-5 space-y-3">
                {(
                  settings.businessHours ||
                  []
                ).map(
                  (
                    hour,
                    index
                  ) => (
                    <div
                      key={
                        hour.day
                      }
                      className="rounded-2xl border border-white/10 bg-black/20 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {hour.day}
                        </span>

                        <label className="flex items-center gap-2 text-xs text-white/45">
                          <input
                            type="checkbox"
                            checked={
                              !!hour.closed
                            }
                            onChange={(
                              event
                            ) =>
                              updateBusinessHour(
                                index,
                                "closed",
                                event
                                  .target
                                  .checked
                              )
                            }
                          />
                          Closed
                        </label>
                      </div>

                      {!hour.closed && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            value={
                              hour.open ||
                              "10:00"
                            }
                            onChange={(
                              event
                            ) =>
                              updateBusinessHour(
                                index,
                                "open",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                          />

                          <input
                            type="time"
                            value={
                              hour.close ||
                              "21:00"
                            }
                            onChange={(
                              event
                            ) =>
                              updateBusinessHour(
                                index,
                                "close",
                                event
                                  .target
                                  .value
                              )
                            }
                            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {settingsMessage && (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/65">
                  {
                    settingsMessage
                  }
                </div>
              )}

              <button
                type="submit"
                disabled={
                  settingsSaving
                }
                className="mt-5 w-full rounded-xl bg-[#d4af37] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e2c15b] disabled:opacity-40"
              >
                {settingsSaving
                  ? "Saving..."
                  : "Save Store Settings"}
              </button>
            </section>
          </form>
        )}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Payment Breakdown
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Physical-store payment collection
                for {selectedDate}.
              </p>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(
                event
              ) =>
                setSelectedDate(
                  event.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {paymentBreakdown.length ===
            0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/35">
                No payment data for this date.
              </div>
            ) : (
              paymentBreakdown.map(
                (payment) => (
                  <div
                    key={
                      payment._id
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-wider text-white/35">
                      {
                        payment._id
                      }
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#d4af37]">
                      {formatCurrency(
                        payment.amount
                      )}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {
                        payment.count
                      }{" "}
                      transaction(s)
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#d4af37]">
                    Offline Sale
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    {
                      selectedSale.saleNumber
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedSale(
                      null
                    )
                  }
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/35">
                      Customer
                    </p>

                    <p className="mt-1 text-sm">
                      {
                        selectedSale
                          .customer
                          ?.name
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/35">
                      Phone
                    </p>

                    <p className="mt-1 text-sm">
                      {
                        selectedSale
                          .customer
                          ?.phone ||
                        "—"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/35">
                      Payment
                    </p>

                    <p className="mt-1 text-sm">
                      {
                        selectedSale.paymentMethod
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/35">
                      Date
                    </p>

                    <p className="mt-1 text-sm">
                      {formatDateTime(
                        selectedSale.createdAt
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {selectedSale.items?.map(
                  (item) => (
                    <div
                      key={
                        item._id
                      }
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {
                            item.productName
                          }
                        </p>

                        {item.variantName && (
                          <p className="mt-1 text-xs text-white/40">
                            {
                              item.variantName
                            }
                          </p>
                        )}

                        <p className="mt-1 text-xs text-white/35">
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      <p className="font-semibold text-[#d4af37]">
                        {formatCurrency(
                          item.lineTotal
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between text-white/55">
                  <span>
                    Subtotal
                  </span>
                  <span>
                    {formatCurrency(
                      selectedSale.subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-white/55">
                  <span>
                    Discount
                  </span>
                  <span>
                    -{" "}
                    {formatCurrency(
                      selectedSale.discount
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-white/55">
                  <span>
                    Tax
                  </span>
                  <span>
                    {formatCurrency(
                      selectedSale.tax
                    )}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-lg font-semibold">
                  <span>
                    Grand Total
                  </span>

                  <span className="text-[#d4af37]">
                    {formatCurrency(
                      selectedSale.grandTotal
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  printSale(
                    selectedSale
                  )
                }
                className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-semibold text-black"
              >
                🖨 Print Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPhysicalStore;