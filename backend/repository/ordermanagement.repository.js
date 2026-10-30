import { Op, literal } from "sequelize";
import db, { Orders, OrderItems, Users } from "../models/index.js";

// Order items + the customer's details (email, phone, address live in Users now)
const withRelations = [
  { model: OrderItems, as: "items" },
  {
    model: Users,
    as: "user",
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "phone",
      "street",
      "apartment",
      "city",
      "state",
      "zip",
      "country",
    ],
  },
];

// Search by customer, product name or order number.
// Uses sub-queries so it works together with limit/offset.
const buildSearch = (keyword) => {
  const like = db.sequelize.escape(`%${keyword}%`);

  const conditions = [
    {
      userId: {
        [Op.in]: literal(
          `(SELECT id FROM Users WHERE email LIKE ${like} OR firstName LIKE ${like} OR lastName LIKE ${like} OR CONCAT(firstName, ' ', lastName) LIKE ${like})`,
        ),
      },
    },
    {
      id: {
        [Op.in]: literal(
          `(SELECT orderId FROM OrderItems WHERE name LIKE ${like})`,
        ),
      },
    },
  ];

  const digits = keyword.replace(/\D/g, "");
  if (digits) conditions.push({ id: Number(digits) });

  return conditions;
};

const orderRepository = {
  // Create an order and its items
  async create(orderData, items) {
    return db.sequelize.transaction(async (t) => {
      const order = await Orders.create(orderData, { transaction: t });

      await OrderItems.bulkCreate(
        items.map((item) => ({ ...item, orderId: order.id })),
        { transaction: t },
      );

      return Orders.findByPk(order.id, {
        include: withRelations,
        transaction: t,
      });
    });
  },

  // All orders (used for "my orders")
  async findAll({ status, paymentStatus, search = "", userId } = {}) {
    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (userId) where.userId = userId;
    if (search.trim()) where[Op.or] = buildSearch(search.trim());

    return Orders.findAll({
      where,
      include: withRelations,
      order: [["createdAt", "DESC"]],
    });
  },

  // Admin list: pagination + search + filters + date range
  async findAllPaginated({
    page = 1,
    limit = 8,
    search = "",
    status = "",
    paymentStatus = "",
    startDate = "",
    endDate = "",
  } = {}) {
    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate)
        where.createdAt[Op.gte] = new Date(`${startDate}T00:00:00`);
      if (endDate)
        where.createdAt[Op.lte] = new Date(`${endDate}T23:59:59.999`);
    }

    if (search.trim()) where[Op.or] = buildSearch(search.trim());

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 8, 1), 100);

    return Orders.findAndCountAll({
      where,
      include: withRelations,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });
  },

  findById(id) {
    return Orders.findByPk(id, { include: withRelations });
  },

  async update(id, data) {
    const order = await Orders.findByPk(id);
    if (!order) return null;

    await order.update(data);

    return Orders.findByPk(id, { include: withRelations });
  },

  // Delete the order and its items together
  delete(id) {
    return db.sequelize.transaction(async (t) => {
      await OrderItems.destroy({ where: { orderId: id }, transaction: t });
      return Orders.destroy({ where: { id }, transaction: t });
    });
  },

  count(status) {
    return Orders.count(status ? { where: { status } } : {});
  },
};

export default orderRepository;
