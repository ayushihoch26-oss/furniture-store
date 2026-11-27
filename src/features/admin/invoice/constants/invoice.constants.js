import { CreditCardOutlined, LocalShippingOutlined } from "@mui/icons-material";

// ---------- Colors ----------
export const BROWN = "#947458";
export const BROWN_DARK = "#7d6149";
export const BROWN_LIGHT = "#F3ECE5";
export const BG = "#F7F7F7";
export const GREEN = "#2E9E5B";
export const RED = "#E5484D";

// ---------- Storage / timing ----------
export const DARK_MODE_STORAGE_KEY = "admin-dark-mode";
export const SEARCH_DEBOUNCE_MS = 350;
export const TOAST_DURATION_MS = 4000;

// ---------- Filters / pagination ----------
export const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  search: "",
  paymentMethod: "",
  fromDate: "",
  toDate: "",
  minTotal: "",
  maxTotal: "",
  sortBy: "date",
  sortOrder: "desc",
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const EXPORT_PAGE_LIMIT = 100;

// ---------- Stats ----------
export const DEFAULT_COUNTS = {
  total: 0,
  revenue: 0,
  card: 0,
  cod: 0,
  changes: { total: 0, revenue: 0, card: 0, cod: 0 },
};

// ---------- Table ----------
export const TABS = [
  { label: "All invoices", value: "", count: "total" },
  { label: "Card", value: "card", count: "card" },
  { label: "Cash on delivery", value: "cod", count: "cod" },
];

export const PAYMENT = {
  card: { label: "Card", Icon: CreditCardOutlined },
  cod: { label: "Cash on delivery", Icon: LocalShippingOutlined },
};

// "sortBy:sortOrder" -> label (same values the column headers use)
export const SORT_OPTIONS = [
  ["date:desc", "Newest first"],
  ["date:asc", "Oldest first"],
  ["total:desc", "Total: high to low"],
  ["total:asc", "Total: low to high"],
  ["name:asc", "Customer: A to Z"],
  ["name:desc", "Customer: Z to A"],
  ["id:desc", "Invoice no: high to low"],
  ["id:asc", "Invoice no: low to high"],
  ["payment:asc", "Payment: A to Z"],
  ["payment:desc", "Payment: Z to A"],
];

export const TABLE_COLUMNS =
  "60px 120px minmax(200px, 2fr) 110px 110px 1.3fr 110px 100px";

// Sort fields that start descending when first selected
export const DESC_FIRST_FIELDS = ["date", "total"];

// ---------- Calendar ----------
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ---------- CSV export ----------
export const CSV_FILE_NAME = "invoices.csv";
export const CSV_HEADERS = [
  "Invoice",
  "Order",
  "Customer",
  "Email",
  "Phone",
  "Date",
  "Payment",
  "Items total",
  "Discount",
  "Coupon",
  "Shipping",
  "Tax",
  "Total",
];

// ---------- Messages ----------
export const MESSAGES = {
  loadFailed: "Failed to load invoices",
  exportFailed: "Failed to export invoices",
  nothingToExport: "No invoices to export",
};
