import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  getDashboardData,
} from "../../services/adminDashboardService";

/* =====================================================
   CONSTANTS
===================================================== */

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5D76E";
const DARK = "#0A0A0A";
const PANEL = "#111111";

const PIE_COLORS = [
  "#D4AF37",
  "#A88920",
  "#F5D76E",
  "#7A6418",
  "#C9A227",
  "#8E7621",
  "#E8C84A",
  "#665315",
];

/* =====================================================
   HELPERS
===================================================== */

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 0,
    }
  )}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatChartDate = (date) => {
  if (!date) return "";

  const parts = date.split("-");

  if (parts.length === 2) {
    return new Date(
      `${date}-01`
    ).toLocaleDateString(
      "en-IN",
      {
        month: "short",
        year: "2-digit",
      }
    );
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

/* =====================================================
   TOOLTIP
===================================================== */

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      style={{
        background: "#111",
        border: `1px solid ${GOLD}`,
        borderRadius: "12px",
        padding: "12px 14px",
        boxShadow:
          "0 12px 35px rgba(0,0,0,.35)",
      }}
    >
      <p
        style={{
          color: "#fff",
          marginBottom: "8px",
          fontSize: "12px",
        }}
      >
        {formatChartDate(label)}
      </p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          style={{
            color: "#ddd",
            fontSize: "12px",
            marginBottom: "4px",
          }}
        >
          <strong
            style={{
              color: GOLD_LIGHT,
            }}
          >
            {item.name}:
          </strong>{" "}
          {item.dataKey === "revenue"
            ? formatCurrency(item.value)
            : item.value}
        </div>
      ))}
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  icon,
  label,
  value,
  subtitle,
  growth,
  accent = GOLD,
}) => {
  const growthValue =
    Number(growth || 0);

  const growthPositive =
    growthValue >= 0;

  return (
    <div
      className="group"
      style={{
        background:
          "linear-gradient(145deg,#151515,#0d0d0d)",
        border:
          "1px solid rgba(212,175,55,.16)",
        borderRadius: "20px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        transition:
          "transform .25s ease, border-color .25s ease, box-shadow .25s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-4px)";
        event.currentTarget.style.borderColor =
          "rgba(212,175,55,.45)";
        event.currentTarget.style.boxShadow =
          "0 18px 50px rgba(0,0,0,.28)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";
        event.currentTarget.style.borderColor =
          "rgba(212,175,55,.16)";
        event.currentTarget.style.boxShadow =
          "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: accent,
          opacity: 0.04,
          right: -35,
          top: -35,
          filter: "blur(8px)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div>
          <p
            style={{
              color: "#999",
              fontSize: "12px",
              margin: 0,
              textTransform:
                "uppercase",
              letterSpacing:
                ".12em",
            }}
          >
            {label}
          </p>

          <h3
            style={{
              color: "#fff",
              fontSize: "27px",
              margin:
                "8px 0 5px",
              fontWeight: 700,
            }}
          >
            {value}
          </h3>

          {subtitle && (
            <p
              style={{
                color: "#777",
                fontSize: "11px",
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            background:
              "rgba(212,175,55,.08)",
            border:
              "1px solid rgba(212,175,55,.16)",
            fontSize: "20px",
          }}
        >
          {icon}
        </div>
      </div>

      {growth !== undefined &&
        growth !== null && (
          <div
            style={{
              marginTop: "14px",
              fontSize: "11px",
              color: growthPositive
                ? "#67d391"
                : "#ff7777",
            }}
          >
            {growthPositive
              ? "↗"
              : "↘"}{" "}
            {Math.abs(growthValue)}%{" "}
            <span
              style={{
                color: "#777",
              }}
            >
              vs previous period
            </span>
          </div>
        )}
    </div>
  );
};

/* =====================================================
   SECTION CARD
===================================================== */

const SectionCard = ({
  title,
  subtitle,
  children,
  right,
}) => {
  return (
    <section
      style={{
        background:
          "linear-gradient(145deg,#131313,#0c0c0c)",
        border:
          "1px solid rgba(212,175,55,.13)",
        borderRadius: "22px",
        padding: "20px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent:
            "space-between",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#fff",
              fontSize: "17px",
              margin: 0,
              fontWeight: 650,
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                color: "#777",
                fontSize: "11px",
                margin:
                  "5px 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {right}
      </div>

      {children}
    </section>
  );
};

/* =====================================================
   PAGE
===================================================== */

export default function AdminDashboard() {
  const [range, setRange] =
    useState("30d");

  const [customStart, setCustomStart] =
    useState("");

  const [customEnd, setCustomEnd] =
    useState("");

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ===================================================
     FILTERS
  =================================================== */

  const filters = useMemo(() => {
    const result = {
      range,
    };

    if (
      range === "custom" &&
      customStart
    ) {
      result.startDate =
        customStart;

      if (customEnd) {
        result.endDate =
          customEnd;
      }
    }

    return result;
  }, [
    range,
    customStart,
    customEnd,
  ]);

  /* ===================================================
     LOAD DATA
  =================================================== */

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await getDashboardData(
            filters
          );

        setDashboard(data);
      } catch (err) {
        console.error(
          "Admin Dashboard Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ===================================================
     DATA
  =================================================== */

  const summary =
    dashboard?.summary?.summary ||
    {};

  const sales =
    dashboard?.sales?.sales ||
    [];

  const orderAnalytics =
    dashboard?.orders?.orders ||
    [];

  const products =
    dashboard?.products?.products ||
    [];

  const categories =
    dashboard?.categories
      ?.categories || [];

  const customers =
    dashboard?.customers
      ?.customers || [];

  const activities =
    dashboard?.activity
      ?.activities || [];

  /* ===================================================
     SALES CHART
  =================================================== */

  const salesChartData =
    sales.map((item) => ({
      ...item,
      displayDate:
        formatChartDate(
          item.date
        ),
    }));

  /* ===================================================
     ORDER PIE DATA
  =================================================== */

  const orderPieData =
    orderAnalytics.map(
      (item) => ({
        name: formatStatus(
          item.status
        ),
        value: item.count,
      })
    );

  /* ===================================================
     CATEGORY CHART
  =================================================== */

  const categoryChartData =
    categories
      .slice(0, 7)
      .map((item) => ({
        name:
          item.name?.length > 18
            ? `${item.name.slice(
                0,
                18
              )}…`
            : item.name,
        revenue:
          item.revenue,
      }));

  /* ===================================================
     LOADING SCREEN
  =================================================== */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top,#211b08,#090909 38%,#050505)",
          color: "#fff",
          padding: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border:
                `2px solid rgba(212,175,55,.2)`,
              borderTopColor:
                GOLD,
              animation:
                "bhbSpin 1s linear infinite",
              margin:
                "0 auto 16px",
            }}
          />

          <p
            style={{
              color: "#aaa",
              fontSize: "13px",
            }}
          >
            Loading BHB dashboard...
          </p>

          <style>
            {`
              @keyframes bhbSpin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error && !dashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          padding: "40px 20px",
          color: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "80px auto",
            background: "#111",
            border:
              "1px solid rgba(255,90,90,.25)",
            borderRadius: "20px",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "15px",
            }}
          >
            ⚠️
          </div>

          <h2
            style={{
              margin: 0,
            }}
          >
            Dashboard Error
          </h2>

          <p
            style={{
              color: "#999",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            {error}
          </p>

          <button
            onClick={() =>
              loadDashboard()
            }
            style={{
              border: 0,
              borderRadius: "12px",
              padding:
                "11px 18px",
              background:
                GOLD,
              color: "#090909",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ===================================================
     MAIN
  =================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%,rgba(212,175,55,.08),transparent 28%), #080808",
        color: "#fff",
        padding:
          "24px clamp(14px,3vw,34px) 50px",
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
        }}
      >
        {/* ============================================
            HEADER
        ============================================ */}

        <div
          style={{
            display: "flex",
            alignItems:
              "flex-end",
            justifyContent:
              "space-between",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems:
                  "center",
                gap: "8px",
                border:
                  "1px solid rgba(212,175,55,.18)",
                background:
                  "rgba(212,175,55,.05)",
                borderRadius:
                  "999px",
                padding:
                  "7px 12px",
                marginBottom:
                  "12px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius:
                    "50%",
                  background:
                    GOLD,
                  boxShadow:
                    `0 0 12px ${GOLD}`,
                }}
              />

              <span
                style={{
                  color:
                    GOLD_LIGHT,
                  fontSize: "10px",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    ".16em",
                }}
              >
                BHB Admin
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(28px,4vw,42px)",
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing:
                  "-.04em",
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                color: "#888",
                fontSize: "13px",
                margin:
                  "10px 0 0",
              }}
            >
              Monitor sales, customers,
              products and store
              performance.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
              style={{
                border:
                  "1px solid rgba(212,175,55,.2)",
                background:
                  "rgba(255,255,255,.025)",
                color: "#ddd",
                borderRadius:
                  "12px",
                padding:
                  "10px 14px",
                cursor:
                  refreshing
                    ? "wait"
                    : "pointer",
                fontSize: "12px",
              }}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>
        </div>

        {/* ============================================
            FILTERS
        ============================================ */}

        <div
          style={{
            background:
              "rgba(255,255,255,.025)",
            border:
              "1px solid rgba(255,255,255,.07)",
            borderRadius: "16px",
            padding: "10px",
            marginBottom: "22px",
            display: "flex",
            gap: "7px",
            alignItems:
              "center",
            flexWrap: "wrap",
          }}
        >
          {[
            ["today", "Today"],
            ["7d", "7 Days"],
            ["30d", "30 Days"],
            ["6m", "6 Months"],
            ["1y", "1 Year"],
            ["custom", "Custom"],
          ].map(([value, label]) => {
            const active =
              range === value;

            return (
              <button
                key={value}
                onClick={() =>
                  setRange(value)
                }
                style={{
                  border: active
                    ? `1px solid ${GOLD}`
                    : "1px solid transparent",

                  background: active
                    ? "rgba(212,175,55,.12)"
                    : "transparent",

                  color: active
                    ? GOLD_LIGHT
                    : "#888",

                  borderRadius:
                    "10px",

                  padding:
                    "9px 13px",

                  fontSize:
                    "11px",

                  fontWeight:
                    active
                      ? 700
                      : 500,

                  cursor:
                    "pointer",
                }}
              >
                {label}
              </button>
            );
          })}

          {range === "custom" && (
            <>
              <input
                type="date"
                value={
                  customStart
                }
                onChange={(e) =>
                  setCustomStart(
                    e.target.value
                  )
                }
                style={{
                  background:
                    "#111",
                  color:
                    "#ddd",
                  border:
                    "1px solid rgba(255,255,255,.1)",
                  borderRadius:
                    "10px",
                  padding:
                    "9px 10px",
                  fontSize:
                    "11px",
                }}
              />

              <span
                style={{
                  color:
                    "#666",
                  fontSize:
                    "11px",
                }}
              >
                to
              </span>

              <input
                type="date"
                value={
                  customEnd
                }
                onChange={(e) =>
                  setCustomEnd(
                    e.target.value
                  )
                }
                style={{
                  background:
                    "#111",
                  color:
                    "#ddd",
                  border:
                    "1px solid rgba(255,255,255,.1)",
                  borderRadius:
                    "10px",
                  padding:
                    "9px 10px",
                  fontSize:
                    "11px",
                }}
              />
            </>
          )}
        </div>

        {error && (
          <div
            style={{
              background:
                "rgba(255,90,90,.06)",
              border:
                "1px solid rgba(255,90,90,.2)",
              color:
                "#ff9b9b",
              padding:
                "11px 14px",
              borderRadius:
                "12px",
              marginBottom:
                "20px",
              fontSize:
                "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* ============================================
            STAT CARDS
        ============================================ */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(190px,1fr))",
            gap: "14px",
            marginBottom:
              "20px",
          }}
        >
          <StatCard
            icon="₹"
            label="Revenue"
            value={formatCurrency(
              summary.totalRevenue
            )}
            subtitle="Net dashboard revenue"
            growth={
              summary.revenueGrowth
            }
          />

          <StatCard
            icon="🛍️"
            label="Orders"
            value={
              summary.totalOrders ||
              0
            }
            subtitle="Orders in selected period"
            growth={
              summary.orderGrowth
            }
          />

          <StatCard
            icon="👥"
            label="Customers"
            value={
              summary.totalCustomers ||
              0
            }
            subtitle={`+${summary.newCustomers || 0} new in period`}
          />

          <StatCard
            icon="👜"
            label="Products"
            value={
              summary.totalProducts ||
              0
            }
            subtitle={`${summary.activeProducts || 0} active products`}
          />

          <StatCard
            icon="⚠️"
            label="Low Stock"
            value={
              summary.lowStockProducts ||
              0
            }
            subtitle={`${summary.outOfStockProducts || 0} out of stock`}
          />

          <StatCard
            icon="✓"
            label="Delivered"
            value={
              summary.deliveredOrders ||
              0
            }
            subtitle="Successfully delivered"
          />
        </div>

        {/* ============================================
            REVENUE + ORDER STATUS
        ============================================ */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(0,2fr) minmax(300px,1fr)",
            gap: "20px",
            marginBottom:
              "20px",
          }}
          className="bhb-dashboard-grid"
        >
          <SectionCard
            title="Revenue Overview"
            subtitle="Revenue and order movement over the selected period"
          >
            <div
              style={{
                width: "100%",
                height: "330px",
              }}
            >
              {salesChartData.length >
              0 ? (
                <ResponsiveContainer>
                  <AreaChart
                    data={
                      salesChartData
                    }
                  >
                    <defs>
                      <linearGradient
                        id="bhbRevenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            GOLD
                          }
                          stopOpacity={
                            0.38
                          }
                        />

                        <stop
                          offset="100%"
                          stopColor={
                            GOLD
                          }
                          stopOpacity={
                            0
                          }
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="rgba(255,255,255,.06)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={
                        formatChartDate
                      }
                      tick={{
                        fill: "#777",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#777",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₹${Number(
                          value
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      }
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke={
                        GOLD
                      }
                      strokeWidth={
                        2.5
                      }
                      fill="url(#bhbRevenueGradient)"
                    />

                    <Area
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke={
                        GOLD_LIGHT
                      }
                      strokeWidth={
                        1.5
                      }
                      fill="transparent"
                      yAxisId="orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No sales data available for this period." />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Order Status"
            subtitle="Current order distribution"
          >
            <div
              style={{
                height: "300px",
                position:
                  "relative",
              }}
            >
              {orderPieData.length >
              0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={
                        orderPieData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={
                        65
                      }
                      outerRadius={
                        105
                      }
                      paddingAngle={
                        3
                      }
                    >
                      {orderPieData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                            stroke={
                              "#0d0d0d"
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background:
                          "#111",
                        border:
                          `1px solid ${GOLD}`,
                        borderRadius:
                          "10px",
                        color:
                          "#fff",
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        fontSize:
                          "10px",
                        color:
                          "#999",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No order data available." />
              )}
            </div>
          </SectionCard>
        </div>

        {/* ============================================
            CATEGORY + CUSTOMER
        ============================================ */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(0,1.5fr) minmax(0,1fr)",
            gap: "20px",
            marginBottom:
              "20px",
          }}
          className="bhb-dashboard-grid"
        >
          <SectionCard
            title="Category Performance"
            subtitle="Revenue generated by product category"
          >
            <div
              style={{
                width: "100%",
                height: "310px",
              }}
            >
              {categoryChartData.length >
              0 ? (
                <ResponsiveContainer>
                  <BarChart
                    data={
                      categoryChartData
                    }
                    layout="vertical"
                    margin={{
                      left: 15,
                      right: 20,
                    }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,.05)"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fill: "#777",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={105}
                      tick={{
                        fill: "#999",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        formatCurrency(
                          value
                        )
                      }
                      contentStyle={{
                        background:
                          "#111",
                        border:
                          `1px solid ${GOLD}`,
                        borderRadius:
                          "10px",
                      }}
                    />

                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill={GOLD}
                      radius={[
                        0,
                        7,
                        7,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No category sales available." />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Customer Growth"
            subtitle="New customer registrations"
          >
            <div
              style={{
                width: "100%",
                height: "310px",
              }}
            >
              {customers.length >
              0 ? (
                <ResponsiveContainer>
                  <AreaChart
                    data={
                      customers
                    }
                  >
                    <defs>
                      <linearGradient
                        id="bhbCustomerGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            GOLD_LIGHT
                          }
                          stopOpacity={
                            0.25
                          }
                        />

                        <stop
                          offset="100%"
                          stopColor={
                            GOLD_LIGHT
                          }
                          stopOpacity={
                            0
                          }
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="rgba(255,255,255,.05)"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={
                        formatChartDate
                      }
                      tick={{
                        fill: "#777",
                        fontSize: 9,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                      tick={{
                        fill: "#777",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) => [
                        value,
                        "Customers",
                      ]}
                      labelFormatter={
                        formatChartDate
                      }
                      contentStyle={{
                        background:
                          "#111",
                        border:
                          `1px solid ${GOLD}`,
                        borderRadius:
                          "10px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="customers"
                      name="Customers"
                      stroke={
                        GOLD_LIGHT
                      }
                      strokeWidth={
                        2
                      }
                      fill="url(#bhbCustomerGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No customer growth data." />
              )}
            </div>
          </SectionCard>
        </div>

        {/* ============================================
            TOP PRODUCTS
        ============================================ */}

        <SectionCard
          title="Top Selling Products"
          subtitle="Products generating the highest unit sales"
          right={
            <span
              style={{
                color:
                  GOLD_LIGHT,
                fontSize:
                  "10px",
              }}
            >
              TOP 10
            </span>
          }
        >
          {products.length ===
          0 ? (
            <EmptyState text="No product sales available for this period." />
          ) : (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(230px,1fr))",
                gap: "12px",
              }}
            >
              {products.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={
                      product.productId ||
                      index
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "12px",
                      padding:
                        "12px",
                      border:
                        "1px solid rgba(255,255,255,.06)",
                      borderRadius:
                        "14px",
                      background:
                        "rgba(255,255,255,.018)",
                    }}
                  >
                    <div
                      style={{
                        width:
                          "42px",
                        height:
                          "42px",
                        borderRadius:
                          "12px",
                        background:
                          "#1a1a1a",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        overflow:
                          "hidden",
                        flexShrink:
                          0,
                      }}
                    >
                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />
                      ) : (
                        <span>
                          👜
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        minWidth:
                          0,
                        flex: 1,
                      }}
                    >
                      <p
                        style={{
                          color:
                            "#ddd",
                          fontSize:
                            "12px",
                          margin:
                            "0 0 5px",
                          whiteSpace:
                            "nowrap",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {product.name}
                      </p>

                      <p
                        style={{
                          color:
                            "#777",
                          fontSize:
                            "10px",
                          margin: 0,
                        }}
                      >
                        {product.quantity}{" "}
                        units sold
                      </p>
                    </div>

                    <div
                      style={{
                        color:
                          GOLD_LIGHT,
                        fontSize:
                          "11px",
                        fontWeight:
                          700,
                      }}
                    >
                      {formatCurrency(
                        product.revenue
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </SectionCard>

        {/* ============================================
            STORE HEALTH
        ============================================ */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(190px,1fr))",
            gap: "14px",
            margin:
              "20px 0",
          }}
        >
          <MiniMetric
            label="Pending"
            value={
              summary.pendingOrders ||
              0
            }
            icon="⏳"
          />

          <MiniMetric
            label="Processing"
            value={
              summary.processingOrders ||
              0
            }
            icon="⚙️"
          />

          <MiniMetric
            label="Shipped"
            value={
              summary.shippedOrders ||
              0
            }
            icon="🚚"
          />

          <MiniMetric
            label="Returned"
            value={
              summary.returnedOrders ||
              0
            }
            icon="↩️"
          />

          <MiniMetric
            label="Refunded"
            value={
              summary.refundedOrders ||
              0
            }
            icon="💰"
          />

          <MiniMetric
            label="Inventory Units"
            value={
              summary.totalUnits ||
              0
            }
            icon="📦"
          />
        </div>

        {/* ============================================
            RECENT ACTIVITY
        ============================================ */}

        <SectionCard
          title="Recent Activity"
          subtitle="Latest activity across your BHB store"
        >
          {activities.length ===
          0 ? (
            <EmptyState text="No recent activity." />
          ) : (
            <div>
              {activities.map(
                (activity) => (
                  <div
                    key={
                      activity.id
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "13px",
                      padding:
                        "13px 0",
                      borderBottom:
                        "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    <ActivityIcon
                      type={
                        activity.type
                      }
                    />

                    <div
                      style={{
                        minWidth:
                          0,
                        flex: 1,
                      }}
                    >
                      <p
                        style={{
                          margin:
                            "0 0 4px",
                          color:
                            "#ddd",
                          fontSize:
                            "12px",
                          fontWeight:
                            600,
                        }}
                      >
                        {
                          activity.title
                        }
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "#777",
                          fontSize:
                            "11px",
                        }}
                      >
                        {
                          activity.description
                        }
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "right",
                        flexShrink:
                          0,
                      }}
                    >
                      {activity.amount !==
                        undefined && (
                        <div
                          style={{
                            color:
                              GOLD_LIGHT,
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                          }}
                        >
                          {formatCurrency(
                            activity.amount
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          color:
                            "#666",
                          fontSize:
                            "9px",
                          marginTop:
                            "3px",
                        }}
                      >
                        {formatDate(
                          activity.createdAt
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </SectionCard>

        {/* ============================================
            RESPONSIVE STYLE
        ============================================ */}

        <style>
          {`
            @media (max-width: 900px) {
              .bhb-dashboard-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 600px) {
              .bhb-dashboard-grid {
                grid-template-columns: 1fr !important;
              }
            }

            input[type="date"]::-webkit-calendar-picker-indicator {
              filter: invert(1);
              opacity: .7;
            }
          `}
        </style>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  text,
}) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: "180px",
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        textAlign: "center",
        color: "#666",
        fontSize: "12px",
        padding: "20px",
      }}
    >
      {text}
    </div>
  );
}

/* =====================================================
   MINI METRIC
===================================================== */

function MiniMetric({
  label,
  value,
  icon,
}) {
  return (
    <div
      style={{
        background:
          "#101010",
        border:
          "1px solid rgba(255,255,255,.06)",
        borderRadius:
          "16px",
        padding:
          "16px",
        display:
          "flex",
        alignItems:
          "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius:
            "12px",
          background:
            "rgba(212,175,55,.07)",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize:
            "17px",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color:
              "#777",
            fontSize:
              "10px",
            textTransform:
              "uppercase",
            letterSpacing:
              ".1em",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color:
              "#fff",
            fontSize:
              "19px",
            fontWeight:
              700,
            marginTop:
              "3px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ACTIVITY ICON
===================================================== */

function ActivityIcon({
  type,
}) {
  const icons = {
    order: "🛍️",
    customer: "👤",
    product: "👜",
  };

  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius:
          "13px",
        background:
          "rgba(212,175,55,.07)",
        border:
          "1px solid rgba(212,175,55,.12)",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        flexShrink:
          0,
      }}
    >
      {icons[type] ||
        "•"}
    </div>
  );
}