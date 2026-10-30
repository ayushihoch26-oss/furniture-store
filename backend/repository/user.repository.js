import { Op, fn, col, literal } from "sequelize";
import { Orders } from "../models/index.js";
import { Users } from "../models/index.js";

const userRepository = {
  findById(id) {
    return Users.findByPk(id);
  },

  findByIdWithPassword(id) {
    return Users.scope("withPassword").findByPk(id);
  },

  findByEmail(email) {
    return Users.findOne({ where: { email } });
  },

  findByEmailWithPassword(email) {
    return Users.scope("withPassword").findOne({ where: { email } });
  },

  // Forgot password: user whose emailed token matches AND has not expired
  findByValidResetToken(tokenHash) {
    return Users.findOne({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });
  },

  // Pagination + search + date filter (used by userService.list)
  async findAllPaginated({
    page = 1,
    limit = 7,
    search = "",
    startDate = "",
    endDate = "",
    role = "",
  } = {}) {
    const where = {};

    if (role) where.role = role; // e.g. only "customer" for the Customers page

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate)
        where.createdAt[Op.gte] = new Date(`${startDate}T00:00:00`);
      if (endDate) where.createdAt[Op.lte] = new Date(`${endDate}T23:59:59`);
    }

    const { rows, count } = await Users.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      users: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  },

  // Used by userService.list (customers only, so admins are not counted)
  async getUserStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const customers = { role: "customer" };

    const [total, newThisMonth] = await Promise.all([
      Users.count({ where: customers }),
      Users.count({
        where: { ...customers, createdAt: { [Op.gte]: startOfMonth } },
      }),
    ]);

    return { total, newThisMonth };
  },

  create(data) {
    return Users.create(data);
  },

  async update(id, data) {
    const user = await Users.findByPk(id);
    if (!user) return null;
    return user.update(data);
  },

  async getOrderCountsByUserIds(userIds = []) {
    if (!userIds.length) return {};

    const rows = await Orders.findAll({
      attributes: [
        "userId",
        [fn("COUNT", col("id")), "totalOrders"],
        [
          fn(
            "SUM",
            literal("CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END"),
          ),
          "completedOrders",
        ],
        [
          fn(
            "SUM",
            literal("CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END"),
          ),
          "canceledOrders",
        ],
        [fn("MAX", col("createdAt")), "lastPurchaseAt"],
        [
          fn(
            "SUM",
            literal("CASE WHEN status <> 'Cancelled' THEN total ELSE 0 END"),
          ),
          "totalSpend",
        ],
      ],
      where: { userId: { [Op.in]: userIds } },
      group: ["userId"],
      raw: true,
    });

    return Object.fromEntries(rows.map((row) => [row.userId, row]));
  },

  // Service calls deleteById; returns the deleted user or null
  async deleteById(id) {
    const user = await Users.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return user;
  },
  // Customers registered in the last 14 days, grouped per day
  // returns { lastWeek: [7 numbers], thisWeek: [7 numbers] } (oldest day first)
  async getCustomerOverview() {
    const DAY = 24 * 60 * 60 * 1000;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - 13 * DAY); // 14 days incl. today

    const rows = await Users.findAll({
      where: { role: "customer", createdAt: { [Op.gte]: start } },
      attributes: ["createdAt"],
      raw: true,
    });

    const counts = Array(14).fill(0);
    rows.forEach((row) => {
      const d = new Date(row.createdAt); 
      d.setHours(0, 0, 0, 0);
      const index = Math.round((d - start) / DAY);
      if (index >= 0 && index < 14) counts[index] += 1;
    });

    return { lastWeek: counts.slice(0, 7), thisWeek: counts.slice(7) };
  },
};

export default userRepository;
