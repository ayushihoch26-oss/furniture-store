// models/wishlist.model.js

export const WishlistModel = (sequelize, DataTypes) => {
  const Wishlists = sequelize.define(
    "Wishlists",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "Wishlists",
      indexes: [{ unique: true, fields: ["userId", "productId"] }],
    },
  );
  return Wishlists;
};

