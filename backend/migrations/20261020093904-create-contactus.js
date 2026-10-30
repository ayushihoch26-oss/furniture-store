"use strict";

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("ContactUs", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    phone: { type: Sequelize.STRING, allowNull: true },
    subject: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "General Question",
    },
    message: { type: Sequelize.TEXT, allowNull: false },
    status: { type: Sequelize.STRING, allowNull: false, defaultValue: "New" },
    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("ContactUs");
}
