export default {
  async up(queryInterface, Sequelize) {
    // 1. Add country to Users
    await queryInterface.addColumn("Users", "country", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "United States",
    });

    // 2. Copy existing country from orders to users (so no data is lost)
    await queryInterface.sequelize.query(`
      UPDATE Users u
      JOIN Orders o ON o.userId = u.id
      SET u.country = o.country
    `);

    // 3. Remove country from Orders
    await queryInterface.removeColumn("Orders", "country");
  },

  async down(queryInterface, Sequelize) {
    // Undo: add back to Orders, remove from Users
    await queryInterface.addColumn("Orders", "country", {
      type: Sequelize.STRING,
      defaultValue: "United States",
    });

    await queryInterface.removeColumn("Users", "country");
  },
};
