// Save as: migrations/20261027000000-create-admin-members.js
// ES module version (matches a project with "type": "module").

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("admin_members", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true,
    },
    role: {
      type: Sequelize.STRING(30),
      allowNull: false,
      defaultValue: "Support",
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "Active",
    },
    permissions: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    lastActive: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

  // Optional: the same sample members the page used to show.
  // Delete this block if you do not want sample data.
  await queryInterface.bulkInsert(
    "admin_members",
    [
      {
        name: "Wade Warren",
        email: "wade.warren@example.com",
        role: "Super Admin",
        status: "Active",
        lastActive: new Date("2026-10-20"),
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "Manager",
        status: "Active",
        lastActive: new Date("2026-10-19"),
      },
      {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        role: "Editor",
        status: "Active",
        lastActive: new Date("2026-10-18"),
      },
      {
        name: "Michael Brown",
        email: "michael.b@example.com",
        role: "Support",
        status: "Inactive",
        lastActive: new Date("2026-10-02"),
      },
      {
        name: "Sarah Wilson",
        email: "sarah.w@example.com",
        role: "Manager",
        status: "Active",
        lastActive: new Date("2026-10-17"),
      },
      {
        name: "David Miller",
        email: "david.m@example.com",
        role: "Editor",
        status: "Inactive",
        lastActive: new Date("2026-09-28"),
      },
      {
        name: "Olivia Taylor",
        email: "olivia.t@example.com",
        role: "Support",
        status: "Active",
        lastActive: new Date("2026-10-20"),
      },
      {
        name: "James Anderson",
        email: "james.a@example.com",
        role: "Support",
        status: "Active",
        lastActive: new Date("2026-10-16"),
      },
    ].map((row) => ({ ...row, createdAt: new Date(), updatedAt: new Date() })),
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("admin_members");
}

export default { up, down };
