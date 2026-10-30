import { DataTypes } from "sequelize";

export const CartModel = (sequelize) => {
  return sequelize.define(
    "Carts",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cartCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "abandoned", "converted"),
        defaultValue: "active",
      },
    },
    { tableName: "Carts" },
  );
};

export const CartItemModel = (sequelize) => {
  return sequelize.define(
    "CartItems",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    { tableName: "CartItems" },
  );
};
