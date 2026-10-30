import { DataTypes } from "sequelize";

export default function defineContactUs(sequelize) {
  return sequelize.define(
    "ContactUs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: DataTypes.STRING,
      subject: {
        type: DataTypes.STRING,
        defaultValue: "General Question",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "New",
        validate: { isIn: [["New", "Read", "Replied"]] },
      },
    },
    {
      tableName: "ContactUs",
    },
  );
}
