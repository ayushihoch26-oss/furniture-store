import { DataTypes } from "sequelize";

export default function defineInvoice(sequelize) {
  return sequelize.define(
    "Invoices",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Customer details copied at the time of the order
      customerName: { type: DataTypes.STRING, allowNull: false },
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      street: DataTypes.STRING,
      apartment: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
      country: DataTypes.STRING,

      // Amounts
      itemsTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      couponCode: DataTypes.STRING,
      shippingCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      taxRate: { type: DataTypes.DECIMAL(5, 4), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

      paymentMethod: DataTypes.STRING,
      cardLast4: DataTypes.STRING(4),
    },
    { tableName: "Invoices" },
  );
}
