import { Carts, CartItems, Users, Products } from "../models/index.js";
import { Op, literal, where as sequelizeWhere } from "sequelize";

const itemsInclude = {
  model: CartItems,
  as: "items",
  include: [{ model: Products, as: "product" }],
};

// Set safe default values for pagination.
function getPagination(options) {
  let currentPage = Number(
    options.page || options.currentPage || options.pageNumber,
  );
  let pageSize = Number(options.limit || options.pageSize);

  if (!Number.isFinite(currentPage) || currentPage < 1) {
    currentPage = 1;
  } else {
    currentPage = Math.floor(currentPage);
  }

  if (!Number.isFinite(pageSize) || pageSize < 1) {
    pageSize = 8;
  } else {
    pageSize = Math.floor(pageSize);
  }

  if (pageSize > 100) {
    pageSize = 100;
  }

  return {
    page: currentPage,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  };
}

// Find carts by cart code or customer information.
function getSearchWhere(search) {
  const keyword = String(search || "")
    .trim()
    .slice(0, 100)
    .replace(/[\\%_]/g, "\\$&");

  if (!keyword) {
    return null;
  }

  const conditions = [
    // op.like is use for searching matching text
    { cartCode: { [Op.like]: `%${keyword}%` } },
    { "$user.firstName$": { [Op.like]: `%${keyword}%` } },
    { "$user.lastName$": { [Op.like]: `%${keyword}%` } },
    { "$user.email$": { [Op.like]: `%${keyword}%` } },
  ];

  const cartId = Number(keyword);
  if (Number.isInteger(cartId) && cartId > 0) {
    conditions.push({ id: cartId });
  }

  return conditions;
}

// Find carts created between the selected dates.
function getDateWhere(options) {
  let startDate = options.fromDate || options.startDate;
  let endDate = options.toDate || options.endDate;
  const dateWhere = {};
  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if (start && Number.isNaN(start.getTime())) {
    start = null;
  }

  if (end && Number.isNaN(end.getTime())) {
    end = null;
  }

  if (start && end && start > end) {
    const oldStart = start;
    start = end;
    end = oldStart;
  }

  if (start) {
    start.setHours(0, 0, 0, 0);
    dateWhere[Op.gte] = start;
  }

  if (end) {
    end.setHours(23, 59, 59, 999);
    dateWhere[Op.lte] = end;
  }

  return dateWhere;
}

// Choose a supported field and direction for sorting.
function getSortOrder(options) {
  const sortBy = options.sortBy || options.sortField || options.sort || "createdAt";
  const requestedDirection = options.sortOrder || options.order || "DESC";
  let direction = String(requestedDirection).toUpperCase();

  if (direction !== "ASC") {
    direction = "DESC";
  }

  if (sortBy === "status") {
    return [["status", direction], ["id", direction]];
  }

  if (sortBy === "cartCode") {
    return [["cartCode", direction], ["id", direction]];
  }

  if (sortBy === "customer") {
    return [
      [{ model: Users, as: "user" }, "firstName", direction],
      ["id", direction],
    ];
  }

  if (sortBy === "total") {
    const totalQuery = literal(
      "(SELECT COALESCE(SUM(CartItems.price * CartItems.quantity), 0) FROM CartItems WHERE CartItems.cartId = Carts.id)",
    );
    return [[totalQuery, direction], ["id", direction]];
  }

  return [["createdAt", direction], ["id", direction]];
}

// Add a display name and total price to a cart.
function addCartDetails(cart) {
  let total = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    const quantity = Number(item.quantity) || 0;
    total += Number(item.price) * quantity;
    itemCount += quantity;
  }

  if (cart.user) {
    cart.customer = `${cart.user.firstName} ${cart.user.lastName || ""}`.trim();
  } else {
    cart.customer = null;
  }

  cart.total = total;
  cart.subtotal = total;
  cart.itemCount = itemCount;
  return cart;
}

const cartRepository = {
  // Find the user's active cart and its items.
  findActiveByUser(userId) {
    return Carts.findOne({
      where: { userId: userId, status: "active" },
      include: [itemsInclude],
      order: [[{ model: CartItems, as: "items" }, "id", "ASC"]],
    });
  },

  // Create a cart.
  create(data) {
    return Carts.create(data);
  },

  // Find one product.
  findProductById(id) {
    return Products.findByPk(id);
  },

  // Find a product in a cart.
  findItem(cartId, productId) {
    return CartItems.findOne({
      where: { cartId: cartId, productId: productId },
    });
  },

  // Find one cart item by its id.
  findItemInCart(cartId, itemId) {
    return CartItems.findOne({
      where: { id: itemId, cartId: cartId },
    });
  },

  // Add a product to a cart.
  createItem(data) {
    return CartItems.create(data);
  },

  // Change a cart item's quantity or price.
  updateItem(item, data) {
    return item.update(data);
  },

  // Remove one item from a cart.
  deleteItem(id) {
    return CartItems.destroy({ where: { id: id } });
  },

  // Change a cart's status.
  updateStatus(id, status) {
    return Carts.update({ status: status }, { where: { id: id } });
  },

  // Get the admin cart list with search, filters, sorting, and pagination.
  async findAll(options = {}) {
    const filters = options.filter && typeof options.filter === "object"
      ? { ...options, ...options.filter }
      : options;
    const pagination = getPagination(filters);
    const where = {};

    const status = filters.status || options.filter;
    if (typeof status === "string" && status !== "all") {
      where.status = status;
    }

    const customerId = Number(filters.customerId || filters.userId);
    if (Number.isInteger(customerId) && customerId > 0) {
      where.userId = customerId;
    }

    const minItems = Number(filters.minItems);
    if (Number.isInteger(minItems) && minItems > 0) {
      const itemCountQuery = literal(
        "(SELECT COALESCE(SUM(CartItems.quantity), 0) FROM CartItems WHERE CartItems.cartId = Carts.id)",
      );
      where[Op.and] = sequelizeWhere(itemCountQuery, Op.gte, minItems);
    }

    const searchWhere = getSearchWhere(filters.search || filters.keyword);
    if (searchWhere) {
      where[Op.or] = searchWhere;
    }

    const dateWhere = getDateWhere(filters);
    if (Object.keys(dateWhere).length > 0) {
      where.createdAt = dateWhere;
    }

    const result = await Carts.findAndCountAll({
      where: where,
      include: [{ model: Users, as: "user" }],
      distinct: true,
      subQuery: false,
      limit: pagination.limit,
      offset: pagination.offset,
      order: getSortOrder(filters),
    });

    const cartIds = result.rows.map((row) => row.id);
    let items = [];

    if (cartIds.length > 0) {
      items = await CartItems.findAll({
        where: { cartId: { [Op.in]: cartIds } },
        include: [{ model: Products, as: "product" }],
        order: [["id", "ASC"]],
      });
    }

    const carts = [];
    for (const row of result.rows) {
      const cart = row.toJSON();
      cart.items = [];

      for (const item of items) {
        if (Number(item.cartId) === Number(cart.id)) {
          cart.items.push(item.toJSON());
        }
      }

      carts.push(addCartDetails(cart));
    }

    return {
      carts: carts,
      total: result.count,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.count / pagination.limit),
    };
  },

  // Find one cart with its customer and items.
  findByIdFull(id) {
    return Carts.findByPk(id, {
      include: [{ model: Users, as: "user" }, itemsInclude],
    });
  },

  // Count carts.
  count(where = {}) {
    return Carts.count({ where: where });
  },

  // Delete one cart.
  delete(id) {
    return Carts.destroy({ where: { id: id } });
  },
};

export default cartRepository;
