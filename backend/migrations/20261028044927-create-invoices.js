// Migration (ES module version). Put it in your migrations folder.
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("Invoices", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // One invoice per order. Deleting the order deletes its invoice.
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Orders", key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },

    // Customer details copied at the time of the order
    customerName: { type: Sequelize.STRING, allowNull: false },
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    street: Sequelize.STRING,
    apartment: Sequelize.STRING,
    city: Sequelize.STRING,
    state: Sequelize.STRING,
    zip: Sequelize.STRING,
    country: Sequelize.STRING,

    // Amounts
    itemsTotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
    discount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    couponCode: Sequelize.STRING,
    shippingCost: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    tax: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
    taxRate: { type: Sequelize.DECIMAL(5, 4), defaultValue: 0 },
    total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },

    paymentMethod: Sequelize.STRING,
    cardLast4: Sequelize.STRING(4),

    createdAt: { type: Sequelize.DATE, allowNull: false },
    updatedAt: { type: Sequelize.DATE, allowNull: false },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("Invoices");
}
