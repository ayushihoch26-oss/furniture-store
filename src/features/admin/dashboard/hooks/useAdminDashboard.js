import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardRequests } from "../services/adminDashboard.service";
import {
  DAY_MS,
  EMPTY_DASHBOARD_DATA,
  GREEN,
  RED,
  REFRESH_MS,
  YELLOW,
  compact,
  dayKey,
  getDerivedData,
  makeTheme,
  moneyCompact,
  num,
  pctChange,
  pickList,
  startOfDay,
  unwrap,
} from "../features/dashboardHelpers";

export default function useAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [week, setWeek] = useState("this");
  const [data, setData] = useState(EMPTY_DASHBOARD_DATA);
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

  const load = useCallback(async () => {
    setLoading(true);
    const rangeStart = startOfDay(new Date(Date.now() - 13 * DAY_MS));
    const requests = getDashboardRequests(
      dayKey(rangeStart),
      dayKey(new Date()),
    );
    const keys = Object.keys(requests);
    const results = await Promise.allSettled(
      keys.map((key) => requests[key]()),
    );
    const nextData = { ...EMPTY_DASHBOARD_DATA };
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
        case "recentOrders":
          nextData.recentOrders = pickList(value, ["orders"]);
          break;
        case "rangeOrders": {
          const payload = unwrap(value);
          nextData.rangeOrders = pickList(value, ["orders"]);
          nextData.rangeTotal = num(payload?.total ?? nextData.rangeOrders.length);
          break;
        }
        case "products":
          nextData.products = pickList(value, ["products"]);
          break;
        case "categories":
          nextData.categories = pickList(value, ["categories"]);
          break;
        default:
          nextData[key] = value;
      }
    });

    setData(nextData);
    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const derived = useMemo(() => getDerivedData(data), [data]);

  const orderStats = unwrap(data.orderStats);
  const totalOrders = num(
    orderStats.totalOrders ?? orderStats.total ?? orderStats.ordersCount,
  );
  const newOrders = num(
    orderStats.newOrders ?? orderStats.pendingOrders ?? orderStats.new,
  );
  const completedOrders = num(
    orderStats.completedOrders ??
      orderStats.deliveredOrders ??
      orderStats.completed,
  );
  const canceledOrders = num(
    orderStats.canceledOrders ??
      orderStats.cancelledOrders ??
      orderStats.cancelled,
  );

  const productStats = unwrap(data.productStats);
  const totalProducts = num(
    productStats.totalProducts ?? productStats.total ?? productStats.products,
  );
  const outOfStock = num(
    productStats.outOfStock ??
      productStats.out_of_stock ??
      productStats.out,
  );
  const inStock = num(
    productStats.inStock ??
      productStats.stockProducts ??
      Math.max(0, totalProducts - outOfStock),
  );

  const customerTotal = num(data.customers?.stats?.total || data.customers?.total);
  const customerNew = num(data.customers?.stats?.newThisMonth);
  const contactStats = unwrap(data.contactStats);
  const msgTotal = num(contactStats.total ?? contactStats.totalMessages);
  const msgNew = num(
    contactStats.new ?? contactStats.newMessages ?? contactStats.unread,
  );
  const categoryStats = unwrap(data.categoryStats);
  const catTotal = num(
    categoryStats.total ?? categoryStats.totalCategories,
  );

  const overviewBars = useMemo(() => {
    const raw = data.overview?.[week === "this" ? "thisWeek" : "lastWeek"];
    if (!Array.isArray(raw)) return [];
    return raw.map((value) =>
      typeof value === "number"
        ? value
        : num(value?.count ?? value?.value ?? value?.total),
    );
  }, [data.overview, week]);
  const overviewMax = Math.max(1, ...overviewBars);

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
    .filter((product) =>
      String(product.name || product.title || "")
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

  return {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
    search,
    setSearch,
    week,
    setWeek,
    data,
    errors,
    loading,
    lastUpdated,
    darkMode,
    setDarkMode,
    theme,
    load,
    derived,
    totalOrders,
    newOrders,
    completedOrders,
    canceledOrders,
    totalProducts,
    outOfStock,
    inStock,
    customerTotal,
    customerNew,
    msgTotal,
    msgNew,
    catTotal,
    overviewBars,
    overviewMax,
    statCards,
    report,
    chartDays,
    visibleProducts,
    statusRows,
    statusMax,
  };
}
