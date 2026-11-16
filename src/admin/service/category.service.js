// src/service/category.service.js
// Same axios instance as product.service.js
import api from "../../api/api";

// Change if your category routes are mounted somewhere else
const BASE = "/products";

const categoryService = {
  getCategories: (params) =>
    api.post(`${BASE}/admin/category/list`, params).then((r) => r.data),

  getStats: () => api.post(`${BASE}/admin/category/stats`).then((r) => r.data),

  createCategory: (payload) =>
    api.post(`${BASE}/admin/category/create`, payload).then((r) => r.data),

  updateCategory: (id, payload) =>
    api
      .post(`${BASE}/admin/category/update/${id}`, payload)
      .then((r) => r.data),

  deleteCategory: (id) =>
    api.post(`${BASE}/admin/category/delete/${id}`).then((r) => r.data),

  // Public: active category names for dropdowns (e.g. the product form)
  getOptions: () => api.post(`${BASE}/category/options`).then((r) => r.data),
};

export default categoryService;
