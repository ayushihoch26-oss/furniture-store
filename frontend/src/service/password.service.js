import api from "../api/api";

// Step 1: ask the server to email a reset link
export const forgotPassword = async (email) => {
  const response = await api.post("/users/auth/forgot-password", {
    email: email.trim().toLowerCase(),
  });
  return response.data;
};

// Step 2: send the token from the email link + the new password
export const resetPassword = async ({ token, password, confirmPassword }) => {
  const response = await api.post("/users/auth/reset-password", {
    token,
    password,
    confirmPassword,
  });
  return response.data;
};

export default { forgotPassword, resetPassword };
