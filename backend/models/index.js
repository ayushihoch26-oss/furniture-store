import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";

import defineUser from "./users.js";
import defineContactUs from "./contactus.js";
import defineOrder from "./orders.js";
import defineOrderItem from "./orderitems.js";
import { CartModel, CartItemModel } from "./cart.js";
import { ProductModel } from "./products.js";
import { WishlistModel } from "./wishlist.js";
import { AdminProfileModel } from "./adminprofile.js";
import { CategoryModel } from "./category.js";
import { AdminMemberModel } from "./authority.js";
import defineInvoice from "./invoice.js";
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  },
);

export const Users = defineUser(sequelize);
export const ContactUs = defineContactUs(sequelize);
export const Orders = defineOrder(sequelize);
export const OrderItems = defineOrderItem(sequelize);

export const Carts = CartModel(sequelize, DataTypes);
export const CartItems = CartItemModel(sequelize, DataTypes);
export const Products = ProductModel(sequelize);
export const Wishlists = WishlistModel(sequelize, DataTypes);
export const AdminProfiles = AdminProfileModel(sequelize, DataTypes);
export const Categories = CategoryModel(sequelize);
export const AdminMembers = AdminMemberModel(sequelize, DataTypes);
export const Invoices = defineInvoice(sequelize);

// Order associations
Orders.hasMany(OrderItems, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});

Orders.belongsTo(Users, { foreignKey: "userId", as: "user" });
Users.hasMany(Orders, { foreignKey: "userId", as: "orders" });
Carts.belongsTo(Users, {
  foreignKey: "userId",
  as: "user",
});

// Cart and CartItems associations
Carts.hasMany(CartItems, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});
CartItems.belongsTo(Carts, {
  foreignKey: "cartId",
  as: "cart",
});

// Product and CartItems associations
Products.hasMany(CartItems, {
  foreignKey: "productId",
  as: "cartItems",
});
CartItems.belongsTo(Products, {
  foreignKey: "productId",
  as: "product",
});

Users.hasMany(Wishlists, { foreignKey: "userId", onDelete: "CASCADE" });
Wishlists.belongsTo(Users, { foreignKey: "userId" });

Products.hasMany(Wishlists, { foreignKey: "productId", onDelete: "CASCADE" });
Wishlists.belongsTo(Products, { foreignKey: "productId", as: "product" });

// Admin profile (one profile per user)
Users.hasOne(AdminProfiles, {
  foreignKey: "userId",
  as: "adminProfile",
  onDelete: "CASCADE",
});
AdminProfiles.belongsTo(Users, { foreignKey: "userId", as: "user" });

const db = {
  sequelize,
  Sequelize,
  Users,
  ContactUs,
  Orders,
  OrderItems,
  Carts,
  CartItems,
  Products,
  Wishlists,
  AdminProfiles,
  Categories,
  AdminMembers,
  Invoices,
};

export default db;
