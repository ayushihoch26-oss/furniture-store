// Same style as products.js / wishlist.js: a function that receives sequelize
export const AdminProfileModel = (sequelize, DataTypes) => {
  const AdminProfiles = sequelize.define(
    "AdminProfiles",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
      },
      email: { type: DataTypes.STRING(120), allowNull: true },
      countryCode: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: "+1",
      },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      birthDate: { type: DataTypes.DATEONLY, allowNull: true },
      location: { type: DataTypes.STRING(255), allowNull: true },
      card: { type: DataTypes.STRING(30), allowNull: true },
      bio: { type: DataTypes.STRING(250), allowNull: true },
      image: { type: DataTypes.STRING(500), allowNull: true },
    },
    { tableName: "admin_profiles", timestamps: true },
  );

  return AdminProfiles;
};
