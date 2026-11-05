import { Op } from "sequelize";
import { AdminMembers } from "../models/index.js";

// searching
export const seachAuthority = async (search = "") => {
  const where = {};

  if (search.trim()) {
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

  return AdminMembers.findAll({
    where,
    order: [["id", "DESC"]],
  });
};

// pagination
export const pagintion = async ({
  page = 1,
  limit = 8,
  search = "",
  status = "",
  role = "",
  sortOrder = "desc",
} = {}) => {
  const where = {};

  if (status) where.status = status;
  if (role) where.role = role;

  if (search.trim()) {
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
};

// sorting by last active
// Sort members by last active
export const sortingLastActive = async (sortOrder = "desc") => {
  const direction = sortOrder === "asc" ? "ASC" : "DESC";

  return AdminMembers.findAll({
    order: [
      ["lastActive", direction],
      ["id", "DESC"],
    ],
  });
};

// filter by role base
// Filter members by role
export const filterRoleBase = async (role) => {
  const where = {};

  if (role) {
    where.role = role;
  }

  return AdminMembers.findAll({
    where,
    order: [["id", "DESC"]],
  });
};

// get all role
export const findAll = async () => {
  return AdminMembers.findAll();
};

// get stats
export const getStats = async () => {
  const [total, active, inactive] = await Promise.all([
    AdminMembers.count(),
    AdminMembers.count({ where: { status: "Active" } }),
    AdminMembers.count({ where: { status: "Inactive" } }),
  ]);

  return { total, active, inactive };
};

// find by id
export const findById = async (id) => {
  return AdminMembers.findByPk(id);
};

// find by ids
export const findByIds = async (ids) => {
  return AdminMembers.findAll({
    where: { id: ids },
  });
};

// find by email
export const findByEmail = async (email) => {
  return AdminMembers.findOne({
    where: { email },
  });
};

// find permission by role
export const findWithPermissionsByRole = async (role) => {
  return AdminMembers.findOne({
    where: {
      role,
      permissions: { [Op.ne]: null },
    },
    order: [["updatedAt", "DESC"]],
  });
};

// Active members of a role (used to protect the last Super Admin)
export const countActiveByRole = async (role) => {
  return AdminMembers.count({
    where: {
      role,
      status: "Active",
    },
  });
};

// create authority
export const create = async (data) => {
  return AdminMembers.create(data);
};

// update authority
export const update = async (id, data) => {
  const member = await AdminMembers.findByPk(id);

  if (!member) return null;

  return member.update(data);
};

// update permissions by role
export const updatePermissionsByRole = async (role, modules) => {
  return AdminMembers.update(
    { permissions: JSON.stringify(modules) },
    { where: { role } },
  );
};

// delete authority by id
export const deleteById = async (id) => {
  const member = await AdminMembers.findByPk(id);

  if (!member) return null;

  await member.destroy();

  return member;
};

// delete multiple authorities
export const deleteByIds = async (ids) => {
  return AdminMembers.destroy({
    where: { id: ids },
  });
};

export default {
  seachAuthority,
  pagintion,
  sortingLastActive,
  filterRoleBase,
  findAll,
  getStats,
  findById,
  findByIds,
  findByEmail,
  findWithPermissionsByRole,
  countActiveByRole,
  create,
  update,
  updatePermissionsByRole,
  deleteById,
  deleteByIds,
};
