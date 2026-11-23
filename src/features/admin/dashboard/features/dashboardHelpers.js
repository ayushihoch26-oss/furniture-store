export const BROWN = "#947458";
export const GREEN = "#2E9E5B";
export const RED = "#E5484D";
export const YELLOW = "#F5B301";
export const REFRESH_MS = 60_000;
export const DAY_MS = 86_400_000;

export const EMPTY_DASHBOARD_DATA = {
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

export const makeTheme = (darkMode) => ({
  dark: darkMode,
  page: darkMode ? "#1C1917" : "#F7F7F7",
  card: darkMode ? "#292421" : "#FFFFFF",
  text: darkMode ? "#F5F0EB" : "#222222",
  muted: darkMode ? "#B8AAA0" : "#777777",
  border: darkMode ? "#403832" : "#EEEEEE",
  soft: darkMode ? "#332D28" : "#F7F7F7",
  divider: darkMode ? "#403832" : "#eee",
  tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
  strong: darkMode ? "#FFFFFF" : BROWN,
});

export const dayKey = (date) => {
  const day = new Date(date);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
    day.getDate(),
  ).padStart(2, "0")}`;
};

export const startOfDay = (date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
};

export const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const compact = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num(value));

export const money = (value) =>
  `$${num(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const moneyCompact = (value) => `$${compact(value)}`;

export const pctChange = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

export const formatPct = (value) => `${Math.abs(value).toFixed(1)}%`;

export const formatDateTime = (value) => {
  if (!value) return "-";
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return "-";
  const date = dateValue.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const time = dateValue.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} | ${time}`;
};

export const unwrap = (response) => {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data != null
  ) {
    return response.data;
  }
  return response ?? {};
};

export const pickList = (response, keys = []) => {
  const root = unwrap(response);
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

export const orderNumber = (order) =>
  order.orderId || `#ORD${String(order.id ?? "").padStart(4, "0")}`;

export const isCancelled = (order) =>
  ["cancelled", "canceled"].includes(String(order.status || "").toLowerCase());

export const isPaid = (order) =>
  ["paid", "completed", "success", "succeeded"].includes(
    String(order.paymentStatus || "").toLowerCase(),
  );

export const getDerivedData = (data) => {
  const today = startOfDay(new Date());
  const buckets = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today.getTime() - (13 - index) * DAY_MS);
    return {
      key: dayKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: 0,
      orders: 0,
    };
  });
  const bucketsByKey = Object.fromEntries(
    buckets.map((bucket) => [bucket.key, bucket]),
  );
  const soldProducts = new Map();

  data.rangeOrders.forEach((order) => {
    const bucket = bucketsByKey[dayKey(order.createdAt || order.date)];
    if (bucket) {
      bucket.orders += 1;
      if (!isCancelled(order)) {
        bucket.revenue += num(order.total ?? order.price);
      }
    }

    if (isCancelled(order) || !Array.isArray(order.items)) return;
    order.items.forEach((item) => {
      const name = item.name || item.productName || "Product";
      const quantity = num(item.quantity || 1);
      const product = soldProducts.get(name) || {
        name,
        qty: 0,
        price: num(item.price),
      };
      product.qty += quantity;
      soldProducts.set(name, product);
    });
  });

  const prevWeek = buckets.slice(0, 7);
  const thisWeek = buckets.slice(7);
  const sum = (list, field) => list.reduce((total, bucket) => total + bucket[field], 0);
  const revenueNow = sum(thisWeek, "revenue");
  const revenuePrev = sum(prevWeek, "revenue");
  const ordersNow = sum(thisWeek, "orders");
  const ordersPrev = sum(prevWeek, "orders");
  const bestSelling = [...soldProducts.values()]
    .sort((first, second) => second.qty - first.qty)
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
};
