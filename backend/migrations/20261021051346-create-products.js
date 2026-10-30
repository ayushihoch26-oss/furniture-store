"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Products", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    productCode: {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    },
    sku: {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    },
    name: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    category: {
      type: Sequelize.STRING(60),
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    salePrice: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },

    material: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    size: {
      type: Sequelize.STRING(60),
      allowNull: true,
    },
    shipping: {
      type: Sequelize.STRING(150),
      allowNull: true,
    },
    isNew: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex("Products", ["category"]);
  await queryInterface.addIndex("Products", ["price"]);
  await queryInterface.addIndex("Products", ["stock"]);
}
export async function down(queryInterface) {
  await queryInterface.dropTable("Products");
}
