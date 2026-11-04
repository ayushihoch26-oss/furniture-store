import orderRepository from "../repository/ordermanagement.repository.js";
import userRepository from "../repository/user.repository.js";
import invoiceService from "./invoice.service.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ORDER_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Paid", "Unpaid"];

const SHIPPING_COST = { standard: 0, express: 25 };
const TAX_RATE = 0.08;
const COUPONS = { SAVE10: 0.1 }; // same code as the checkout page

const round = (number) => Math.round(number * 100) / 100;

// Format order data. Customer details come from the Users table,
// flattened so the frontend still gets email, firstName, street...
export const formatOrder = (order) => {
  const { user, ...data } = order.toJSON();
  const customer = user || {};

  const items = (data.items || []).map((item) => ({
    ...item,
    price: Number(item.price),
  }));

  return {
    ...data,
    items,

    email: customer.email || "",
    phone: customer.phone || "",
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    street: customer.street || "",
    apartment: customer.apartment || "",
    city: customer.city || "",
    state: customer.state || "",
    zip: customer.zip || "",
    country: customer.country || "",

    subtotal: Number(data.subtotal),
    shippingCost: Number(data.shippingCost),
    tax: Number(data.tax),
    total: Number(data.total),

    orderId: `#ORD${String(data.id).padStart(4, "0")}`,

    productSummary:
      items.length > 1
        ? `${items[0].name} +${items.length - 1} more`
        : items[0]?.name || "",
  };
};

// ============================================================
// CREATE ORDER
// ============================================================

export const create = async (data = {}, user) => {
// ================= USER =================

// Create a new order (user must be logged in)
  if (!user?.id) {
    throw new AppError("Please login to place an order", 401);
  }

  // ---- 1. Validate the order itself ----
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new AppError("Order must have at least one item", 400);
  }

  const shippingMethod = data.shippingMethod || "standard";
  const paymentMethod = data.paymentMethod || "card";

  if (!Object.hasOwn(SHIPPING_COST, shippingMethod)) {
    throw new AppError("Invalid shipping method", 400);
  }

  if (!["card", "cod"].includes(paymentMethod)) {
    throw new AppError("Invalid payment method", 400);
  }

  // Only the last 4 digits are stored. The checkout page sends cardLast4.
  let cardLast4 = null;

  if (paymentMethod === "card") {
    const source = data.cardNumber || data.cardLast4 || "";
    const digits = String(source).replace(/\D/g, "");

    if (digits.length < 4) {
      throw new AppError("Invalid card number", 400);
    }

    cardLast4 = digits.slice(-4);
  }

  let couponRate = 0;
  const couponCode = data.couponCode
    ? String(data.couponCode).trim().toUpperCase()
    : null;

  if (couponCode) {
    if (!COUPONS[couponCode]) {
      throw new AppError("Invalid discount code", 400);
    }

    couponRate = COUPONS[couponCode];
  }

  const items = data.items.map((item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);

    if (
      !item.name ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new AppError("Each item needs name, price and quantity", 400);
    }

    return {
      productId: item.productId || null,
      name: item.name,
      color: item.color || null,
      image: item.image || null,
      price,
      quantity,
    };
  });

  // ---- 2. Save contact + address given at checkout on the user ----
  const profileUpdate = {};

  [
    "firstName",
    "lastName",
    "phone",
    "street",
    "apartment",
    "city",
    "state",
    "zip",
    "country",
  ].forEach((field) => {
    const value = String(data[field] ?? "").trim();
    if (value) profileUpdate[field] = value;
  });

  if (Object.keys(profileUpdate).length > 0) {
    await userRepository.update(user.id, profileUpdate);
  }

  // ---- 3. The profile must now have everything needed for delivery ----
  const profile = await userRepository.findById(user.id);

  if (!profile) {
    throw new AppError("User not found", 404);
  }

  [
    "email",
    "phone",
    "firstName",
    "lastName",
    "street",
    "city",
    "state",
    "zip",
  ].forEach((field) => {
    if (!String(profile[field] || "").trim()) {
      throw new AppError(`${field} is required`, 400);
    }
  });

  // ---- 4. Calculate amounts ----
  const itemsTotal = round(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const discount = round(itemsTotal * couponRate);

  const subtotal = round(itemsTotal - discount); // after discount
  const shippingCost = SHIPPING_COST[shippingMethod];
  const tax = round(subtotal * TAX_RATE);
  const total = round(subtotal + shippingCost + tax);

  // ---- 5. Save ----
  const order = await orderRepository.create(
    {
      userId: user.id,
      shippingMethod,
      paymentMethod,
      cardLast4,
      notes: data.notes?.trim() || null,
      subtotal,
      shippingCost,
      tax,
      total,
    },
    items,
  );
  try {
    await invoiceService.createForOrder(order, couponCode);
  } catch (e) {
    console.error("Invoice creation failed:", e.message);
  }

  return formatOrder(order);
};

// ============================================================
// GET USER ORDERS
// ============================================================

export const listMine = async (userId) => {
  const orders = await orderRepository.findAll({ userId });
  return orders.map(formatOrder);
};

// ============================================================
// GET ORDER DETAIL
// ============================================================

export const getById = async (id, user) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (user.role !== "admin" && String(order.userId) !== String(user.id)) {
    throw new AppError("Forbidden", 403);
  }

  return formatOrder(order);
};

// ============================================================
// GET ALL ORDERS (ADMIN)
// ============================================================

export const list = async ({
  page = 1,
  limit = 8,
  search = "",
  status = "",
  paymentStatus = "",
  startDate = "",
  endDate = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 10, 1), 100);

  if (startDate && endDate && startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  const result = await orderRepository.findAllPaginated({
    page,
    limit,
    search: String(search).trim(),
    status, 
    paymentStatus,
    startDate,
    endDate,
    sortBy: String(sortBy).trim(),
    sortOrder: String(sortOrder).trim().toLowerCase(),
  });

  return {
    orders: result.rows.map(formatOrder),
    total: result.count,
    page,
    limit,
    totalPages: Math.ceil(result.count / limit),
  };
};

// ============================================================
// UPDATE ORDER (ADMIN)
// ============================================================

export const update = async (id, data = {}) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const updateData = {};

  if (data.status !== undefined) {
    if (!ORDER_STATUSES.includes(data.status)) {
      throw new AppError("Invalid order status", 400);
    }
    updateData.status = data.status;
  }

  if (data.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(data.paymentStatus)) {
      throw new AppError("Invalid payment status", 400);
    }
    updateData.paymentStatus = data.paymentStatus;
  }

  // COD orders become paid when delivered
  if (updateData.status === "Delivered" && order.paymentMethod === "cod") {
    updateData.paymentStatus = "Paid";
  }

  const updatedOrder = await orderRepository.update(id, updateData);

  return formatOrder(updatedOrder);
};

// ============================================================
// DELETE ORDER (ADMIN)
// ============================================================

export const remove = async (id) => {
  const deleted = await orderRepository.delete(id);

  if (!deleted) {
    throw new AppError("Order not found", 404);
  }

  return { message: "Order deleted successfully" };
};

// ============================================================
// GET ORDER STATISTICS (ADMIN)
// ============================================================

export const stats = async () => {
  const [total, pending, delivered, cancelled] = await Promise.all([
    orderRepository.count(),
    orderRepository.count("Pending"),
    orderRepository.count("Delivered"),
    orderRepository.count("Cancelled"),
  ]);

  return { total, new: pending, completed: delivered, cancelled };
};

export default {
  create,
  listMine,
  getById,
  list,
  update,
  remove,
  stats,
};
