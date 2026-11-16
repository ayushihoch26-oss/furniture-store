import api from "../../api/api";

// Uses the existing users API (router mounted at /api/users):
//   POST /users/users            -> admin list (page, limit, search, role, dates)
//   POST /users/users/delete/:id -> admin delete
// If your axios baseURL already ends with "/users", remove the first "/users".
const LIST_URL = "/users/users";
const DELETE_URL = "/users/users/delete";

export const PAGE_LIMIT = 7;
const MAX_LIMIT = 100; // backend caps limit at 100

const log = (...args) => console.log("[customerService]", ...args);

// ---------- helpers ----------
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
};

// Database user -> the shape the Customers page uses.
// orderCount / totalSpend / status / lastPurchaseAt / completedOrders /
// canceledOrders are optional: they are shown when the backend sends them,
// otherwise they fall back to 0 / "Active" / "-".
const normalizeCustomer = (user) => {
  const address = [
    user.street,
    user.apartment,
    user.city,
    user.state,
    user.zip,
    user.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: user.id,
    code: `#CUST${String(user.id).padStart(3, "0")}`,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "-",
    address: address || "-",
    gender: user.gender || "-",
    status: user.status || "Active",

    // formatted, for the table
    registration: formatDate(user.createdAt),
    lastPurchase: formatDate(user.lastPurchaseAt),

    // raw, for the drawer
    createdAt: user.createdAt || null,
    lastPurchaseAt: user.lastPurchaseAt || null,

    // order counts from the backend
    totalOrders: Number(user.totalOrders ?? user.orderCount ?? 0) || 0,
    completedOrders: Number(user.completedOrders ?? 0) || 0,
    canceledOrders: Number(user.canceledOrders ?? 0) || 0,

    orders:
      Number(user.totalOrders ?? user.orderCount ?? user.orders ?? 0) || 0,
    spend: String(user.totalSpend ?? user.spend ?? "0"),
  };
};

// ---------- API ----------
const customerService = {
  // One page of customers (search is done by the database)
  async list({ page = 1, limit = PAGE_LIMIT, search = "" } = {}) {
    const body = { page, limit, search, role: "customer" };

    try {
      const response = await api.post(LIST_URL, body);
      const data = response.data;

      return {
        customers: (data?.users || []).map(normalizeCustomer),
        total: Number(data?.total) || 0,
        page: Number(data?.page) || page,
        totalPages: Number(data?.totalPages) || 0,
        stats: {
          total: Number(data?.stats?.total) || 0,
          newThisMonth: Number(data?.stats?.newThisMonth) || 0,
        },
      };
    } catch (err) {
      console.error(
        "[customerService] list failed:",
        err.response?.status,
        err.response?.data || err.message,
      );
      throw err;
    }
  },

  // Every customer that matches the search (used by "Export")
  async getAll({ search = "" } = {}) {
    const first = await customerService.list({
      page: 1,
      limit: MAX_LIMIT,
      search,
    });
    let customers = first.customers;

    if (first.totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, index) =>
          customerService.list({ page: index + 2, limit: MAX_LIMIT, search }),
        ),
      );
      rest.forEach((result) => {
        customers = customers.concat(result.customers);
      });
    }

    return customers;
  },

  async remove(id) {
    log("POST", `${DELETE_URL}/${id}`);

    try {
      const response = await api.post(`${DELETE_URL}/${id}`);
      return response.data;
    } catch (err) {
      console.error(
        "[customerService] delete failed:",
        err.response?.status,
        err.response?.data || err.message,
      );
      throw err;
    }
  },

  // Customer overview chart data
  // Customer overview chart data
  async getOverview() {
    try {
      const response = await api.post("/users/users/overview", {});

      // Supports either { success, data: {...} } or direct {...} responses.
      const payload = response.data?.data ?? response.data;

      if (
        !Array.isArray(payload?.thisWeek) ||
        !Array.isArray(payload?.lastWeek)
      ) {
        throw new Error("Invalid customer overview response");
      }

      return payload;
    } catch (err) {
      console.error(
        "[customerService] overview failed:",
        err.response?.status,
        err.response?.data || err.message,
      );
      throw err;
    }
  },
};

// Message to show when a request fails
export const getErrorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || fallback;

export default customerService;
