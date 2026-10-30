import { Op, fn, col } from "sequelize";
import { Invoices } from "../models/index.js";

// Only these columns can be sorted (the invoice number is built from orderId)
const SORT_COLUMNS = {
  id: "orderId",
  name: "customerName",
  total: "total",
  payment: "paymentMethod",
  date: "createdAt",
};

// Escape % and _ so the search text is treated as plain text
const escapeLike = (text) => text.replace(/[\\%_]/g, "\\$&");

const startOfDay = (iso) => new Date(`${iso}T00:00:00.000`);
const endOfDay = (iso) => new Date(`${iso}T23:59:59.999`);

function buildWhere({
  search,
  paymentMethod,
  fromDate,
  toDate,
  minTotal,
  maxTotal,
}) {
  const where = {};

  if (paymentMethod) where.paymentMethod = paymentMethod;

  if (fromDate || toDate) {
    where.createdAt = {
      [Op.between]: [
        startOfDay(fromDate || toDate),
        endOfDay(toDate || fromDate),
      ],
    };
  }

  if (minTotal !== null || maxTotal !== null) {
    where.total = {};
    if (minTotal !== null) where.total[Op.gte] = minTotal;
    if (maxTotal !== null) where.total[Op.lte] = maxTotal;
  }

  if (search) {
    const like = `%${escapeLike(search)}%`;
    const or = [
      { customerName: { [Op.like]: like } },
      { email: { [Op.like]: like } },
      { phone: { [Op.like]: like } },
      { couponCode: { [Op.like]: like } },
    ];

    // Search by invoice / order number: "9", "INV-0009", "#ORD0009"
    const idMatch = search.match(/^#?(?:INV-?|ORD-?)?0*(\d+)$/i);
    if (idMatch) or.push({ orderId: Number(idMatch[1]) });

    where[Op.or] = or;
  }

  return where;
}

const invoiceRepository = {
  create(data) {
    return Invoices.create(data);
  },

  findByOrderId(orderId) {
    return Invoices.findOne({ where: { orderId } });
  },

  // Ids of orders that already have an invoice
  async allOrderIds() {
    const rows = await Invoices.findAll({ attributes: ["orderId"], raw: true });
    return rows.map((row) => row.orderId);
  },

  // One page of invoices + total count for the same filters
  findPaginated({ page, limit, sortBy, sortOrder, ...filters }) {
    const column = SORT_COLUMNS[sortBy] || SORT_COLUMNS.date;
    const direction = sortOrder === "asc" ? "ASC" : "DESC";

    return Invoices.findAndCountAll({
      where: buildWhere(filters),
      order: [
        [column, direction],
        ["id", direction], // stable order when values are equal
      ],
      limit,
      offset: (page - 1) * limit,
    });
  },

  // { total, revenue, card, cod } (optionally inside a date range)
  async summary(from, to) {
    const where = {};
    if (from && to) where.createdAt = { [Op.between]: [from, to] };

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

    const result = { total: 0, revenue: 0, card: 0, cod: 0 };
    rows.forEach((row) => {
      const count = Number(row.count);
      result.total += count;
      result.revenue += Number(row.revenue) || 0;
      if (row.paymentMethod === "cod") result.cod += count;
      else result.card += count;
    });
    result.revenue = Math.round(result.revenue * 100) / 100;
    return result;
  },
};

export default invoiceRepository;
