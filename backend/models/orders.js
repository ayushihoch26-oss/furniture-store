import { DataTypes } from "sequelize";

export default function defineOrder(sequelize) {
  return sequelize.define(
    "Orders",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      shippingMethod: {
        type: DataTypes.STRING,
        defaultValue: "standard",
        validate: { isIn: [["standard", "express"]] },
      },
      paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: "card",
        validate: { isIn: [["card", "cod"]] },
      },
      cardLast4: DataTypes.STRING(4),
      notes: DataTypes.TEXT,

      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      shippingCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      status: {
        type: DataTypes.STRING,
        defaultValue: "Pending",
        validate: { isIn: [["Pending", "Shipped", "Delivered", "Cancelled"]] },
      },
      paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: "Unpaid",
        validate: { isIn: [["Paid", "Unpaid"]] },
      },
    },
    { tableName: "Orders" },
  );
}
