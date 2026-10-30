// Creates the admin_profiles table (one row per admin user).
// If your other migrations use CommonJS, replace "export default" with
// "module.exports =" and rename the file to .cjs.
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_profiles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      email: { type: Sequelize.STRING(120), allowNull: true },
      countryCode: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: "+1",
      },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      birthDate: { type: Sequelize.DATEONLY, allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      card: { type: Sequelize.STRING(30), allowNull: true },
      bio: { type: Sequelize.STRING(250), allowNull: true },
      image: { type: Sequelize.STRING(500), allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin_profiles");
  },
};
