// src/features/admin/categories/services/category.service.js
//
// Admin + public category API calls.
// Every route in the backend is a POST (see category.routes.js).
//
//   POST /products/category/options          public   -> [{ id, name, count }]
//   POST /products/admin/category/list       admin    -> { categories, total, page, limit, totalPages }
//   POST /products/admin/category/stats      admin    -> { total, active, inactive }
//   POST /products/admin/category/create     admin    -> category
//   POST /products/admin/category/update/:id admin    -> category
//   POST /products/admin/category/delete/:id admin    -> { success, message }
//   POST /products/admin/category/:id        admin    -> category
//
// A category looks like:
//   { id, name, description, image, isActive, productCount, createdAt }

import api from "../../../../api/api";

// Where the category router is mounted (same prefix as product.service.js).
const BASE = "/categories";
const ADMIN = `${BASE}/admin/category`;

// Values the backend validator accepts.
export const CATEGORY_STATUSES = ["all", "active", "inactive"];
export const CATEGORY_SORTS = ["latest", "oldest", "name_asc", "name_desc"];
export const CATEGORY_NAME_MAX_LENGTH = 60;
export const CATEGORY_MAX_PAGE_SIZE = 100;

// ---------- helpers ----------

// Drop empty values so we never send `search: ""`, `status: undefined`, etc.
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

// The backend rejects ids that are not positive integers (400), so fail fast.
const assertId = (id) => {
  const value = Number(id);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Category id must be a positive number");
  }

  return value;
};

// ---------- public ----------

// Active categories for dropdowns (e.g. the product form).
export const getCategoryOptions = async () => {
  const { data } = await api.post(`${BASE}/category/options`);
  return Array.isArray(data) ? data : [];
};

// ---------- admin ----------

// Paginated list. Accepts: { search, status, sort, page, limit }
export const getCategories = async (params = {}) => {
  const { data } = await api.post(`${ADMIN}/list`, cleanParams(params));

  return {
    categories: data?.categories ?? [],
    total: Number(data?.total) || 0,
    page: Number(data?.page) || 1,
    limit: Number(data?.limit) || 0,
    totalPages: Number(data?.totalPages) || 1,
  };
};

// { total, active, inactive }
export const getCategoryStats = async () => {
  const { data } = await api.post(`${ADMIN}/stats`);

  return {
    total: Number(data?.total) || 0,
    active: Number(data?.active) || 0,
    inactive: Number(data?.inactive) || 0,
  };
};

export const getCategoryById = async (id) => {
  const { data } = await api.post(`${ADMIN}/${assertId(id)}`);
  return data;
};

// payload: { name, description?, image?, isActive? }
export const createCategory = async (payload) => {
  const { data } = await api.post(`${ADMIN}/create`, payload);
  return data;
};

// payload: any of { name, description, image, isActive }
export const updateCategory = async (id, payload) => {
  const { data } = await api.post(`${ADMIN}/update/${assertId(id)}`, payload);
  return data;
};

// Fails with 400 if products still use the category.
export const deleteCategory = async (id) => {
  const { data } = await api.post(`${ADMIN}/delete/${assertId(id)}`);
  return data;
};

// ---------- short aliases ----------
// Pages import these names (named import or via the default object),
// so both the short and the long names are exported.
export const getOptions = getCategoryOptions;
export const getStats = getCategoryStats;

// ---------- default export ----------
const categoryService = {
  getOptions,
  getCategories,
  getStats,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
