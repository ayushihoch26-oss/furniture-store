export const validateAuthorityId = (id) => {
  const value = Number(id);
  if (!Number.isSafeInteger(value) || value <= 0) {
    const error = new Error("Member id must be a positive number");
    error.status = 400;
    throw error;
  }
  return value;
};

export const validateAuthorityList = (options = {}) => {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    const error = new Error("Invalid member list filters");
    error.status = 400;
    throw error;
  }

  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    role = "",
    sortOrder = "desc",
  } = options;

  const pageNumber = Number(page);
  if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) {
    const error = new Error("Page must be a positive integer");
    error.status = 400;
    throw error;
  }

  const limitNumber = Number(limit);
  if (!Number.isSafeInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    const error = new Error("Limit must be between 1 and 100");
    error.status = 400;
    throw error;
  }

  if (typeof search !== "string") {
    const error = new Error("Search must be a string");
    error.status = 400;
    throw error;
  }

  return {
    page: pageNumber,
    limit: limitNumber,
    search: search.trim(),
    status: ["Active", "Inactive"].includes(status) ? status : "",
    role: ["Super Admin", "Manager", "Editor", "Support"].includes(role)
      ? role
      : "",
    sortOrder: String(sortOrder).toLowerCase() === "asc" ? "asc" : "desc",
  };
};

export const validateAuthorityCreate = (body = {}) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("Invalid member data");
    error.status = 400;
    throw error;
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = body.role ?? "Support";
  const status = body.status ?? "Active";

  if (!name) {
    const error = new Error("Name is required");
    error.status = 400;
    throw error;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("Invalid email address");
    error.status = 400;
    throw error;
  }
  if (!["Super Admin", "Manager", "Editor", "Support"].includes(role)) {
    const error = new Error("Invalid role");
    error.status = 400;
    throw error;
  }
  if (!["Active", "Inactive"].includes(status)) {
    const error = new Error("Invalid status");
    error.status = 400;
    throw error;
  }

  return { name, email, role, status };
};

export const validateAuthorityUpdate = (id, body = {}) => {
  const memberId = Number(id);
  if (!Number.isSafeInteger(memberId) || memberId <= 0) {
    const error = new Error("Member id must be a positive number");
    error.status = 400;
    throw error;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("Invalid member data");
    error.status = 400;
    throw error;
  }

  const data = {};

  if (body.name !== undefined) {
    const name = String(body.name ?? "").trim();
    if (!name) {
      const error = new Error("Name is required");
      error.status = 400;
      throw error;
    }
    data.name = name;
  }

  if (body.email !== undefined) {
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error("Invalid email address");
      error.status = 400;
      throw error;
    }
    data.email = email;
  }

  if (body.role !== undefined) {
    if (!["Super Admin", "Manager", "Editor", "Support"].includes(body.role)) {
      const error = new Error("Invalid role");
      error.status = 400;
      throw error;
    }
    data.role = body.role;
  }

  if (body.status !== undefined) {
    if (!["Active", "Inactive"].includes(body.status)) {
      const error = new Error("Invalid status");
      error.status = 400;
      throw error;
    }
    data.status = body.status;
  }

  return { id: memberId, data };
};

export const validateAuthorityDeleteMany = (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error("Select at least one member");
    error.status = 400;
    throw error;
  }

  return ids.map((id) => {
    const value = Number(id);
    if (!Number.isSafeInteger(value) || value <= 0) {
      const error = new Error("Member id must be a positive number");
      error.status = 400;
      throw error;
    }
    return value;
  });
};

export const validateAuthorityPermissions = (permissions = {}) => {
  if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) {
    const error = new Error("Invalid permissions");
    error.status = 400;
    throw error;
  }

  for (const role of ["Super Admin", "Manager", "Editor", "Support"]) {
    if (role === "Super Admin" || permissions[role] === undefined) continue;

    const modules = permissions[role];
    if (
      !Array.isArray(modules) ||
      modules.some(
        (module) =>
          ![
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
          ].includes(module),
      )
    ) {
      const error = new Error(`Invalid permissions for ${role}`);
      error.status = 400;
      throw error;
    }
  }

  return permissions;
};