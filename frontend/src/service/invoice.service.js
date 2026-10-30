import api from "../api/api";

// Keep track of invoice requests already running.
const pendingRequests = new Map();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestInvoice = async (id) => {
  const response = await api.post(`/invoices/order/${id}`, {});
  return response.data?.data ?? response.data;
};

// Accepts 13, "0013", or "#ORD0013".
export const getInvoiceByOrder = async (orderId) => {
  const digits = String(orderId ?? "").replace(/\D/g, "");
  const id = String(Number(digits));

  if (!digits || !Number.isSafeInteger(Number(digits)) || Number(digits) <= 0) {
    throw new Error("Invalid order ID.");
  }

  // Reuse the request if the same invoice is already loading.
  if (pendingRequests.has(id)) {
    return pendingRequests.get(id);
  }

  const request = (async () => {
    try {
      return await requestInvoice(id);
    } catch (error) {
      // Another request may have created the invoice first.
      // Retry to fetch the invoice that now exists.
      if (error.response?.status === 409) {
        await wait(250);
        return requestInvoice(id);
      }

      throw error;
    }
  })();

  pendingRequests.set(id, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(id);
  }
};

export const getInvoiceError = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 409) {
    return (
      message || "The invoice is being created. Please try again in a moment."
    );
  }

  if (status === 403) {
    return "You are not allowed to access this invoice.";
  }

  if (status === 404) {
    return "The order was not found.";
  }

  return message || "Unable to load the invoice. Please try again.";
};

export default { getInvoiceByOrder, getInvoiceError };
