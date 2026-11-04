import { Op, literal } from "sequelize";
import db, { Orders, OrderItems, Users } from "../models/index.js";

const orderRelations = [
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

const SORT_COLUMNS = {
  id: "id",
  orderid: "id",
  createdat: "createdAt",
  date: "createdAt",
  total: "total",
  status: "status",
  paymentstatus: "paymentStatus",
};

function getSortOrder(sortBy, sortOrder) {
  const column = String(sortBy || "").trim().toLowerCase();
  const direction = String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";

  if (column === "customer") {
    return [
      [{ model: Users, as: "user" }, "firstName", direction],
      ["id", direction],
    ];
  }

  const sortColumn = Object.hasOwn(SORT_COLUMNS, column)
    ? SORT_COLUMNS[column]
    : SORT_COLUMNS.createdat;

  return [[sortColumn, direction], ["id", direction]];
}

// Match orders by customer information, product name, or order number.
function buildSearchConditions(searchText) {
  const searchPattern = db.sequelize.escape(`%${searchText}%`);

  const matchingCustomerIds = literal(
    `(SELECT id FROM Users WHERE email LIKE ${searchPattern} OR firstName LIKE ${searchPattern} OR lastName LIKE ${searchPattern} OR CONCAT(firstName, ' ', lastName) LIKE ${searchPattern})`,
  );
  const matchingOrderIds = literal(
    `(SELECT orderId FROM OrderItems WHERE name LIKE ${searchPattern})`,
  );

  const conditions = [
    { userId: { [Op.in]: matchingCustomerIds } },
    { id: { [Op.in]: matchingOrderIds } },
  ];

  const digits = searchText.replace(/\D/g, "");
  if (digits) {
    conditions.push({ id: Number(digits) });
  }

  return conditions;
}

function addFilters(where, filters) {
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  const searchText = String(filters.search || "").trim();
  if (searchText) {
    where[Op.or] = buildSearchConditions(searchText);
  }
}

function addDateRange(where, startDate, endDate) {
  if (!startDate && !endDate) {
    return;
  }

  where.createdAt = {};

  if (startDate) {
    where.createdAt[Op.gte] = new Date(`${startDate}T00:00:00`);
  }

  if (endDate) {
    where.createdAt[Op.lte] = new Date(`${endDate}T23:59:59.999`);
  }
}

function normalizePagination(page, limit) {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 8, 1), 100);

  return {
    page: pageNumber,
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  };
}

const orderRepository = {
  // Save the order and its items together, or save neither if something fails.
  async create(orderData, items) {
    return db.sequelize.transaction(async (transaction) => {
      const order = await Orders.create(orderData, { transaction });
      const orderItems = items.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await OrderItems.bulkCreate(orderItems, { transaction });

      return Orders.findByPk(order.id, {
        include: orderRelations,
        transaction,
      });
    });
  },

  // Get orders for a customer or the admin page.
  findAll(filters = {}) {
    const where = {};
    addFilters(where, filters);

    return Orders.findAll({
      where,
      include: orderRelations,
      order: [["createdAt", "DESC"]],
    });
  },

  // Get a filtered, paginated list of orders for the admin page.
  findAllPaginated(filters = {}) {
    const {
      page = 1,
      limit = 8,
      startDate = "",
      endDate = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;
    const where = {};
    const pagination = normalizePagination(page, limit);

    addFilters(where, filters);
    addDateRange(where, startDate, endDate);

    return Orders.findAndCountAll({
      where,
      include: orderRelations,
      limit: pagination.limit,
      offset: pagination.offset,
      order: getSortOrder(sortBy, sortOrder),
      distinct: true,
    });
  },

  findById(id) {
    return Orders.findByPk(id, { include: orderRelations });
  },

  async update(id, data) {
    const order = await Orders.findByPk(id);
    if (!order) {
      return null;
    }

    await order.update(data);
    return Orders.findByPk(id, { include: orderRelations });
  },

  // Remove the order and its items together.
  delete(id) {
    return db.sequelize.transaction(async (transaction) => {
      await OrderItems.destroy({
        where: { orderId: id },
        transaction,
      });

      return Orders.destroy({ where: { id }, transaction });
    });
  },

  count(status) {
    const options = status ? { where: { status } } : {};
    return Orders.count(options);
  },
};

export default orderRepository;