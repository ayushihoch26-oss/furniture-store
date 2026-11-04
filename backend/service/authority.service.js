// backend: src/service/authority.service.js
import authorityRepository from "../repository/authority.repository.js";

// ---------- Roles, statuses, pages and default permissions ----------
const ROLES = ["Super Admin", "Manager", "Editor", "Support"];
const STATUSES = ["Active", "Inactive"];

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

const text = (value) => String(value ?? "").trim();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitize = (member) => {
  const obj = member.get({ plain: true });
  delete obj.permissions; // permissions are served by getPermissions()
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

const authorityService = {
  // ---------- Members ----------
  // Pagination, search, filters and sorting all happen in the database
  async list({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    role = "",
    sortOrder = "desc",
  } = {}) {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    status = STATUSES.includes(status) ? status : "";
    role = ROLES.includes(role) ? role : "";
    sortOrder = String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc";

    const [result, stats] = await Promise.all([
      authorityRepository.findAllPaginated({
        page,
        limit,
        search: text(search),
        status,
        role,
        sortOrder,
      }),
      authorityRepository.getStats(),
    ]);

    return { ...result, members: result.members.map(sanitize), stats };
  },

  async create({ name, email, role = "Support", status = "Active" } = {}) {
    name = text(name);
    email = text(email).toLowerCase();

    if (!name) fail("Name is required");
    if (!EMAIL_REGEX.test(email)) fail("Invalid email address");
    if (!ROLES.includes(role)) fail("Invalid role");
    if (!STATUSES.includes(status)) fail("Invalid status");

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
  },

  async update(id, body = {}) {
    const member = await authorityRepository.findById(id);
    if (!member) fail("Member not found", 404);

    const data = {};

    if (body.name !== undefined) {
      if (!text(body.name)) fail("Name is required");
      data.name = text(body.name);
    }

    if (body.email !== undefined) {
      const email = text(body.email).toLowerCase();
      if (!EMAIL_REGEX.test(email)) fail("Invalid email address");

      if (email !== member.email) {
        const taken = await authorityRepository.findByEmail(email);
        if (taken && taken.id !== member.id)
          fail("Email already registered", 409);
      }
      data.email = email;
    }

    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) fail("Invalid role");
      data.role = body.role;
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) fail("Invalid status");
      data.status = body.status;
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
  },

  async remove(id) {
    const member = await authorityRepository.findById(id);
    if (!member) fail("Member not found", 404);
    if (member.role === "Super Admin") {
      fail("Super Admin cannot be deleted", 403);
    }
    await authorityRepository.deleteById(id);
  },

  async removeMany(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
      fail("Select at least one member");
    }

    const members = await authorityRepository.findByIds(ids);
    if (members.some((m) => m.role === "Super Admin")) {
      fail("Super Admin cannot be deleted", 403);
    }

    return authorityRepository.deleteByIds(members.map((m) => m.id));
  },

  // ---------- Role permissions ----------
  async getPermissions() {
    const result = {};
    for (const role of ROLES) {
      result[role] = await modulesForRole(role);
    }
    return result;
  },

  async savePermissions(permissions = {}) {
    for (const role of ROLES) {
      if (role === "Super Admin") continue; // always has every page
      if (permissions[role] === undefined) continue;

      const modules = permissions[role];
      if (
        !Array.isArray(modules) ||
        modules.some((m) => !MODULES.includes(m))
      ) {
        fail(`Invalid permissions for ${role}`);
      }

      await authorityRepository.updatePermissionsByRole(role, modules);
    }

    return authorityService.getPermissions();
  },
};

export default authorityService;
