// frontend: save as src/service/authority.service.js
// (same axios instance the other services use)
import api from "../../api/api";

// Backend mounts the router at /api/authority.
// If your axios baseURL already ends with "/authority", set BASE = "".
const BASE = "/authority";

// ---------- helpers ----------
// Database id 7  ->  "#ADM0007"  (what the table shows)
const toUiId = (id) => `#ADM${String(id).padStart(4, "0")}`;

// "#ADM0007" -> 7
const toDbId = (id) => Number(String(id).replace(/\D/g, ""));

// Date -> "DD-MM-YYYY"
const toDisplayDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
};

// Backend row -> the shape the page and table already use
const toUiMember = (member) => ({
  id: toUiId(member.id),
  name: member.name || "",
  email: member.email || "",
  role: member.role || "Support",
  status: member.status || "Active",
  lastActive: toDisplayDate(member.lastActive || member.createdAt),
});

const unwrap = (response) => response.data?.data ?? response.data;

// ---------- API ----------
const authorityService = {
  // One page of members. Search, filters, sorting and pagination
  // are done by the database.
  // params: { page, limit, search, status, role, sortOrder }
  async getMembers(params = {}) {
    const response = await api.post(`${BASE}/list`, params);
    const data = unwrap(response) || {};

    return {
      members: Array.isArray(data.members) ? data.members.map(toUiMember) : [],
      total: Number(data.total) || 0,
      page: Number(data.page) || 1,
      totalPages: Number(data.totalPages) || 0,
      stats: {
        total: Number(data.stats?.total) || 0,
        active: Number(data.stats?.active) || 0,
        inactive: Number(data.stats?.inactive) || 0,
      },
    };
  },

  // Every member that matches the filters (used by "Export")
  async getAllMembers(params = {}) {
    const LIMIT = 100; // backend caps limit at 100
    const first = await authorityService.getMembers({
      ...params,
      page: 1,
      limit: LIMIT,
    });

    let members = first.members;

    if (first.totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, index) =>
          authorityService.getMembers({
            ...params,
            page: index + 2,
            limit: LIMIT,
          }),
        ),
      );
      rest.forEach((result) => {
        members = members.concat(result.members);
      });
    }

    return members;
  },

  async createMember({ name, email, role, status }) {
    const response = await api.post(`${BASE}/create`, {
      name,
      email,
      role,
      status,
    });
    return toUiMember(unwrap(response));
  },

  async updateMember(id, { name, email, role, status }) {
    const response = await api.post(`${BASE}/update/${toDbId(id)}`, {
      name,
      email,
      role,
      status,
    });
    return toUiMember(unwrap(response));
  },

  // One id or many ids ("#ADM0001" format)
  async removeMembers(ids) {
    const list = Array.isArray(ids) ? ids : [ids];

    if (list.length === 1) {
      await api.post(`${BASE}/delete/${toDbId(list[0])}`);
      return;
    }

    await api.post(`${BASE}/delete-many`, { ids: list.map(toDbId) });
  },

  // { "Super Admin": [...], Manager: [...], Editor: [...], Support: [...] }
  async getPermissions() {
    const response = await api.post(`${BASE}/permissions`, {});
    return unwrap(response);
  },

  async savePermissions(permissions) {
    const response = await api.post(`${BASE}/permissions/save`, {
      permissions,
    });
    return unwrap(response);
  },
};

// Message to show in the toast when a request fails
export const getErrorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || err?.message || fallback;

export default authorityService;
