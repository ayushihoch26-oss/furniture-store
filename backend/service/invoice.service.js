import invoiceRepository from "../repository/invoice.repository.js";
import orderRepository from "../repository/ordermanagement.repository.js";
import db from "../models/index.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const STORE = {
  name: process.env.STORE_NAME || "FurnitureStore",
  address:
    process.env.STORE_ADDRESS ||
    "123 Design Street, Rajkot, Gujarat 360005, India",
  email: process.env.STORE_EMAIL || "support@furniturestore.com",
  phone: process.env.STORE_PHONE || "+91 98765 43210",
};

const round = (number) => Math.round(number * 100) / 100;

// Convert ID 9 into 0009.
const pad = (id) => String(id).padStart(4, "0");

// Format one invoice for viewing or printing.
function formatInvoice(invoice, order) {
  const data = invoice.toJSON();

  return {
    id: data.id,
    invoiceNumber: `INV-${pad(data.orderId)}`,
    orderNumber: `#ORD${pad(data.orderId)}`,

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
}

// Format one row in the admin invoice table.
function formatRow(invoice) {
  const data = invoice.toJSON ? invoice.toJSON() : invoice;

  return {
    id: data.id,
    orderId: data.orderId,
    invoiceNumber: `INV-${pad(data.orderId)}`,
    orderNumber: `#ORD${pad(data.orderId)}`,

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
}

// Prepare search, filters, sorting and pagination values.
function prepareFilters(query = {}) {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;

  page = Math.max(1, Math.floor(page));
  limit = Math.min(100, Math.max(1, Math.floor(limit)));

  let fromDate = query.fromDate || "";
  let toDate = query.toDate || "";

  // Swap dates if the start date is later.
  if (fromDate && toDate && fromDate > toDate) {
    [fromDate, toDate] = [toDate, fromDate];
  }

  let minTotal =
    query.minTotal === "" || query.minTotal == null
      ? null
      : Number(query.minTotal);

  let maxTotal =
    query.maxTotal === "" || query.maxTotal == null
      ? null
      : Number(query.maxTotal);

  if (minTotal !== null && maxTotal !== null && minTotal > maxTotal) {
    [minTotal, maxTotal] = [maxTotal, minTotal];
  }

  // Only allow valid sorting columns.
  const allowedSorts = ["id", "name", "total", "payment", "date"];

  let sortBy = allowedSorts.includes(query.sortBy) ? query.sortBy : "date";

  let sortOrder =
    String(query.sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

  return {
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
    minTotal:
      minTotal !== null && Number.isFinite(minTotal) && minTotal >= 0
        ? minTotal
        : null,

    maxTotal:
      maxTotal !== null && Number.isFinite(maxTotal) && maxTotal >= 0
        ? maxTotal
        : null,

    sortBy,
    sortOrder,
  };
}

// Calculate percentage change.
function calculateChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return round(((current - previous) / previous) * 100);
}

// Create invoices for orders that do not have an invoice.
async function syncMissingInvoices() {
  const models = db.sequelize.models;
  const OrderModel = models.Orders || models.Order;

  if (!OrderModel) {
    console.warn("Orders model not found");
    return;
  }

  const orders = await OrderModel.findAll({
    attributes: ["id"],
    raw: true,
  });

  const invoiceOrderIds = await invoiceRepository.allOrderIds();

  const existingIds = new Set(invoiceOrderIds.map(Number));

  for (const orderData of orders) {
    if (existingIds.has(Number(orderData.id))) {
      continue;
    }

    try {
      const order = await orderRepository.findById(orderData.id);

      if (order) {
        await invoiceService.createForOrder(order);
      }
    } catch (error) {
      console.error(
        `Could not create invoice for order ${orderData.id}:`,
        error.message,
      );
    }
  }
}

const invoiceService = {
  // Create an invoice for an order.
  async createForOrder(order, couponCode = null) {
    const existingInvoice = await invoiceRepository.findByOrderId(order.id);

    if (existingInvoice) {
      return existingInvoice;
    }

    const customer = order.user || {};
    const items = order.items || [];

    // Calculate the total price of all items.
    const itemsTotal = round(
      items.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.quantity);
      }, 0),
    );

    const subtotal = Number(order.subtotal) || 0;
    const tax = Number(order.tax) || 0;

    const invoiceData = {
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

      discount: round(Math.max(itemsTotal - subtotal, 0)),

      couponCode,

      shippingCost: Number(order.shippingCost) || 0,
      tax,

      taxRate: subtotal > 0 ? Math.round((tax / subtotal) * 10000) / 10000 : 0,

      total: Number(order.total) || 0,

      paymentMethod: order.paymentMethod,
      cardLast4: order.cardLast4 || "",
    };

    return invoiceRepository.create(invoiceData);
  },

  // Get one invoice using an order ID.
  async getByOrderId(orderId, user) {
    const id = Number(String(orderId).replace(/\D/g, ""));

    if (!id) {
      throw new AppError("Invalid order id", 400);
    }

    const order = await orderRepository.findById(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (user.role !== "admin" && String(order.userId) !== String(user.id)) {
      throw new AppError("Forbidden", 403);
    }

    const invoice = await invoiceService.createForOrder(order);

    return formatInvoice(invoice, order);
  },

  // Get invoices for the admin table.
  async list(query = {}) {
    await syncMissingInvoices();

    const filters = prepareFilters(query);

    const result = await invoiceRepository.findPaginated(filters);

    return {
      rows: result.rows.map(formatRow),
      totalItems: result.count,

      totalPages: Math.max(1, Math.ceil(result.count / filters.limit)),

      page: filters.page,
      limit: filters.limit,
    };
  },

  // Get invoice statistics for admin cards.
  async stats() {
    await syncMissingInvoices();

    const now = new Date();

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const all = await invoiceRepository.summary();

    const current = await invoiceRepository.summary(sevenDaysAgo, now);

    const previous = await invoiceRepository.summary(
      fourteenDaysAgo,
      sevenDaysAgo,
    );

    return {
      ...all,

      changes: {
        total: calculateChange(current.total, previous.total),

        revenue: calculateChange(current.revenue, previous.revenue),

        card: calculateChange(current.card, previous.card),

        cod: calculateChange(current.cod, previous.cod),
      },
    };
  },
};

export default invoiceService;
