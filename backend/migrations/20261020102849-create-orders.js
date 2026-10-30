"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Orders", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: Sequelize.INTEGER,
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    street: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    apartment: Sequelize.STRING,
    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    zip: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    country: {
      type: Sequelize.STRING,
      defaultValue: "United States",
    },
    shippingMethod: {
      type: Sequelize.STRING,
      defaultValue: "standard",
    },
    paymentMethod: {
      type: Sequelize.STRING,
      defaultValue: "card",
    },
    cardLast4: Sequelize.STRING(4),
    notes: Sequelize.TEXT,
    subtotal: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingCost: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    tax: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "Pending",
    },
    paymentStatus: {
      type: Sequelize.STRING,
      defaultValue: "Unpaid",
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("Orders");
}
