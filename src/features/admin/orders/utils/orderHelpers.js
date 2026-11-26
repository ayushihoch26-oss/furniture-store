// utils/orderHelpers.js
// Small pure functions (input -> output). Easy to understand and test.

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
}

export function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

export function getOrderNumber(order) {
  return order.orderId || `#ORD${String(order.id ?? "").padStart(4, "0")}`;
}

export function getCustomerName(order) {
  return (
    [order.firstName, order.lastName].filter(Boolean).join(" ") ||
    "Guest Customer"
  );
}

export function getProductSummary(order) {
  const customer = [order.firstName, order.lastName].filter(Boolean).join(" ");
  let items = "—";

  if (Array.isArray(order.items) && order.items.length) {
    items = order.items
      .map((item) => {
        const name = item.name || item.productName || "Product";
        const color = item.color ? `(${item.color})` : "";
        return `${name} ${color} × ${Number(item.quantity || 1)}`;
      })
      .join(", ");
  }
  return customer ? `${customer} — ${items}` : items;
}

export function normalizePaymentStatus(value) {
  if (!value) return "Unpaid";
  const v = String(value).toLowerCase();
  if (["paid", "completed", "success", "succeeded"].includes(v)) return "Paid";
  if (["unpaid", "pending", "failed", "cancelled", "canceled"].includes(v))
    return "Unpaid";
  return value;
}

// Builds a CSV file and downloads it in the browser
export function downloadOrdersCsv(orders, fileName) {
  const headers = ["Database ID", "Order ID", "Product", "Date", "Price", "Payment", "Status"];
  const rows = orders.map((o) => [
    o.id ?? "",
    o.orderId ?? "",
    getProductSummary(o),
    o.createdAt ?? "",
    o.total ?? "",
    o.paymentStatus ?? "",
    o.status ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\r\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
