// backend: src/repository/authority.repository.js
import { Op } from "sequelize";
import { AdminMembers } from "../models/index.js";

const authorityRepository = {
  // Pagination + search + filters + sorting (used by authorityService.list)
  async findAllPaginated({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    role = "",
    sortOrder = "desc",
  } = {}) {
    const where = {};

    if (status) where.status = status;
    if (role) where.role = role;

    if (search) {
      // "#ADM0007" or "adm7" -> search by member id
      const idMatch = /^#?adm0*(\d+)$/i.exec(search.trim());

      if (idMatch) {
        where.id = Number(idMatch[1]);
      } else {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { role: { [Op.like]: `%${search}%` } },
        ];
      }
    }

    const direction = sortOrder === "asc" ? "ASC" : "DESC";

    const { rows, count } = await AdminMembers.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [
        ["lastActive", direction],
        ["id", "DESC"],
      ],
    });

    return {
      members: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  },

  // Counts for the stat cards and the tab badge (ignores filters)
  async getStats() {
    const [total, active, inactive] = await Promise.all([
      AdminMembers.count(),
      AdminMembers.count({ where: { status: "Active" } }),
      AdminMembers.count({ where: { status: "Inactive" } }),
    ]);

    return { total, active, inactive };
  },

  findById(id) {
    return AdminMembers.findByPk(id);
  },

  findByIds(ids) {
    return AdminMembers.findAll({ where: { id: ids } });
  },

  findByEmail(email) {
    return AdminMembers.findOne({ where: { email } });
  },

  // A member of this role that already has saved permissions
  findWithPermissionsByRole(role) {
    return AdminMembers.findOne({
      where: { role, permissions: { [Op.ne]: null } },
      order: [["updatedAt", "DESC"]],
    });
  },

  // Active members of a role (used to protect the last Super Admin)
  countActiveByRole(role) {
    return AdminMembers.count({ where: { role, status: "Active" } });
  },

  create(data) {
    return AdminMembers.create(data);
  },

  async update(id, data) {
    const member = await AdminMembers.findByPk(id);
    if (!member) return null;
    return member.update(data);
  },

  // Same permissions for every member of the role
  updatePermissionsByRole(role, modules) {
    return AdminMembers.update(
      { permissions: JSON.stringify(modules) },
      { where: { role } },
    );
  },

  async deleteById(id) {
    const member = await AdminMembers.findByPk(id);
    if (!member) return null;
    await member.destroy();
    return member;
  },

  deleteByIds(ids) {
    return AdminMembers.destroy({ where: { id: ids } });
  },
};

export default authorityRepository;
