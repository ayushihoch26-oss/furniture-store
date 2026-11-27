import { CSV_HEADERS } from "../constants/invoice.constants";

// API: { success, data: {...} }
export const getPayload = (response) =>
  response?.data?.data ?? response?.data ?? response;

export const errorText = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ---------- Formatting ----------
export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "";

// Used by the stat cards (thousand separators)
export const formatMoney = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Used by the table rows
export const formatMoneyFixed = (value) => `$${(Number(value) || 0).toFixed(2)}`;

// ---------- Calendar helpers ----------
const pad = (n) => String(n).padStart(2, "0");
export const makeIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const showDate = (value) => {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
};

// ---------- Pagination ----------
// Page buttons: 1 ... 4 5 [6] 7 8 ... 20
export const buildVisiblePages = (page, totalPages) => {
  const numbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2,
  );

  return numbers.reduce((result, n, i) => {
    if (i > 0 && n - numbers[i - 1] > 1) result.push("...");
    result.push(n);
    return result;
  }, []);
};

export const mapInvoiceRows = (rows = []) =>
  rows.map((item) => ({ ...item, date: formatDate(item.issuedAt) }));

// ---------- CSV ----------
export const buildInvoiceCsv = (rows) => {
  const body = rows.map((r) => [
    r.invoiceNumber,
    r.orderNumber,
    r.customerName,
    r.email,
    r.phone,
    formatDate(r.issuedAt),
    r.paymentMethod === "cod" ? "Cash on delivery" : `Card ${r.cardLast4}`.trim(),
    r.itemsTotal,
    r.discount,
    r.couponCode,
    r.shippingCost,
    r.tax,
    r.total,
  ]);

  return [CSV_HEADERS, ...body]
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
};

export const downloadTextFile = (content, fileName) => {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
