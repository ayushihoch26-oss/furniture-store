export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Wishlists", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Products", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // one product can be saved only once per user
    await queryInterface.addIndex("Wishlists", ["userId", "productId"], {
      unique: true,
      name: "wishlists_user_product_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Wishlists");
  },
};
