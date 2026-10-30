"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("OrderItems", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Orders", key: "id" },
      onDelete: "CASCADE",
    },

    productId: Sequelize.INTEGER,
    name: { type: Sequelize.STRING, allowNull: false },
    color: Sequelize.STRING,
    image: Sequelize.STRING,

    price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },

    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("OrderItems");
}
