// services/orderService.js
// ONLY talks to the backend. No React, no useState here.
import { ORDERS_API_URL } from "../constants/orderConstants";

function getAuthHeaders() {
  const token = localStorage.getItem("token"); // change key if yours differs
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// One helper for every request, so error handling is written once.
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result;
}

// Get a page of orders (filters go in `body`)
export async function fetchOrdersList(body) {
  const result = await apiRequest(`${ORDERS_API_URL}/list`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return result.data || {};
}

// Get the 4 numbers for the stat cards
export async function fetchOrderStats() {
  const result = await apiRequest(`${ORDERS_API_URL}/stats`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  const data = result.data || result.stats || result;
  return {
    totalOrders: Number(data.totalOrders ?? data.total ?? data.ordersCount ?? 0),
    newOrders: Number(data.newOrders ?? data.pendingOrders ?? data.new ?? 0),
    completedOrders: Number(
      data.completedOrders ?? data.deliveredOrders ?? data.completed ?? 0,
    ),
    canceledOrders: Number(
      data.canceledOrders ?? data.cancelledOrders ?? data.cancelled ?? 0,
    ),
  };
}

export function updateOrder(id, { status, paymentStatus }) {
  return apiRequest(`${ORDERS_API_URL}/update/${id}`, {
    method: "POST",
    body: JSON.stringify({ status, paymentStatus }),
  });
}

export function deleteOrder(id) {
  return apiRequest(`${ORDERS_API_URL}/delete/${id}`, { method: "POST" });
}
