
import { Op, literal } from "sequelize";
import db, { Orders, OrderItems, Users } from "../models/index.js";

// ==========================================
// FIND ORDER BY ID
// ==========================================

export async function findById(id) {
  return await Orders.findByPk(id, {
    include: [
      {
        model: OrderItems,
        as: "items",
      },
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
    ],
  });
}

// ==========================================
// FIND ALL ORDERS
// ==========================================

export async function findAll(filters = {}) {
  const where = {};

  addFilters(where, filters);

  return await Orders.findAll({
    where,
    include: orderRelations,
    order: [["createdAt", "DESC"]],
  });
}

// ==========================================
// FIND ORDERS BY USER ID
// ==========================================

export async function findByUserId(userId) {
  return await Orders.findAll({
    where: { userId },
    include: orderRelations,
    order: [["createdAt", "DESC"]],
  });
}

// ==========================================
// CREATE ORDER WITH ORDER ITEMS
// ==========================================

export async function createOrder(orderData, items) {
  return await db.sequelize.transaction(async (transaction) => {
    const order = await Orders.create(orderData, {
      transaction,
    });

    const orderItems = items.map((item) => ({
      ...item,
      orderId: order.id,
    }));

    await OrderItems.bulkCreate(orderItems, {
      transaction,
    });

    return await Orders.findByPk(order.id, {
      include: orderRelations,
      transaction,
    });
  });
}

// ==========================================
// UPDATE ORDER
// ==========================================

export async function updateOrder(id, data) {
  const order = await Orders.findByPk(id);

  if (!order) {
    return null;
  }

  await order.update(data);

  return await Orders.findByPk(id, {
    include: orderRelations,
  });
}

// ==========================================
// DELETE ORDER
// ==========================================

export async function deleteOrder(id) {
  return await db.sequelize.transaction(async (transaction) => {
    await OrderItems.destroy({
      where: { orderId: id },
      transaction,
    });

    return await Orders.destroy({
      where: { id },
      transaction,
    });
  });
}

// ==========================================
// COUNT ORDERS
// ==========================================

// Count orders
export async function count(status) {
  const options = status ? { where: { status } } : {};

  return await Orders.count(options);
}

// ==========================================
// ORDER RELATIONS
// ==========================================

const orderRelations = [
  {
    model: OrderItems,
    as: "items",
  },
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

// ==========================================
// SEARCH ORDERS
// ==========================================

function buildSearchConditions(searchText) {
  const searchPattern = db.sequelize.escape(`%${searchText}%`);

  const matchingCustomerIds = literal(
    `(SELECT id FROM Users WHERE email LIKE ${searchPattern}
    OR firstName LIKE ${searchPattern}
    OR lastName LIKE ${searchPattern}
    OR CONCAT(firstName, ' ', lastName) LIKE ${searchPattern})`
  );

  const matchingOrderIds = literal(
    `(SELECT orderId FROM OrderItems WHERE name LIKE ${searchPattern})`
  );

  const conditions = [
    {
      userId: {
        [Op.in]: matchingCustomerIds,
      },
    },
    {
      id: {
        [Op.in]: matchingOrderIds,
      },
    },
  ];

  const digits = searchText.replace(/\D/g, "");

  if (digits) {
    conditions.push({
      id: Number(digits),
    });
  }

  return conditions;
}

// ==========================================
// FILTER ORDERS
// ==========================================

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

// ==========================================
// FILTER ORDERS BY DATE
// ==========================================

function addDateRange(where, startDate, endDate) {
  if (!startDate && !endDate) {
    return;
  }

  where.createdAt = {};

  if (startDate) {
    where.createdAt[Op.gte] = new Date(
      `${startDate}T00:00:00`
    );
  }

  if (endDate) {
    where.createdAt[Op.lte] = new Date(
      `${endDate}T23:59:59.999`
    );
  }
}

// ==========================================
// SORT ORDERS
// ==========================================

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

  const direction =
    String(sortOrder).toLowerCase() === "asc" ? "ASC" : "DESC";

  if (column === "customer") {
    return [
      [
        { model: Users, as: "user" },
        "firstName",
        direction,
      ],
      ["id", direction],
    ];
  }

  const sortColumn = Object.hasOwn(SORT_COLUMNS, column)
    ? SORT_COLUMNS[column]
    : SORT_COLUMNS.createdat;

  return [
    [sortColumn, direction],
    ["id", direction],
  ];
}

// ==========================================
// PAGINATION
// ==========================================

function normalizePagination(page, limit) {
  const pageNumber = Math.max(Number(page) || 1, 1);

  const pageSize = Math.min(
    Math.max(Number(limit) || 8, 1),
    100
  );

  return {
    page: pageNumber,
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  };
}

// ==========================================
// GET ALL ORDERS WITH PAGINATION
// ==========================================

export async function findAllPaginated(filters = {}) {
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

  const { count, rows } = await Orders.findAndCountAll({
    where,
    include: orderRelations,
    limit: pagination.limit,
    offset: pagination.offset,
    order: getSortOrder(sortBy, sortOrder),
    distinct: true,
  });

  return {
    orders: rows,
    total: count,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.max(
      Math.ceil(count / pagination.limit),
      1
    ),
  };
}

// ==========================================
// FILTER ORDERS BY DATE
// ==========================================

export async function filterByDate({ startDate, endDate }) {
  const where = {};

  addDateRange(where, startDate, endDate);

  return await Orders.findAll({
    where,
    include: orderRelations,
    order: [["createdAt", "DESC"]],
  });
}

// ==========================================
// SORT ORDERS BY TOTAL
// ==========================================

export async function sortByTotal(order = "asc") {
  const direction =
    String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

  return await Orders.findAll({
    include: orderRelations,
    order: [
      ["total", direction],
      ["id", "DESC"],
    ],
  });
}

// ==========================================
// GET ORDER STATISTICS
// ==========================================

export async function getOrderStats() {
  const [total, pending, completed, cancelled] =
    await Promise.all([
      Orders.count(),
      Orders.count({ where: { status: "pending" } }),
      Orders.count({ where: { status: "completed" } }),
      Orders.count({ where: { status: "cancelled" } }),
    ]);

  return {
    total,
    pending,
    completed,
    cancelled,
  };
}

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default {
  findById,
  findAll,
  findByUserId,
  createOrder,
  updateOrder,
  deleteOrder,
  count,
  findAllPaginated,
  filterByDate,
  sortByTotal,
  getOrderStats,
};
