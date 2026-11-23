import api from "../../../../api/api";

const BASE_URL = "/categories";
const ADMIN_URL = `${BASE_URL}/admin/category`;

// category status and sorting
export const CATEGORY_STATUSES = ["all", "active", "inactive"];

export const CATEGORY_SORTS = ["latest", "oldest", "name_asc", "name_desc"];

export const CATEGORY_NAME_MAX_LENGTH = 60;
export const CATEGORY_MAX_PAGE_SIZE = 100;

// check category id
export const validateCategoryId = (id) => {
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("Category id must be a positive number");
  }

  return categoryId;
};

// remove empty values
export const cleanParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};

// get category options
export const getCategoryOptions = async () => {
  const response = await api.post(`${BASE_URL}/category/options`);

  return Array.isArray(response.data) ? response.data : [];
};

// get all categories
export const getCategories = async (params = {}) => {
  const response = await api.post(`${ADMIN_URL}/list`, cleanParams(params));

  const data = response.data || {};

  return {
    categories: data.categories || [],
    total: Number(data.total) || 0,
    page: Number(data.page) || 1,
    limit: Number(data.limit) || 0,
    totalPages: Number(data.totalPages) || 1,
  };
};

// get category stats
export const getCategoryStats = async () => {
  const response = await api.post(`${ADMIN_URL}/stats`);
  const data = response.data || {};

  return {
    total: Number(data.total) || 0,
    active: Number(data.active) || 0,
    inactive: Number(data.inactive) || 0,
  };
};

// get category by id
export const getCategoryById = async (id) => {
  const categoryId = validateCategoryId(id);
  const response = await api.post(`${ADMIN_URL}/${categoryId}`);

  return response.data;
};

// create category
export const createCategory = async (payload) => {
  const response = await api.post(`${ADMIN_URL}/create`, payload);

  return response.data;
};

// update category
export const updateCategory = async (id, payload) => {
  const categoryId = validateCategoryId(id);

  const response = await api.post(`${ADMIN_URL}/update/${categoryId}`, payload);

  return response.data;
};

// delete category
export const deleteCategory = async (id) => {
  const categoryId = validateCategoryId(id);

  const response = await api.post(`${ADMIN_URL}/delete/${categoryId}`);

  return response.data;
};

// short names
export const getOptions = getCategoryOptions;
export const getStats = getCategoryStats;

// default export
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
