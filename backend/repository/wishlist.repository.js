import { fn, col } from "sequelize";
import { Wishlists, Products, Users } from "../models/index.js";

// Join the product, and (for admin) the customer
const withProduct = {
  model: Products,
  as: "product",
};

const withUser = {
  model: Users,
  as: "User",
  attributes: ["id", "firstName", "lastName", "email"],
};
const wishlistRepository = {
  // All saved products of a user (newest first)
  findByUser(userId) {
    return Wishlists.findAll({
      where: { userId },
      include: [withProduct],
      order: [["createdAt", "DESC"]],
    });
  },

  findProductById(id) {
    return Products.findByPk(id);
  },

  find(userId, productId) {
    return Wishlists.findOne({ where: { userId, productId } });
  },

  create(data) {
    return Wishlists.create(data);
  },

  // Returns the number of deleted rows (0 if it was not in the wishlist)
  delete(userId, productId) {
    return Wishlists.destroy({ where: { userId, productId } });
  },

  clear(userId) {
    return Wishlists.destroy({ where: { userId } });
  },

  count(userId) {
    return Wishlists.count({ where: { userId } });
  },

  // ---------- Admin ----------

  // All wishlist entries of all users (optional filter by userId / productId)
  async findAll({ userId, productId, page = 1, limit = 8 } = {}) {
    const where = {};

    if (userId) where.userId = userId;
    if (productId) where.productId = productId;

    const { rows, count } = await Wishlists.findAndCountAll({
      where,
      include: [withUser, withProduct],
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return { wishlists: rows, total: count, page, limit };
  },
  findById(id) {
    return Wishlists.findByPk(id);
  },

  deleteById(id) {
    return Wishlists.destroy({ where: { id } });
  },

  countAll() {
    return Wishlists.count();
  },

  // How many different users have saved something
  countUsers() {
    return Wishlists.count({ distinct: true, col: "userId" });
  },

  // How many different products are saved by someone
  countProducts() {
    return Wishlists.count({ distinct: true, col: "productId" });
  },

  // Most wishlisted products: [{ productId, count }]
  topProductIds(limit = 5) {
    return Wishlists.findAll({
      attributes: ["productId", [fn("COUNT", col("id")), "count"]],
      group: ["productId"],
      order: [[fn("COUNT", col("id")), "DESC"]],
      limit,
      raw: true,
    });
  },

  findProductsByIds(ids) {
    return Products.findAll({ where: { id: ids } });
  },
};

export default wishlistRepository;
