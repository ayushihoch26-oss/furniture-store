import { API_BASE_URL } from "../../../../config/constants";

export const CART_SEARCH_DEBOUNCE_MS = 500;

async function cartRequest(path, options = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );
  }

  return data;
}

export async function getCartStats() {
  return cartRequest("/cart/admin/stats", { method: "POST" });
}

export async function getCarts(filters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    status: filters.status,
    search: filters.search.trim(),
    minItems: filters.minItems,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    sortBy: "total",
    sortOrder: filters.sortOrder,
  });

  return cartRequest(`/cart/admin/list?${params.toString()}`, {
    method: "POST",
  });
}

export async function updateCartStatus(cartId, status) {
  return cartRequest(`/cart/admin/status/${cartId}`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export async function deleteCart(cartId) {
  return cartRequest(`/cart/admin/delete/${cartId}`, { method: "POST" });
}
