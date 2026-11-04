
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

// Remove extra spaces
function text(value) {
  return String(value ?? "").trim();
}

// Check email format
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

// Validate user ID
export function validateUserId(id) {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    throw new ValidationError("Invalid user ID");
  }

  return Number(id);
}

// Validate registration data
export function validateRegister(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("User data is required");
  }

  const firstName = text(data.firstName);
  const lastName = text(data.lastName);
  const email = text(data.email).toLowerCase();
  const password = data.password;

  if (!firstName) {
    throw new ValidationError("First name is required");
  }

  if (!lastName) {
    throw new ValidationError("Last name is required");
  }

  if (!email) {
    throw new ValidationError("Email is required");
  }

  if (!isValidEmail(email)) {
    throw new ValidationError("Invalid email address");
  }

  if (!password) {
    throw new ValidationError("Password is required");
  }

  if (String(password).length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  return {
    ...data,
    firstName,
    lastName,
    email
  };
}

// Validate login data
export function validateLogin(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Login data is required");
  }

  if (!data.email || !data.password) {
    throw new ValidationError("Email and password are required");
  }

  const email = text(data.email).toLowerCase();

  if (!isValidEmail(email)) {
    throw new ValidationError("Invalid email address");
  }

  return {
    email,
    password: data.password
  };
}

// Validate change password
export function validateChangePassword(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Password data is required");
  }

  const currentPassword = data.currentPassword;
  const newPassword = data.newPassword;

  if (!currentPassword || !newPassword) {
    throw new ValidationError("Current and new password are required");
  }

  if (String(newPassword).length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  return {
    currentPassword,
    newPassword
  };
}

// Validate forgot password
export function validateForgotPassword(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Email is required");
  }

  const email = text(data.email).toLowerCase();

  if (!email) {
    throw new ValidationError("Email is required");
  }

  if (!isValidEmail(email)) {
    throw new ValidationError("Enter a valid email address");
  }

  return { email };
}

// Validate reset password
export function validateResetPassword(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Reset data is required");
  }

  const { token, password, confirmPassword } = data;

  if (!token) {
    throw new ValidationError("Reset link is invalid or has expired");
  }

  if (!password || String(password).length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    throw new ValidationError("Passwords do not match");
  }

  return {
    token,
    password,
    confirmPassword
  };
}

// Validate update profile
export function validateUpdateProfile(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Profile data is required");
  }

  const profile = {};

  if (data.firstName !== undefined) {
    const firstName = text(data.firstName);

    if (!firstName) {
      throw new ValidationError("First name is required");
    }

    profile.firstName = firstName;
  }

  if (data.lastName !== undefined) {
    profile.lastName = text(data.lastName);
  }

  if (data.email !== undefined) {
    const email = text(data.email).toLowerCase();

    if (!isValidEmail(email)) {
      throw new ValidationError("Invalid email address");
    }

    profile.email = email;
  }

  if (data.phone !== undefined) {
    profile.phone = text(data.phone);
  }

  if (data.street !== undefined) {
    profile.street = text(data.street);
  }

  if (data.apartment !== undefined) {
    profile.apartment = text(data.apartment);
  }

  if (data.city !== undefined) {
    profile.city = text(data.city);
  }

  if (data.state !== undefined) {
    profile.state = text(data.state);
  }

  if (data.zip !== undefined) {
    profile.zip = text(data.zip);
  }

  if (data.country !== undefined) {
    profile.country = text(data.country);
  }

  if (data.gender !== undefined) {
    const gender = text(data.gender);

    if (
      gender !== "" &&
      gender !== "male" &&
      gender !== "female" &&
      gender !== "other"
    ) {
      throw new ValidationError("Invalid gender");
    }

    profile.gender = gender;
  }

  if (data.birthdate !== undefined) {
    profile.birthdate = text(data.birthdate);
  }

  if (data.birthday !== undefined) {
    profile.birthday = text(data.birthday);
  }

  if (Object.keys(profile).length === 0) {
    throw new ValidationError("Update data is required");
  }

  return profile;
}

// Validate pagination
export function validateUserParams(params = {}) {
  let page = Number(params.page) || 1;
  let limit = Number(params.limit) || 7;

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 1;
  }

  if (limit > 100) {
    limit = 100;
  }

  return {
    page,
    limit,
    search: text(params.search),
    startDate: text(params.startDate),
    endDate: text(params.endDate),
    role: text(params.role)
  };
}

export default {
  ValidationError,
  validateUserId,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateUserParams
};
