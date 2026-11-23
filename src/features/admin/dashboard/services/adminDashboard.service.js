import { API_BASE_URL } from "../../../../config/constants";
import customerService from "../../customers/services/customer.service";
import productService from "../../products/services/product.service";
import { getCategories, getStats } from "../../categories/services/category.service";
import contactService from "../../contact/services/contact.service";

const ORDERS_API = `${API_BASE_URL}/orders`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const postOrders = async (path, body = {}) => {
  const response = await fetch(`${ORDERS_API}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
};

export const getDashboardRequests = (startDate, endDate) => ({
  orderStats: () => postOrders("/stats", {}),
  recentOrders: () => postOrders("/list", { page: 1, limit: 5 }),
  rangeOrders: () =>
    postOrders("/list", {
      page: 1,
      limit: 100,
      startDate,
      endDate,
    }),
  customers: () => customerService.list({ page: 1, limit: 1 }),
  overview: () => customerService.getOverview(),
  productStats: () => productService.getStats(),
  products: () =>
    productService.getProducts({ page: 1, limit: 20, sort: "latest" }),
  categories: () => getCategories({ page: 1, limit: 5 }),
  categoryStats: () => getStats(),
  contactStats: () => contactService.getContactStats(),
});
