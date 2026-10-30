// backend: src/models/authority.model.js
//
// Register it in src/models/index.js the same way Users is registered:
//
//   import AdminMemberModel from "./authority.model.js";
//   const AdminMembers = AdminMemberModel(sequelize, DataTypes);
//   export { ..., AdminMembers };
//
// Table: admin_members  (the ONLY new table)
import { DataTypes } from "sequelize";

export const AdminMemberModel = (sequelize) => {
  return sequelize.define(
    "AdminMembers",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "Support",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "Active",
      },

      // Pages this member's role can open. Stored as JSON text
      // (TEXT works on MySQL and MariaDB / XAMPP).
      permissions: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const raw = this.getDataValue("permissions");
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        },
        set(value) {
          if (value == null) this.setDataValue("permissions", null);
          else if (typeof value === "string")
            this.setDataValue("permissions", value);
          else this.setDataValue("permissions", JSON.stringify(value));
        },
      },

      lastActive: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admin_members",
      timestamps: true,
    },
  );

  return AdminMembers;
};
