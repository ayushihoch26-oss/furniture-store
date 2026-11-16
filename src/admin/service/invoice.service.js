import api from "../../api/api";

// POST /api/invoices/all
// Filters are query parameters because the backend reads req.query.
export const getInvoices = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );

  return api.post("/invoices/all", {}, { params });
};

export const getInvoiceStats = () => {
  return api.post("/invoices/stats");
};
