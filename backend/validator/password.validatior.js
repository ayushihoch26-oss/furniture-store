export const validateForgotPassword = (data = {}) => {
  const email = data.email?.trim().toLowerCase();

  if (!email) {
    throw Object.assign(new Error("Email is required"), { statusCode: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Enter a valid email address"), {
      statusCode: 400,
    });
  }

  return { email };
};

export const validateResetPassword = (data = {}) => {
  const { token, password, confirmPassword } = data;

  if (!token) {
    throw Object.assign(new Error("Invalid or expired reset link"), {
      statusCode: 400,
    });
  }

  if (!password || password.length < 8) {
    throw Object.assign(new Error("Password must be at least 8 characters"), {
      statusCode: 400,
    });
  }

  if (password !== confirmPassword) {
    throw Object.assign(new Error("Passwords do not match"), {
      statusCode: 400,
    });
  }

  return { token, password };
};

export default {
  validateForgotPassword,
  validateResetPassword,
};
