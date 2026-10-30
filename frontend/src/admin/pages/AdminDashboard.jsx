import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Search,
  Refresh,
  Inventory2Outlined,
  CategoryOutlined,
} from "@mui/icons-material";

import MailOutlinedIcon from "@mui/icons-material/MailOutlined";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ---------------------------------------------------------------
// Adjust these import paths to match where your service files live.
// ---------------------------------------------------------------
import customerService from "../service/customer.service";
import productService from "../service/product.service";
import categoryService from "../service/category.service";
import contactService from "../service/contact.service";

// ---------- Orders API (same approach as OrderManagement / OrderTable) ----------
const ORDERS_API = "http://localhost:5000/api/orders";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function ordersPost(path, body = {}) {
  const response = await fetch(`${ORDERS_API}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result;
}

// ---------- Colors ----------
const BROWN = "#947458";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";
const YELLOW = "#F5B301";

const REFRESH_MS = 60_000; // auto refresh every minute

// ---------- Theme ----------
const makeTheme = (darkMode) => ({
  dark: darkMode,
  page: darkMode ? "#1C1917" : BG,
  card: darkMode ? "#292421" : "#FFFFFF",
  text: darkMode ? "#F5F0EB" : "#222222",
  muted: darkMode ? "#B8AAA0" : "#777777",
  border: darkMode ? "#403832" : "#EEEEEE",
  soft: darkMode ? "#332D28" : BG,
  divider: darkMode ? "#403832" : "#eee",
  tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
  strong: darkMode ? "#FFFFFF" : BROWN,
});

const ThemeContext = createContext(makeTheme(false));

// ---------- Helpers ----------
const DAY_MS = 86_400_000;

const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const compact = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num(value));

const money = (value) =>
  `$${num(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const moneyCompact = (value) => `$${compact(value)}`;

const pctChange = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

const formatPct = (value) => `${Math.abs(value).toFixed(1)}%`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} | ${time}`;
};

// Unwrap { success, data: {...} } or plain responses.
const unwrap = (res) => {
  if (res && typeof res === "object" && "data" in res && res.data != null) {
    return res.data;
  }
  return res ?? {};
};

// Find an array in a response no matter how the backend wraps it.
const pickList = (res, keys = []) => {
  const root = unwrap(res);
  if (Array.isArray(root)) return root;
  for (const key of [...keys, "rows", "items", "data", "list"]) {
    if (Array.isArray(root?.[key])) return root[key];
  }
  const inner = unwrap(root);
  if (Array.isArray(inner)) return inner;
  for (const key of keys) {
    if (Array.isArray(inner?.[key])) return inner[key];
  }
  return [];
};

const orderNumber = (order) =>
  order.orderId || `#ORD${String(order.id ?? "").padStart(4, "0")}`;

const isCancelled = (order) =>
  ["cancelled", "canceled"].includes(String(order.status || "").toLowerCase());

const isPaid = (order) =>
  ["paid", "completed", "success", "succeeded"].includes(
    String(order.paymentStatus || "").toLowerCase(),
  );

// ---------- Reusable pieces ----------
function Card({ children, sx }) {
  const t = useContext(ThemeContext);
  return (
    <Box
      sx={{
        bgcolor: t.card,
        color: t.text,
        border: `1px solid ${t.border}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: t.dark
          ? "0 2px 8px rgba(0,0,0,0.25)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "background-color 0.25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function CardHeader({ title, subtitle, action, mb = 2 }) {
  const t = useContext(ThemeContext);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 1,
        mb,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: t.muted }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

function MenuButton() {
  const t = useContext(ThemeContext);
  return (
    <IconButton
      size="small"
      aria-label="More"
      sx={{ mt: -0.5, mr: -0.5, ...(t.dark && { color: t.muted }) }}
    >
      <MoreVert fontSize="small" />
    </IconButton>
  );
}

function IconBox({ size = 44, children }) {
  const t = useContext(ThemeContext);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: t.soft,
        color: BROWN,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

function SectionState({ loading, error, empty, emptyText = "No data yet" }) {
  const t = useContext(ThemeContext);
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={22} sx={{ color: BROWN }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography sx={{ fontSize: 12, color: RED, py: 2 }}>{error}</Typography>
    );
  }
  if (empty) {
    return (
      <Typography
        sx={{ fontSize: 12, color: t.muted, py: 2, textAlign: "center" }}
      >
        {emptyText}
      </Typography>
    );
  }
  return null;
}

function Change({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <Typography
      sx={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        color: up ? GREEN : RED,
      }}
    >
      {up ? (
        <ArrowUpward sx={{ fontSize: 14 }} />
      ) : (
        <ArrowDownward sx={{ fontSize: 14 }} />
      )}
      {formatPct(value)}
    </Typography>
  );
}

// ---------- Stat card ----------
function StatCard({ title, subtitle = "Last 7 days", items, loading, error }) {
  const t = useContext(ThemeContext);
  const divider = t.dark ? "rgba(148,163,184,.12)" : "#E8EDF3";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: "12px",
        bgcolor: t.dark ? "#292421" : "#F7F7F7",
        boxShadow: t.dark
          ? "0 25px 55px rgba(0,0,0,.35)"
          : "0 20px 45px rgba(15,23,42,.10)",
        transition: "0.3s",
        "&:hover": { transform: "translateY(-8px)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, mt: 0.5, color: t.muted }}>
            {subtitle}
          </Typography>
        </Box>
        <MenuButton />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          py: 2,
        }}
      >
        {items.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              minWidth: 0,
              pl: index > 0 ? 2 : 0,
              pr: index < items.length - 1 ? 2 : 0,
              borderRight:
                index < items.length - 1 ? `1px solid ${divider}` : "none",
            }}
          >
            <Typography sx={{ fontSize: 13, color: t.muted }}>
              {item.label}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: t.strong,
                }}
              >
                {loading ? "…" : error ? "—" : item.value}
              </Typography>
              {!loading && !error && <Change value={item.change} />}
            </Box>

            {!loading && !error && item.note && (
              <Typography sx={{ fontSize: 12, color: t.muted, mt: 1 }}>
                {item.note} <b style={{ color: t.strong }}>{item.noteValue}</b>
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
}

// ---------- Page ----------
const EMPTY = {
  orderStats: null,
  recentOrders: [],
  rangeOrders: [],
  rangeTotal: 0,
  customers: null,
  overview: null,
  productStats: null,
  products: [],
  categories: [],
  categoryStats: null,
  contactStats: null,
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [week, setWeek] = useState("this");

  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const theme = makeTheme(darkMode);

  // ---------- Load everything ----------
  const load = useCallback(async () => {
    setLoading(true);

    const rangeStart = startOfDay(new Date(Date.now() - 13 * DAY_MS));

    const tasks = {
      orderStats: () => ordersPost("/stats", {}),
      recentOrders: () => ordersPost("/list", { page: 1, limit: 5 }),
      rangeOrders: () =>
        ordersPost("/list", {
          page: 1,
          limit: 100,
          startDate: dayKey(rangeStart),
          endDate: dayKey(new Date()),
        }),
      customers: () => customerService.list({ page: 1, limit: 1 }),
      overview: () => customerService.getOverview(),
      productStats: () => productService.getStats(),
      products: () =>
        productService.getProducts({ page: 1, limit: 20, sort: "latest" }),
      categories: () => categoryService.getCategories({ page: 1, limit: 5 }),
      categoryStats: () => categoryService.getStats(),
      contactStats: () => contactService.getStats(),
    };

    const keys = Object.keys(tasks);
    const results = await Promise.allSettled(keys.map((key) => tasks[key]()));

    const next = { ...EMPTY };
    const nextErrors = {};

    results.forEach((result, index) => {
      const key = keys[index];
      if (result.status === "rejected") {
        nextErrors[key] =
          result.reason?.response?.data?.message ||
          result.reason?.message ||
          "Failed to load";
        return;
      }
      const value = result.value;

      switch (key) {
        case "recentOrders": {
          next.recentOrders = pickList(value, ["orders"]);
          break;
        }
        case "rangeOrders": {
          const payload = unwrap(value);
          next.rangeOrders = pickList(value, ["orders"]);
          next.rangeTotal = num(payload?.total ?? next.rangeOrders.length);
          break;
        }
        case "products":
          next.products = pickList(value, ["products"]);
          break;
        case "categories":
          next.categories = pickList(value, ["categories"]);
          break;
        default:
          next[key] = value;
      }
    });

    setData(next);
    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  // ---------- Derived numbers ----------
  const derived = useMemo(() => {
    // 14 daily buckets: first 7 = previous week, last 7 = this week
    const today = startOfDay(new Date());
    const buckets = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today.getTime() - (13 - i) * DAY_MS);
      return {
        key: dayKey(date),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: 0,
        orders: 0,
      };
    });
    const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

    // best selling products, aggregated from the same orders
    const sold = new Map();

    data.rangeOrders.forEach((order) => {
      const bucket = byKey[dayKey(order.createdAt || order.date)];
      if (bucket) {
        bucket.orders += 1;
        if (!isCancelled(order))
          bucket.revenue += num(order.total ?? order.price);
      }

      if (isCancelled(order) || !Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const name = item.name || item.productName || "Product";
        const qty = num(item.quantity || 1);
        const prev = sold.get(name) || { name, qty: 0, price: num(item.price) };
        prev.qty += qty;
        sold.set(name, prev);
      });
    });

    const prevWeek = buckets.slice(0, 7);
    const thisWeek = buckets.slice(7);
    const sum = (list, field) => list.reduce((s, b) => s + b[field], 0);

    const revenueNow = sum(thisWeek, "revenue");
    const revenuePrev = sum(prevWeek, "revenue");
    const ordersNow = sum(thisWeek, "orders");
    const ordersPrev = sum(prevWeek, "orders");

    const bestSelling = [...sold.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      thisWeek,
      prevWeek,
      revenueNow,
      revenuePrev,
      ordersNow,
      ordersPrev,
      bestSelling,
      truncated: data.rangeTotal > data.rangeOrders.length,
    };
  }, [data.rangeOrders, data.rangeTotal]);

  // ---------- Shortcuts to raw responses ----------
  const oStats = unwrap(data.orderStats);
  const totalOrders = num(
    oStats.totalOrders ?? oStats.total ?? oStats.ordersCount,
  );
  const newOrders = num(oStats.newOrders ?? oStats.pendingOrders ?? oStats.new);
  const completedOrders = num(
    oStats.completedOrders ?? oStats.deliveredOrders ?? oStats.completed,
  );
  const canceledOrders = num(
    oStats.canceledOrders ?? oStats.cancelledOrders ?? oStats.cancelled,
  );

  const pStats = unwrap(data.productStats);
  const totalProducts = num(
    pStats.totalProducts ?? pStats.total ?? pStats.products,
  );
  const outOfStock = num(
    pStats.outOfStock ?? pStats.out_of_stock ?? pStats.out,
  );
  const inStock = num(
    pStats.inStock ??
      pStats.stockProducts ??
      Math.max(0, totalProducts - outOfStock),
  );

  const customerTotal = num(
    data.customers?.stats?.total || data.customers?.total,
  );
  const customerNew = num(data.customers?.stats?.newThisMonth);

  const cStats = unwrap(data.contactStats);
  const msgTotal = num(cStats.total ?? cStats.totalMessages);
  const msgNew = num(cStats.new ?? cStats.newMessages ?? cStats.unread);

  const catStats = unwrap(data.categoryStats);
  const catTotal = num(catStats.total ?? catStats.totalCategories);

  const overviewBars = useMemo(() => {
    const raw = data.overview?.[week === "this" ? "thisWeek" : "lastWeek"];
    if (!Array.isArray(raw)) return [];
    return raw.map((v) =>
      typeof v === "number" ? v : num(v?.count ?? v?.value ?? v?.total),
    );
  }, [data.overview, week]);
  const overviewMax = Math.max(1, ...overviewBars);

  // ---------- Stat cards ----------
  const statCards = [
    {
      title: "Total Sales",
      loading,
      error: errors.rangeOrders,
      items: [
        {
          label: "Sales",
          value: moneyCompact(derived.revenueNow),
          change: pctChange(derived.revenueNow, derived.revenuePrev),
          note: "Previous 7 days",
          noteValue: `(${moneyCompact(derived.revenuePrev)})`,
        },
      ],
    },
    {
      title: "Total Orders",
      loading,
      error: errors.orderStats,
      items: [
        {
          label: "Orders",
          value: compact(totalOrders),
          change: pctChange(derived.ordersNow, derived.ordersPrev),
          note: "Previous 7 days",
          noteValue: `(${compact(derived.ordersPrev)})`,
        },
      ],
    },
    {
      title: "Pending & Canceled",
      loading,
      error: errors.orderStats,
      items: [
        { label: "Pending", value: compact(newOrders) },
        { label: "Canceled", value: compact(canceledOrders) },
      ],
    },
  ];

  const report = [
    [compact(customerTotal), "Customers"],
    [compact(totalProducts), "Total Products"],
    [compact(inStock), "Stock Products"],
    [compact(outOfStock), "Out of Stock"],
    [moneyCompact(derived.revenueNow), "Revenue (7d)"],
  ];

  const chartDays = week === "this" ? derived.thisWeek : derived.prevWeek;

  const visibleProducts = data.products
    .filter((p) =>
      String(p.name || p.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .slice(0, 5);

  const statusRows = [
    ["Completed", completedOrders, GREEN],
    ["Pending / New", newOrders, YELLOW],
    ["Canceled", canceledOrders, RED],
  ];
  const statusMax = Math.max(1, completedOrders, newOrders, canceledOrders);

  return (
    <ThemeContext.Provider value={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: theme.page,
          color: theme.text,
          transition: "background-color 0.25s ease",
        }}
      >
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggle={() => setCollapsed((previous) => !previous)}
          darkMode={darkMode}
        />

        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Navbar
            title="Dashboard"
            onMenuClick={() => setSidebarOpen(true)}
            darkMode={darkMode}
            onThemeToggle={() => setDarkMode((previous) => !previous)}
          />

          <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
            {/* ===== TOP BAR ===== */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 12, color: theme.muted }}>
                {lastUpdated
                  ? `Last updated ${lastUpdated.toLocaleTimeString()}`
                  : "Loading…"}
              </Typography>
              <Button
                onClick={load}
                disabled={loading}
                disableElevation
                variant="outlined"
                startIcon={
                  loading ? (
                    <CircularProgress size={14} sx={{ color: BROWN }} />
                  ) : (
                    <Refresh />
                  )
                }
                sx={{
                  height: 32,
                  textTransform: "none",
                  color: BROWN,
                  borderColor: BROWN,
                  "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
                }}
              >
                Refresh
              </Button>
            </Box>

            {Object.keys(errors).length > 0 && (
              <Alert severity="warning">
                Some sections could not be loaded:{" "}
                {Object.entries(errors)
                  .map(([key, msg]) => `${key} (${msg})`)
                  .join(", ")}
              </Alert>
            )}

            {derived.truncated && (
              <Alert severity="info">
                More than 100 orders were placed in the last 14 days, so sales
                figures and best sellers are based on the 100 most recent ones.
              </Alert>
            )}

            {/* ===== STATISTICS ===== */}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {statCards.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </Box>

            {/* ===== WEEKLY REPORT + CUSTOMERS ===== */}
            <Box
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 2fr) minmax(0, 1fr)",
                },
              }}
            >
              <Card>
                <CardHeader
                  title={`Report for ${week === "this" ? "this" : "last"} week`}
                  subtitle="Daily revenue (cancelled orders excluded)"
                  mb={3}
                  action={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: theme.soft,
                          p: 0.5,
                          borderRadius: 2,
                        }}
                      >
                        {[
                          ["this", "This week"],
                          ["last", "Last week"],
                        ].map(([key, label]) => (
                          <Button
                            key={key}
                            onClick={() => setWeek(key)}
                            disableElevation
                            sx={{
                              minWidth: 0,
                              height: 28,
                              px: 1.5,
                              lineHeight: 1,
                              fontSize: 12,
                              textTransform: "none",
                              borderRadius: 1.5,
                              bgcolor: week === key ? BROWN : "transparent",
                              color: week === key ? "#fff" : theme.muted,
                              "&:hover": {
                                bgcolor: week === key ? BROWN : theme.tabHover,
                              },
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </Box>
                      <MenuButton />
                    </Box>
                  }
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(5, 1fr)",
                    },
                    gap: 1,
                  }}
                >
                  {report.map(([value, label]) => (
                    <Box
                      key={label}
                      sx={{ borderBottom: `2px solid ${BROWN}`, p: 1 }}
                    >
                      <Typography sx={{ fontSize: 23, fontWeight: 700 }}>
                        {loading ? "…" : value}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: theme.muted }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 3, width: "100%" }}>
                  <LineChart
                    height={260}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: chartDays.map((d) => d.label),
                      },
                    ]}
                    series={[
                      {
                        data: chartDays.map(
                          (d) => Math.round(d.revenue * 100) / 100,
                        ),
                        color: BROWN,
                        showMark: true,
                        label: "Revenue",
                      },
                    ]}
                    grid={{ horizontal: true }}
                    sx={{
                      "& .MuiChartsAxis-tickLabel": {
                        fill: darkMode ? "#B8AAA0" : "#777777",
                      },
                      "& .MuiChartsAxis-line": {
                        stroke: darkMode ? "#554940" : "#DDDDDD",
                      },
                      "& .MuiChartsAxis-tick": {
                        stroke: darkMode ? "#554940" : "#DDDDDD",
                      },
                      "& .MuiChartsGrid-line": {
                        stroke: darkMode ? "#403832" : "#EEEEEE",
                      },
                      "& .MuiLineElement-root": { strokeWidth: 2 },
                      "& .MuiMarkElement-root": {
                        stroke: BROWN,
                        fill: darkMode ? "#292421" : "#FFFFFF",
                        strokeWidth: 2,
                      },
                      "& .MuiChartsLegend-root": { display: "none" },
                    }}
                  />
                </Box>
              </Card>

              {/* Customers + order status */}
              <Card>
                <CardHeader title="Customers" action={<MenuButton />} />

                <SectionState loading={loading} error={errors.customers} />

                {!loading && !errors.customers && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 1.5,
                      mt: -1,
                    }}
                  >
                    <Typography sx={{ fontSize: 32, fontWeight: 700 }}>
                      {compact(customerTotal)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: GREEN }}>
                      +{customerNew} this month
                    </Typography>
                  </Box>
                )}

                <Typography sx={{ fontSize: 13, mt: 2 }}>
                  New customers per day ({week === "this" ? "this" : "last"}{" "}
                  week)
                </Typography>

                {errors.overview ? (
                  <Typography sx={{ fontSize: 12, color: RED, mt: 1 }}>
                    {errors.overview}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "6px",
                      height: 56,
                      mt: 1,
                    }}
                  >
                    {overviewBars.map((value, i) => (
                      <Box
                        key={i}
                        title={String(value)}
                        sx={{
                          flex: 1,
                          height: `${Math.max(6, (value / overviewMax) * 100)}%`,
                          bgcolor: BROWN,
                          borderRadius: "2px",
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                    Orders by status
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                    Count
                  </Typography>
                </Box>

                {statusRows.map(([name, value, color]) => (
                  <Box
                    key={name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, width: 86 }}>
                      {name}
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        height: 5,
                        bgcolor: theme.soft,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(value / statusMax) * 100}%`,
                          height: "100%",
                          bgcolor: color,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        width: 40,
                        textAlign: "right",
                      }}
                    >
                      {loading ? "…" : compact(value)}
                    </Typography>
                  </Box>
                ))}
              </Card>
            </Box>

            {/* ===== TRANSACTIONS + TOP PRODUCTS ===== */}
            <Box
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 2fr) minmax(0, 1fr)",
                },
              }}
            >
              <Card>
                <CardHeader
                  title="Recent transactions"
                  subtitle="Latest 5 orders"
                />

                <SectionState
                  loading={loading}
                  error={errors.recentOrders}
                  empty={data.recentOrders.length === 0}
                  emptyText="No orders yet"
                />

                {!loading && data.recentOrders.length > 0 && (
                  <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: 520 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "40px 1fr 1.5fr 1fr 80px",
                          gap: 1,
                          pb: 1.5,
                          borderBottom: `1px solid ${theme.divider}`,
                          fontSize: 12,
                          color: theme.muted,
                        }}
                      >
                        <span>No</span>
                        <span>Order Id</span>
                        <span>Order Date</span>
                        <span>Payment</span>
                        <span>Amount</span>
                      </Box>

                      {data.recentOrders.map((order, index) => {
                        const paid = isPaid(order);
                        return (
                          <Box
                            key={order.id ?? index}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "40px 1fr 1.5fr 1fr 80px",
                              gap: 1,
                              py: 1.75,
                              fontSize: 12,
                              alignItems: "center",
                            }}
                          >
                            <span>{index + 1}.</span>
                            <span>{orderNumber(order)}</span>
                            <span>
                              {formatDateTime(order.createdAt || order.date)}
                            </span>
                            <span style={{ color: paid ? GREEN : YELLOW }}>
                              ● {paid ? "Paid" : "Pending"}
                            </span>
                            <span>{money(order.total ?? order.price)}</span>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Card>

              <Card>
                <CardHeader title="Top Products" subtitle="Newest in catalog" />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: theme.soft,
                    borderRadius: 2,
                    px: 1.5,
                    height: 38,
                  }}
                >
                  <Search sx={{ fontSize: 20, color: theme.muted }} />
                  <InputBase
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search"
                    sx={{
                      flex: 1,
                      fontSize: 13,
                      color: theme.text,
                      "& input::placeholder": {
                        color: theme.muted,
                        opacity: 1,
                      },
                    }}
                  />
                </Box>

                <SectionState
                  loading={loading}
                  error={errors.products}
                  empty={visibleProducts.length === 0}
                  emptyText="No products found"
                />

                {!loading &&
                  visibleProducts.map((p, i) => {
                    const name = p.name || p.title || "Product";
                    const image = p.image || p.images?.[0];
                    return (
                      <Box
                        key={p.id ?? i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1.5,
                          borderBottom: `1px solid ${theme.divider}`,
                        }}
                      >
                        <IconBox>
                          {typeof image === "string" && image ? (
                            <img
                              src={image}
                              alt={name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Inventory2Outlined />
                          )}
                        </IconBox>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 13,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {name}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: theme.muted }}>
                            Item: {p.sku || p.code || `#${p.id ?? "-"}`}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                          {money(p.price)}
                        </Typography>
                      </Box>
                    );
                  })}
              </Card>
            </Box>

            {/* ===== BEST SELLING + CATEGORIES / MESSAGES ===== */}
            <Box
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 2fr) minmax(0, 1fr)",
                },
              }}
            >
              <Card>
                <CardHeader
                  title="Best selling product"
                  subtitle="Based on orders from the last 14 days"
                />

                <SectionState
                  loading={loading}
                  error={errors.rangeOrders}
                  empty={derived.bestSelling.length === 0}
                  emptyText="No sales in the last 14 days"
                />

                {!loading && derived.bestSelling.length > 0 && (
                  <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: 420 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr",
                          gap: 1,
                          p: 1.5,
                          bgcolor: theme.soft,
                          borderRadius: 2,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <span>PRODUCT</span>
                        <span>UNITS SOLD</span>
                        <span>UNIT PRICE</span>
                      </Box>

                      {derived.bestSelling.map((item) => (
                        <Box
                          key={item.name}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr",
                            gap: 1,
                            px: 1.5,
                            py: 1.75,
                            alignItems: "center",
                            fontSize: 12,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Inventory2Outlined sx={{ color: BROWN }} />
                            <Typography sx={{ fontSize: 12 }}>
                              {item.name}
                            </Typography>
                          </Box>
                          <span>{item.qty}</span>
                          <span>{money(item.price)}</span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>

              <Box sx={{ display: "grid", gap: 2.5, alignContent: "start" }}>
                <Card>
                  <CardHeader
                    title="Categories"
                    subtitle={catTotal ? `${catTotal} total` : undefined}
                  />

                  <SectionState
                    loading={loading}
                    error={errors.categories}
                    empty={data.categories.length === 0}
                    emptyText="No categories yet"
                  />

                  {!loading &&
                    data.categories.map((c, i) => (
                      <Box
                        key={c.id ?? i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1,
                          borderBottom: `1px solid ${theme.divider}`,
                        }}
                      >
                        <IconBox size={32}>
                          <CategoryOutlined sx={{ fontSize: 18 }} />
                        </IconBox>
                        <Typography sx={{ flex: 1, fontSize: 14 }}>
                          {c.name || c.title}
                        </Typography>
                        {(c.productCount ?? c.products ?? c.count) != null && (
                          <Typography sx={{ fontSize: 12, color: theme.muted }}>
                            {num(c.productCount ?? c.products ?? c.count)} items
                          </Typography>
                        )}
                      </Box>
                    ))}
                </Card>

                <Card>
                  <CardHeader title="Contact messages" />
                  {errors.contactStats ? (
                    <Typography sx={{ fontSize: 12, color: RED }}>
                      {errors.contactStats}
                    </Typography>
                  ) : (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <IconBox>
                        <MailOutlinedIcon />
                      </IconBox>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: theme.strong,
                          }}
                        >
                          {loading ? "…" : msgTotal}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: theme.muted }}>
                          {loading ? "" : `${msgNew} new`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Card>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeContext.Provider>
  );
}
