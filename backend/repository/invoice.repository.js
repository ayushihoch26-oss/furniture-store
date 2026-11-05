import { Invoices } from "../models/index.js";
import { Op, fn, col } from "sequelize";

// Escape special characters for search
const escapeLike = (text) => {
  return text.replace(/[\\%_]/g, "\\$&");
};

// Create invoice
export const create = async (data) => {
  return await Invoices.create(data);
};

// Find invoice by order ID
export const findByOrderId = async (orderId) => {
  return await Invoices.findOne({
    where: { orderId },
  });
};

// Get all order IDs that have invoices
export const allOrderIds = async () => {
  const rows = await Invoices.findAll({
    attributes: ["orderId"],
    raw: true,
  });

  return rows.map((row) => row.orderId);
};

// Get all invoices
export const findAll = async () => {
  return await Invoices.findAll();
};

// Filter invoices by date
export const dateFilter = async (startDate, endDate) => {
  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      where.createdAt[Op.gte] = new Date(`${startDate}T00:00:00.000`);
    }

    if (endDate) {
      where.createdAt[Op.lte] = new Date(`${endDate}T23:59:59.999`);
    }
  }

  return await Invoices.findAll({ where });
};

// Search invoices
export const searchInvoice = async (search) => {
  const where = {};

  if (search) {
    const searchText = String(search).trim();
    const like = `%${escapeLike(searchText)}%`;

    const or = [
      { customerName: { [Op.like]: like } },
      { email: { [Op.like]: like } },
      { phone: { [Op.like]: like } },
      { couponCode: { [Op.like]: like } },
    ];

    // Search by invoice number or order number
    const idMatch = searchText.match(/^#?(?:INV-?|ORD-?)?0*(\d+)$/i);

    if (idMatch) {
      or.push({
        orderId: Number(idMatch[1]),
      });
    }

    where[Op.or] = or;
  }

  return await Invoices.findAll({ where });
};

// Filter invoices by payment method
export const filterByPayment = async (paymentMethod) => {
  const where = {};

  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
  }

  return await Invoices.findAll({ where });
};

// Filter invoices by total amount
export const filterByTotal = async (minTotal, maxTotal) => {
  const where = {};

  if (minTotal != null || maxTotal != null) {
    where.total = {};

    if (minTotal != null) {
      where.total[Op.gte] = Number(minTotal);
    }

    if (maxTotal != null) {
      where.total[Op.lte] = Number(maxTotal);
    }
  }

  return await Invoices.findAll({ where });
};

// Get paginated invoices
export const findPaginated = async (limit = 8, page = 1) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 8, 1), 100);

  return await Invoices.findAndCountAll({
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
    order: [["id", "DESC"]],
  });
};

// Sort invoices by total amount
export const sortByTotal = async (sortOrder = "highToLow") => {
  const direction = sortOrder === "lowToHigh" ? "ASC" : "DESC";

  return await Invoices.findAll({
    order: [
      ["total", direction],
      ["id", "DESC"],
    ],
  });
};

// Get invoice summary
export const summary = async (from, to) => {
  const where = {};

  if (from || to) {
    where.createdAt = {};

    if (from) {
      where.createdAt[Op.gte] = from;
    }

    if (to) {
      where.createdAt[Op.lte] = to;
    }
  }

  const rows = await Invoices.findAll({
    attributes: [
      "paymentMethod",
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("total")), "revenue"],
    ],
    where,
    group: ["paymentMethod"],
    raw: true,
  });

  const result = {
    total: 0,
    revenue: 0,
    card: 0,
    cod: 0,
  };

  rows.forEach((row) => {
    const count = Number(row.count);

    result.total += count;
    result.revenue += Number(row.revenue) || 0;

    if (row.paymentMethod === "cod") {
      result.cod += count;
    } else if (row.paymentMethod === "card") {
      result.card += count;
    }
  });

  result.revenue = Math.round(result.revenue * 100) / 100;

  return result;
};

export default {
  create,
  findByOrderId,
  allOrderIds,
  findAll,
  dateFilter,
  searchInvoice,
  filterByPayment,
  filterByTotal,
  findPaginated,
  sortByTotal,
  summary,
};
