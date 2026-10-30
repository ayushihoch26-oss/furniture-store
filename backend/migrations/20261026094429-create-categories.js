// Migration: create Categories table and seed it from existing Products.category values.
// Written for MySQL (matches the Op.like usage in your repository).

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("Categories", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(60),
      allowNull: false,
      unique: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    image: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  // Seed from categories already used by products (skips empty and "Other")
  await queryInterface.sequelize.query(`
    INSERT INTO Categories (name, isActive, createdAt, updatedAt)
    SELECT DISTINCT TRIM(category), true, NOW(), NOW()
    FROM Products
    WHERE category IS NOT NULL
      AND TRIM(category) <> ''
      AND LOWER(TRIM(category)) <> 'other'
  `);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable("Categories");
};
