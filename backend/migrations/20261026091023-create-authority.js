"use strict";

const roles = ["Super Admin", "Manager", "Editor", "Support"];
const modules = [
  "Dashboard",
  "Order Management",
  "Customers",
  "Coupon Code",
  "Categories",
  "Transaction",
  "Brand",
  "Products",
  "Product Reviews",
  "Contact Us",
  "Control Authority",
];

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuthorityMembers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      memberCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      role: {
        type: Sequelize.ENUM(...roles),
        allowNull: false,
        defaultValue: "Support",
      },
      status: {
        type: Sequelize.ENUM("Active", "Inactive"),
        allowNull: false,
        defaultValue: "Active",
      },
      lastActive: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("AuthorityPermissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      role: { type: Sequelize.ENUM(...roles), allowNull: false },
      module: { type: Sequelize.STRING(100), allowNull: false },
      allowed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("AuthorityPermissions", ["role", "module"], {
      unique: true,
    });

    const now = new Date();
    const initial = {
      "Super Admin": modules,
      Manager: modules.filter((m) => m !== "Control Authority"),
      Editor: [
        "Dashboard",
        "Categories",
        "Brand",
        "Products",
        "Product Reviews",
      ],
      Support: ["Dashboard", "Order Management", "Customers", "Contact Us"],
    };
    const permissions = roles.flatMap((role) =>
      modules.map((module) => ({
        role,
        module,
        allowed: initial[role].includes(module),
        createdAt: now,
        updatedAt: now,
      })),
    );
    await queryInterface.bulkInsert("AuthorityPermissions", permissions);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("AuthorityPermissions");
    await queryInterface.dropTable("AuthorityMembers");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_AuthorityMembers_role";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_AuthorityMembers_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_AuthorityPermissions_role";',
    );
  },
};
