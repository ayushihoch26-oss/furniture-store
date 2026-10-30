import api from "../api/api";
import { logoutUser } from "./login.service";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  phone,
  password,
  confirmPassword,
}) => {
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
    throw new Error("First name, last name, and email are required");
  }

  const response = await api.post("/users/auth/register", {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || undefined,
    password,
    confirmPassword,
  });

  if (!response.data.token || !response.data.user) {
    throw new Error("Registration response is missing user or token");
  }

  logoutUser();

  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));

  return response.data;
};
