// backend: src/service/authority.service.js
import * as authorityRepository from "../repository/authority.repository.js";
import {
  validateAuthorityCreate,
  validateAuthorityDeleteMany,
  validateAuthorityId,
  validateAuthorityList,
  validateAuthorityPermissions,
  validateAuthorityUpdate,
} from "../validator/authority.validator.js";

// ---------- Roles, statuses, pages and default permissions ----------
const ROLES = ["Super Admin", "Manager", "Editor", "Support"];
const MODULES = [
  "Dashboard",
  "Order Management",
  "Customers",
  "Categories",
  "Transaction",
  "Brand",
  "Products",
  "Product Reviews",
  "Contact Us",
  "Control Authority",
];

const DEFAULT_PERMISSIONS = {
  "Super Admin": [...MODULES],
  Manager: MODULES.filter((item) => item !== "Control Authority"),
  Editor: ["Dashboard", "Categories", "Brand", "Products", "Product Reviews"],
  Support: ["Dashboard", "Order Management", "Customers", "Contact Us"],
};

const fail = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const sanitize = (member) => {
  const obj = member.get({ plain: true });
  delete obj.permissions;
  return obj;
};

// Permissions of one role: Super Admin = everything,
// otherwise what is saved in the table, otherwise the defaults.
const modulesForRole = async (role) => {
  if (role === "Super Admin") return [...MODULES];

  const member = await authorityRepository.findWithPermissionsByRole(role);
  const saved = member?.permissions;

  if (Array.isArray(saved)) return saved.filter((m) => MODULES.includes(m));
  return [...(DEFAULT_PERMISSIONS[role] || [])];
};

// ---------- Members ----------
// Pagination, search, filters and sorting all happen in the database
export const list = async (options = {}) => {
  const filters = validateAuthorityList(options);

  const [result, stats] = await Promise.all([
    authorityRepository.pagintion(filters),
    authorityRepository.getStats(),
  ]);

  return { ...result, members: result.members.map(sanitize), stats };
};

export const create = async (body = {}) => {
  const { name, email, role, status } = validateAuthorityCreate(body);

  const existing = await authorityRepository.findByEmail(email);
  if (existing) fail("Email already registered", 409);

  const member = await authorityRepository.create({
    name,
    email,
    role,
    status,
    permissions: await modulesForRole(role),
    lastActive: new Date(),
  });

  return sanitize(member);
};

export const update = async (id, body = {}) => {
  const validated = validateAuthorityUpdate(id, body);
  id = validated.id;
  const data = validated.data;

  const member = await authorityRepository.findById(id);
  if (!member) fail("Member not found", 404);

  if (data.email !== undefined && data.email !== member.email) {
    const taken = await authorityRepository.findByEmail(data.email);
    if (taken && taken.id !== member.id) {
      fail("Email already registered", 409);
    }
  }

  // Never leave the system without an active Super Admin
  const nextRole = data.role ?? member.role;
  const nextStatus = data.status ?? member.status;
  const losesSuperAdmin =
    member.role === "Super Admin" &&
    member.status === "Active" &&
    (nextRole !== "Super Admin" || nextStatus !== "Active");

  if (losesSuperAdmin) {
    const activeAdmins =
      await authorityRepository.countActiveByRole("Super Admin");
    if (activeAdmins <= 1) {
      fail("At least one active Super Admin is required", 400);
    }
  }

  // New role -> take that role's permissions
  if (data.role && data.role !== member.role) {
    data.permissions = await modulesForRole(data.role);
  }

  const updated = await authorityRepository.update(id, data);
  return sanitize(updated);
};

export const remove = async (id) => {
  id = validateAuthorityId(id);
  const member = await authorityRepository.findById(id);
  if (!member) fail("Member not found", 404);
  if (member.role === "Super Admin") {
    fail("Super Admin cannot be deleted", 403);
  }
  await authorityRepository.deleteById(id);
};

export const removeMany = async (ids = []) => {
  ids = validateAuthorityDeleteMany(ids);

  const members = await authorityRepository.findByIds(ids);
  if (members.some((m) => m.role === "Super Admin")) {
    fail("Super Admin cannot be deleted", 403);
  }

  return authorityRepository.deleteByIds(members.map((m) => m.id));
};

// ---------- Role permissions ----------
export const getPermissions = async () => {
  const result = {};
  for (const role of ROLES) {
    result[role] = await modulesForRole(role);
  }
  return result;
};

export const savePermissions = async (permissions = {}) => {
  permissions = validateAuthorityPermissions(permissions);
  for (const role of ROLES) {
    if (role === "Super Admin") continue; // always has every page
    if (permissions[role] === undefined) continue;

    await authorityRepository.updatePermissionsByRole(role, permissions[role]);
  }

  return getPermissions();
};

export default {
  list,
  create,
  update,
  remove,
  removeMany,
  getPermissions,
  savePermissions,
};
