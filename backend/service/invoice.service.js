import invoiceRepository from "../repository/invoice.repository.js";
import orderRepository from "../repository/ordermanagement.repository.js";
import db from "../models/index.js";

// APP ERROR
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// STORE INFORMATION
const STORE = {
  name: process.env.STORE_NAME || "FurnitureStore",
  address:
    process.env.STORE_ADDRESS ||
    "123 Design Street, Rajkot, Gujarat 360005, India",
  email: process.env.STORE_EMAIL || "support@furniturestore.com",
  phone: process.env.STORE_PHONE || "+91 98765 43210",
};

// SYNC MISSING INVOICES
export const syncMissingInvoices = async () => {
  const OrderModel = db.sequelize.models.Orders || db.sequelize.models.Order;

  if (!OrderModel) return;

  const orders = await OrderModel.findAll({
    attributes: ["id"],
    raw: true,
  });

  const existingIds = new Set(
    (await invoiceRepository.allOrderIds()).map(Number),
  );

  for (const orderData of orders) {
    if (existingIds.has(Number(orderData.id))) continue;

    try {
      const order = await orderRepository.findById(orderData.id);
      if (order) await createForOrder(order);
    } catch (error) {
      console.error(`Invoice error for order ${orderData.id}:`, error.message);
    }
  }
};

// CREATE INVOICE
export const createForOrder = async (order, couponCode = null) => {
  const existing = await invoiceRepository.findByOrderId(order.id);
  if (existing) return existing;

  const customer = order.user || {};
  const items = order.items || [];

  const itemsTotal =
    Math.round(
      items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      ) * 100,
    ) / 100;

  const subtotal = Number(order.subtotal) || 0;
  const tax = Number(order.tax) || 0;

  return invoiceRepository.create({
    orderId: order.id,
    userId: order.userId,

    customerName:
      [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
      "Customer",

    email: customer.email,
    phone: customer.phone,
    street: customer.street,
    apartment: customer.apartment,
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
    country: customer.country,

    itemsTotal,
    discount: Math.round(Math.max(itemsTotal - subtotal, 0) * 100) / 100,
    couponCode,

    shippingCost: Number(order.shippingCost) || 0,
    tax,
    taxRate: subtotal > 0 ? Math.round((tax / subtotal) * 10000) / 10000 : 0,
    total: Number(order.total) || 0,

    paymentMethod: order.paymentMethod,
    cardLast4: order.cardLast4 || "",
  });
};

// GET INVOICE BY ORDER ID
export const getByOrderId = async (orderId, user) => {
  const id = Number(String(orderId).replace(/\D/g, ""));
  if (!id) throw new AppError("Invalid order id", 400);

  const order = await orderRepository.findById(id);
  if (!order) throw new AppError("Order not found", 404);

  if (user.role !== "admin" && String(order.userId) !== String(user.id)) {
    throw new AppError("Forbidden", 403);
  }

  const invoice = await createForOrder(order);
  const data = invoice.toJSON();

  return {
    id: data.id,
    invoiceNumber: `INV-${String(data.orderId).padStart(4, "0")}`,
    orderNumber: `#ORD${String(data.orderId).padStart(4, "0")}`,
    issuedAt: data.createdAt,

    customer: {
      name: data.customerName,
      email: data.email || "",
      phone: data.phone || "",
      street: data.street || "",
      apartment: data.apartment || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zip || "",
      country: data.country || "",
    },

    items: (order.items || []).map((item) => ({
      name: item.name,
      color: item.color,
      price: Number(item.price),
      quantity: item.quantity,
    })),

    itemsTotal: Number(data.itemsTotal),
    discount: Number(data.discount),
    couponCode: data.couponCode || "",
    shippingCost: Number(data.shippingCost),
    tax: Number(data.tax),
    taxRate: Number(data.taxRate),
    total: Number(data.total),

    paymentMethod: data.paymentMethod,
    cardLast4: data.cardLast4 || "",
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    store: STORE,
  };
};

// GET ALL INVOICES
export const list = async (query = {}) => {
  await syncMissingInvoices();

  let page = Math.max(1, Math.floor(Number(query.page) || 1));
  let limit = Math.min(100, Math.max(1, Math.floor(Number(query.limit) || 10)));

  let fromDate = query.fromDate || "";
  let toDate = query.toDate || "";

  if (fromDate && toDate && fromDate > toDate) {
    [fromDate, toDate] = [toDate, fromDate];
  }

  let minTotal =
    query.minTotal == null || query.minTotal === ""
      ? null
      : Number(query.minTotal);
  let maxTotal =
    query.maxTotal == null || query.maxTotal === ""
      ? null
      : Number(query.maxTotal);

  if (minTotal !== null && maxTotal !== null && minTotal > maxTotal) {
    [minTotal, maxTotal] = [maxTotal, minTotal];
  }

  const allowedSorts = ["id", "name", "total", "payment", "date"];

  const filters = {
    page,
    limit,
    search: String(query.search || "")
      .trim()
      .slice(0, 100),
    paymentMethod: ["card", "cod"].includes(query.paymentMethod)
      ? query.paymentMethod
      : "",
    fromDate,
    toDate,
    minTotal: Number.isFinite(minTotal) && minTotal >= 0 ? minTotal : null,
    maxTotal: Number.isFinite(maxTotal) && maxTotal >= 0 ? maxTotal : null,
    sortBy: allowedSorts.includes(query.sortBy) ? query.sortBy : "date",
    sortOrder: String(query.sortOrder).toLowerCase() === "asc" ? "asc" : "desc",
  };

  const result = await invoiceRepository.findPaginated(filters);

  const rows = result.rows.map((invoice) => {
    const data = invoice.toJSON ? invoice.toJSON() : invoice;

    return {
      id: data.id,
      orderId: data.orderId,
      invoiceNumber: `INV-${String(data.orderId).padStart(4, "0")}`,
      orderNumber: `#ORD${String(data.orderId).padStart(4, "0")}`,
      customerName: data.customerName,
      email: data.email || "",
      phone: data.phone || "",
      itemsTotal: Number(data.itemsTotal),
      discount: Number(data.discount),
      couponCode: data.couponCode || "",
      shippingCost: Number(data.shippingCost),
      tax: Number(data.tax),
      total: Number(data.total),
      paymentMethod: data.paymentMethod,
      cardLast4: data.cardLast4 || "",
      issuedAt: data.createdAt,
    };
  });

  return {
    rows,
    totalItems: result.count,
    totalPages: Math.max(1, Math.ceil(result.count / limit)),
    page,
    limit,
  };
};

// GET INVOICE STATISTICS
export const stats = async () => {
  await syncMissingInvoices();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

  const all = await invoiceRepository.summary();
  const current = await invoiceRepository.summary(sevenDaysAgo, now);
  const previous = await invoiceRepository.summary(
    fourteenDaysAgo,
    sevenDaysAgo,
  );

  const calculateChange = (current, previous) =>
    previous === 0
      ? current > 0
        ? 100
        : 0
      : Math.round(((current - previous) / previous) * 10000) / 100;

  return {
    ...all,
    changes: {
      total: calculateChange(current.total, previous.total),
      revenue: calculateChange(current.revenue, previous.revenue),
      card: calculateChange(current.card, previous.card),
      cod: calculateChange(current.cod, previous.cod),
    },
  };
};

// DEFAULT EXPORT
export default {
  syncMissingInvoices,
  createForOrder,
  getByOrderId,
  list,
  stats,
};
