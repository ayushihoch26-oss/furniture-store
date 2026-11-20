import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BROWN = [148, 116, 88]; // #947458
const DARK = [17, 17, 17];
const GREY = [110, 110, 110];

const money = (value) => `$${(Number(value) || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Still used by the checkout page: "#ORD0009" or build one from the numeric id
export const getOrderNumber = (order) => {
  if (order.orderId) return String(order.orderId);
  const raw = String(order.id ?? "");
  if (raw.startsWith("#")) return raw;
  return `#ORD${raw.padStart(4, "0")}`;
};

/**
 * Builds the invoice PDF from the invoice sent by the backend
 * (POST /api/invoices/order/:orderId). Everything on the page comes from it.
 * Returns the jsPDF document, so you can .save() or .output("bloburl") it.
 */
export function buildInvoice(invoice) {
  const store = invoice.store || {};
  const customer = invoice.customer || {};
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const right = pageWidth - margin;

  // ---------- Header band ----------
  doc.setFillColor(...BROWN);
  doc.rect(0, 0, pageWidth, 90, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(store.name || "", margin, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(store.address || "", margin, 66);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("INVOICE", right, 52, { align: "right" });

  // ---------- Invoice details ----------
  doc.setTextColor(...DARK);
  doc.setFontSize(10);

  const detailsTop = 125;
  const details = [
    ["Invoice no.", invoice.invoiceNumber],
    ["Order no.", invoice.orderNumber],
    ["Date", formatDate(invoice.issuedAt)],
    [
      "Payment",
      invoice.paymentMethod === "cod"
        ? "Cash on delivery"
        : `Card ending ${invoice.cardLast4 || "----"}`,
    ],
    ["Payment status", invoice.paymentStatus || "-"],
  ];

  details.forEach(([label, value], index) => {
    const y = detailsTop + index * 16;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text(label, right - 190, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(String(value ?? "-"), right, y, { align: "right" });
  });

  // ---------- Bill to ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BROWN);
  doc.text("BILL TO", margin, detailsTop);

  const addressLine1 = [customer.street, customer.apartment]
    .filter(Boolean)
    .join(", ");
  const addressLine2 = [customer.city, customer.state, customer.zip]
    .filter(Boolean)
    .join(", ");

  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.text(customer.name || "Customer", margin, detailsTop + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GREY);
  [addressLine1, addressLine2, customer.country, customer.email, customer.phone]
    .filter(Boolean)
    .forEach((line, index) => {
      doc.text(String(line), margin, detailsTop + 34 + index * 14);
    });

  // ---------- Items table ----------
  autoTable(doc, {
    startY: 235,
    margin: { left: margin, right: margin },
    head: [["#", "Item", "Price", "Qty", "Amount"]],
    body: items.map((item, index) => [
      index + 1,
      item.color ? `${item.name}  (${item.color})` : item.name,
      money(item.price),
      item.quantity,
      money(Number(item.price) * Number(item.quantity)),
    ]),
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 7,
      textColor: DARK,
    },
    headStyles: { fillColor: BROWN, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 244, 241] },
    columnStyles: {
      0: { cellWidth: 30 },
      2: { halign: "right", cellWidth: 70 },
      3: { halign: "center", cellWidth: 45 },
      4: { halign: "right", cellWidth: 80 },
    },
    didParseCell: (data) => {
      if (data.section === "head" && [2, 4].includes(data.column.index)) {
        data.cell.styles.halign = "right";
      }
      if (data.section === "head" && data.column.index === 3) {
        data.cell.styles.halign = "center";
      }
    },
  });

  // ---------- Totals ----------
  let y = doc.lastAutoTable.finalY + 24;

  // New page if the totals would run off the bottom
  if (y > pageHeight - 160) {
    doc.addPage();
    y = 60;
  }

  const taxPercent = +(Number(invoice.taxRate || 0) * 100).toFixed(2);
  const discountLabel = invoice.couponCode
    ? `Discount (${invoice.couponCode})`
    : "Discount";

  const rows = [
    ["Subtotal", money(invoice.itemsTotal)],
    ...(invoice.discount > 0
      ? [[discountLabel, `-${money(invoice.discount)}`]]
      : []),
    ["Shipping", invoice.shippingCost ? money(invoice.shippingCost) : "Free"],
    [`Tax (${taxPercent}%)`, money(invoice.tax)],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text(label, right - 170, y);
    doc.setTextColor(...DARK);
    doc.text(value, right, y, { align: "right" });
    y += 18;
  });

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(1);
  doc.line(right - 170, y - 6, right, y - 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BROWN);
  doc.text("Total", right - 170, y + 14);
  doc.text(money(invoice.total), right, y + 14, { align: "right" });

  // ---------- Footer ----------
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, pageHeight - 70, right, pageHeight - 70);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("Thank you for shopping with us!", pageWidth / 2, pageHeight - 50, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(
    `${store.email || ""}   |   ${store.phone || ""}`,
    pageWidth / 2,
    pageHeight - 34,
    { align: "center" },
  );

  return doc;
}

// Download button handler: saves INV-0009.pdf
export function downloadInvoice(invoice) {
  buildInvoice(invoice).save(`${invoice.invoiceNumber}.pdf`);
}
