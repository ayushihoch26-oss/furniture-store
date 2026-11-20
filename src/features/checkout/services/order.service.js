import api from "../../../api/api";

// Place a new order during checkout
export const placeOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data?.data ?? response.data;
};

// Get the logged-in customer's orders
export const getMyOrders = async (filters = {}) => {
  const response = await api.post("/orders/my", filters);
  return response.data?.data ?? response.data;
};

// Get one order's details, including its items
export const getMyOrderById = async (id) => {
  const response = await api.post(`/orders/${id}`, {});
  return response.data?.data ?? response.data;
};

// Turn an API error into a message that the checkout page can show.
export const getOrderError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  if (message) return message;
  return "Unable to process your order. Please try again.";
};

export default {
  placeOrder,
  getMyOrders,
  getMyOrderById,
  getOrderError,
};
