import api from "../../api/api";

const API_BASE = "http://localhost:5000/api/contactus";

// Get all messages with pagination, search, sorting and filters
export const getContactMessages = async ({
  token,
  page = 1,
  limit = 8,
  search = "",
  status = "",
  subject = "",
  fromDate = "",
  toDate = "",
  sortOrder = "desc",
} = {}) => {
  const response = await api.post(
    `${API_BASE}/list`,
    {
      page,
      limit,
      search,
      status,
      subject,
      fromDate,
      toDate,
      sortOrder,
    },
    {
      headers: {
        Authorization: `Bearer ${
          token ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token")
        }`,
      },
    },
  );

  return response.data;
};

// Get contact statistics
export const getContactStats = async (token) => {
  const response = await api.post(
    `${API_BASE}/stats`,
    {},
    {
      headers: {
        Authorization: `Bearer ${
          token ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token")
        }`,
      },
    },
  );

  return response.data.data ?? response.data;
};

// Get single contact message
export const getContactById = async (id, token) => {
  const response = await api.post(
    `${API_BASE}/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${
          token ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token")
        }`,
      },
    },
  );

  return response.data;
};

// Update message status
export const updateStatus = async (id, status, token) => {
  const response = await api.post(
    `${API_BASE}/update/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${
          token ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token")
        }`,
      },
    },
  );

  return response.data;
};

// Delete contact message
export const deleteContactMessage = async (id, token) => {
  const response = await api.post(
    `${API_BASE}/delete/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${
          token ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token")
        }`,
      },
    },
  );

  return response.data;
};

export default {
  getContactMessages,
  getContactStats,
  getContactById,
  updateStatus,
  deleteContactMessage,
};
