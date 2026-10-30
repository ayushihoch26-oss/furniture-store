import { DataTypes } from "sequelize";

export const ProductModel = (sequelize) => {
  return sequelize.define(
    "Products",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Shown in admin list as #PRD0002
      productCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      // Shown in shop modal as SKU-00001
      sku: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // if set (and lower than price) the product shows the SALE badge
      salePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // e.g. ["grey", "brown", "blue"]  (Filter by Color + color dots)

      // "Details" tab in product modal
      material: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      shipping: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      // NEW badge
      isNew: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { tableName: "Products" },
  );
};
