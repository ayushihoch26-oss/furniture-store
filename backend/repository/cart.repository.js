import { Carts, CartItems, Users, Products } from "../models/index.js";

const itemsInclude = {
  model: CartItems,
  as: "items",
  include: [{ model: Products, as: "product" }],
};

const cartRepository = {
  // Customer
  findActiveByUser(userId) {
    return Carts.findOne({
      where: { userId, status: "active" },
      include: [itemsInclude],
      order: [[{ model: CartItems, as: "items" }, "id", "ASC"]],
    });
  },

  create(data) {
    return Carts.create(data);
  },

  findProductById(id) {
    return Products.findByPk(id);
  },

  findItem(cartId, productId) {
    return CartItems.findOne({
      where: { cartId, productId },
    });
  },

  findItemInCart(cartId, itemId) {
    return CartItems.findOne({
      where: { id: itemId, cartId },
    });
  },

  createItem(data) {
    return CartItems.create(data);
  },

  updateItem(item, data) {
    return item.update(data);
  },

  deleteItem(id) {
    return CartItems.destroy({ where: { id } });
  },

  updateStatus(id, status) {
    return Carts.update({ status }, { where: { id } });
  },

  // Admin
  async findAll({ status, page = 1, limit = 8 } = {}) {
    const where = status && status !== "all" ? { status } : {};

    const { rows, count } = await Carts.findAndCountAll({
      where,
      include: [{ model: Users, as: "user" }, itemsInclude],
      distinct: true,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    return { carts: rows, total: count, page, limit };
  },

  findByIdFull(id) {
    return Carts.findByPk(id, {
      include: [{ model: Users, as: "user" }, itemsInclude],
    });
  },

  count(where = {}) {
    return Carts.count({ where });
  },

  delete(id) {
    return Carts.destroy({ where: { id } });
  },
};

export default cartRepository;
