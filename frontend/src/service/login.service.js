import api from "../api/api";

// Save login session
const saveSession = ({ token, user }, remember = true) => {
  logoutUser();

  const storage = remember ? localStorage : sessionStorage;

  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
};

// Clear login session
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

// Get token
export const getToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Get logged-in user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Check admin
export const isAdmin = () => {
  return getCurrentUser()?.role === "admin";
};

// Login user
export const loginUser = async ({ email, password, remember = true }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const response = await api.post("/users/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  if (!response.data?.token || !response.data?.user) {
    throw new Error("Login response is missing user or token");
  }

  saveSession(response.data, remember);

  return response.data;
};
