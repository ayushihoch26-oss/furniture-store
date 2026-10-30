import { DataTypes } from "sequelize";

export default function defineUser(sequelize) {
  return sequelize.define(
    "Users",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, defaultValue: "" },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: DataTypes.STRING,
      password: { type: DataTypes.STRING, allowNull: false },
      birthdate: DataTypes.DATEONLY,
      gender: {
        type: DataTypes.STRING,
        validate: { isIn: [["male", "female", "other"]] },
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "customer",
        validate: { isIn: [["customer", "admin"]] },
      },

      // Address (moved from Orders)
      street: DataTypes.STRING,
      apartment: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
      country: { type: DataTypes.STRING, defaultValue: "United States" },

      // Forgot password: only the SHA-256 hash of the emailed token is stored
      resetPasswordToken: DataTypes.STRING,
      resetPasswordExpires: DataTypes.DATE,
    },
    {
      tableName: "Users",
      // Never send the password or reset token to the frontend
      defaultScope: {
        attributes: {
          exclude: ["password", "resetPasswordToken", "resetPasswordExpires"],
        },
      },
      scopes: {
        withPassword: {
          attributes: {
            exclude: ["resetPasswordToken", "resetPasswordExpires"],
          },
        },
      },
    },
  );
}
