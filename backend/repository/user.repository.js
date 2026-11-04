
import { Op, fn, col, literal } from "sequelize";
import { Orders, Users } from "../models/index.js";

// Find user by ID
export async function findById(id) {
  return await Users.findByPk(id);
}

// Find user by ID with password
export async function findByIdWithPassword(id) {
  return await Users.scope("withPassword").findByPk(id);
}

// Find user by email
export async function findByEmail(email) {
  return await Users.findOne({
    where: { email }
  });
}

// Find user by email with password
export async function findByEmailWithPassword(email) {
  return await Users.scope("withPassword").findOne({
    where: { email }
  });
}

// Find valid password reset token
export async function findByValidResetToken(tokenHash) {
  return await Users.findOne({
    where: {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: {
        [Op.gt]: new Date()
      }
    }
  });
}

// Find users with search, pagination and date filter
export async function findAllPaginated({
  page = 1,
  limit = 7,
  search = "",
  startDate = "",
  endDate = "",
  role = ""
} = {}) {
  const where = {};

  if (role) {
    where.role = role;
  }

  // Search users
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } }
    ];
  }

  // Filter by date
  if (startDate || endDate) {
    where.createdAt = {};
  }

  if (startDate) {
    where.createdAt[Op.gte] = new Date(startDate + "T00:00:00");
  }

  if (endDate) {
    where.createdAt[Op.lte] = new Date(endDate + "T23:59:59");
  }

  const result = await Users.findAndCountAll({
    where: where,
    limit: limit,
    offset: (page - 1) * limit,
    order: [["createdAt", "DESC"]]
  });

  const totalPages = Math.ceil(result.count / limit);

  return {
    users: result.rows,
    total: result.count,
    page: page,
    limit: limit,
    totalPages: totalPages
  };
}

// Get customer statistics
export const getUserStats = async () => {
  const startOfMonth = new Date();

  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const total = await Users.count({
    where: { role: "customer" }
  });

  const newThisMonth = await Users.count({
    where: {
      role: "customer",
      createdAt: {
        [Op.gte]: startOfMonth
      }
    }
  });

  return {
    total: total,
    newThisMonth: newThisMonth
  };
}

// Create user
export const create = async (data) => {
  return await Users.create(data);
}

// Update user
export const update = async (id, data) => {
  const user = await Users.findByPk(id);

  if (!user) {
    return null;
  }

  return await user.update(data);
}

// Get order counts for users
export const getOrderCountsByUserIds = async (userIds = []) => {
  if (userIds.length === 0) {
    return {};
  }

  const rows = await Orders.findAll({
    attributes: [
      "userId",
      [fn("COUNT", col("id")), "totalOrders"],
      [
        fn(
          "SUM",
          literal("CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END")
        ),
        "completedOrders"
      ],
      [
        fn(
          "SUM",
          literal("CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END")
        ),
        "canceledOrders"
      ],
      [fn("MAX", col("createdAt")), "lastPurchaseAt"],
      [
        fn(
          "SUM",
          literal("CASE WHEN status <> 'Cancelled' THEN total ELSE 0 END")
        ),
        "totalSpend"
      ]
    ],
    where: {
      userId: {
        [Op.in]: userIds
      }
    },
    group: ["userId"],
    raw: true
  });

  const result = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    result[row.userId] = row;
  }

  return result;
}

// Delete user
export const deleteById=async(id)=> {
  const user = await Users.findByPk(id);

  if (!user) {
    return null;
  }

  await user.destroy();

  return user;
}

// Get customer overview for last 14 days
export const getCustomerOverview = async () =>  {
  const DAY = 24 * 60 * 60 * 1000;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const start = new Date(today.getTime() - 13 * DAY);

  const rows = await Users.findAll({
    where: {
      role: "customer",
      createdAt: {
        [Op.gte]: start
      }
    },
    attributes: ["createdAt"],
    raw: true
  });

  const counts = Array(14).fill(0);

  for (let i = 0; i < rows.length; i++) {
    const date = new Date(rows[i].createdAt);

    date.setHours(0, 0, 0, 0);

    const index = Math.round((date - start) / DAY);

    if (index >= 0 && index < 14) {
      counts[index] = counts[index] + 1;
    }
  }

  return {
    lastWeek: counts.slice(0, 7),
    thisWeek: counts.slice(7)
  };
}

export default {
  findById,
  findByIdWithPassword,
  findByEmail,
  findByEmailWithPassword,
  findByValidResetToken,
  findAllPaginated,
  getUserStats,
  create,
  update,
  getOrderCountsByUserIds,
  deleteById,
  getCustomerOverview
};