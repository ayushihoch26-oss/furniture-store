
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  findById,
  findByIdWithPassword,
  findByEmail,
  findByEmailWithPassword,
  findByValidResetToken,
  create,
  update,
  findAllPaginated,
  getUserStats,
  getOrderCountsByUserIds,
  deleteById,
  getCustomerOverview
} from "../repository/user.repository.js";

import {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateUserId,
  validateUserParams
} from "../validator/user.validator.js";

import { sendMail } from "../utils/mailer.js";

// ================= COMMON HELPERS =================

// Create error
function fail(message, status = 400) {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
}

// Remove extra spaces
function text(value) {
  return String(value ?? "").trim();
}

// Generate JWT token
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

// Remove password
function sanitize(user) {
  const userData = user.get
    ? user.get({ plain: true })
    : { ...user };

  delete userData.password;

  return userData;
}

// ================= FORGOT PASSWORD HELPERS =================

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const RESET_MINUTES = 60;

// Create token hash
function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

// Create reset email
function resetEmail(name, link) {
  return {
    subject: "Reset your password",

    text: `Hi ${name},

Open this link to reset your password:
${link}

This link is valid for ${RESET_MINUTES} minutes.

If you did not request this, ignore this email.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2>Reset your password</h2>
        <p>Hi ${name},</p>
        <p>Click below to reset your password.</p>

        <a href="${link}"
          style="background:#947458;color:white;padding:12px 28px;text-decoration:none">
          Reset Password
        </a>

        <p>This link is valid for ${RESET_MINUTES} minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `
  };
}

// ================= REGISTER =================

export async function register(data = {}) {
  data = validateRegister(data);

  const firstName = data.firstName;
  const lastName = data.lastName;
  const email = data.email;
  const password = data.password;

  const userEmail = text(email).toLowerCase();

  // Check existing email
  const existingUser = await findByEmail(userEmail);

  if (existingUser) {
    fail("Email already registered", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await create({
    firstName: text(firstName),
    lastName: text(lastName),
    email: userEmail,
    password: hashedPassword,
    phone: text(data.phone) || null,
    street: text(data.street) || null,
    apartment: text(data.apartment) || null,
    city: text(data.city) || null,
    state: text(data.state) || null,
    zip: text(data.zip) || null,
    country: text(data.country) || "United States"
  });

  return {
    success: true,
    token: signToken(user),
    user: sanitize(user)
  };
}

// ================= LOGIN =================

export async function login(data = {}) {
  data = validateLogin(data);

  const email = data.email;
  const password = data.password;

  // Find user
  const user = await findByEmailWithPassword(email);

  if (!user || !user.password) {
    fail("Invalid email or password", 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    fail("Invalid email or password", 401);
  }

  return {
    success: true,
    token: signToken(user),
    user: sanitize(user)
  };
}

// ================= CHANGE PASSWORD =================

export async function changePassword(id, data = {}) {
  id = validateUserId(id);
  data = validateChangePassword(data);

  const currentPassword = data.currentPassword;
  const newPassword = data.newPassword;

  // Find user
  const user = await findByIdWithPassword(id);

  if (!user) {
    fail("User not found", 404);
  }

  // Check current password
  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isMatch) {
    fail("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await update(id, {
    password: hashedPassword
  });

  return {
    success: true,
    message: "Password changed successfully"
  };
}

// ================= FORGOT PASSWORD =================

export async function forgotPassword(data = {}) {
  data = validateForgotPassword(data);

  const email = data.email;

  // Find user
  const user = await findByEmail(email);

  const response = {
    success: true,
    message: "If an account exists for this email, a password reset link has been sent."
  };

  if (!user) {
    return response;
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");

  // Save token
  await update(user.id, {
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: new Date(
      Date.now() + RESET_MINUTES * 60 * 1000
    )
  });

  // Create reset link
  const link = `${CLIENT_URL}/reset-password/${token}`;

  // Create email
  const mail = resetEmail(user.firstName || "there", link);

  try {
    await sendMail({
      to: user.email,
      ...mail
    });
  } catch (error) {
    console.error("Reset email failed:", error.message);

    fail(
      "We could not send the email right now. Please try again later.",
      500
    );
  }

  return response;
}

// ================= RESET PASSWORD =================

export async function resetPassword(data = {}) {
  data = validateResetPassword(data);

  const token = data.token;
  const password = data.password;

  // Find user
  const user = await findByValidResetToken(hashToken(token));

  if (!user) {
    fail("Reset link is invalid or has expired");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password
  await update(user.id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null
  });

  return {
    success: true,
    message: "Password updated successfully. You can now log in."
  };
}

// ================= GET USER BY ID =================

export async function getById(id) {
  id = validateUserId(id);

  const user = await findById(id);

  if (!user) {
    fail("User not found", 404);
  }

  return sanitize(user);
}

// ================= UPDATE PROFILE =================

export async function updateProfile(id, body = {}) {
  id = validateUserId(id);

  body = validateUpdateProfile(body);

  // Find user
  const user = await findById(id);

  if (!user) {
    fail("User not found", 404);
  }

  const data = {};

  // Update first name
  if (body.firstName !== undefined) {
    data.firstName = body.firstName;
  }

  // Update last name
  if (body.lastName !== undefined) {
    data.lastName = body.lastName;
  }

  // Update email
  if (body.email !== undefined) {
    const email = body.email;

    if (email !== user.email) {
      const existingUser = await findByEmail(email);

      if (existingUser && existingUser.id !== user.id) {
        fail("Email already registered", 409);
      }
    }

    data.email = email;
  }

  // Update phone
  if (body.phone !== undefined) {
    data.phone = text(body.phone) || null;
  }

  // Update address
  if (body.street !== undefined) {
    data.street = text(body.street) || null;
  }

  if (body.apartment !== undefined) {
    data.apartment = text(body.apartment) || null;
  }

  if (body.city !== undefined) {
    data.city = text(body.city) || null;
  }

  if (body.state !== undefined) {
    data.state = text(body.state) || null;
  }

  if (body.zip !== undefined) {
    data.zip = text(body.zip) || null;
  }

  // Update country
  if (body.country !== undefined) {
    data.country = text(body.country) || "United States";
  }

  // Update gender
  if (body.gender !== undefined) {
    data.gender = text(body.gender) || null;
  }

  // Update birthday
  if (body.birthdate !== undefined) {
    data.birthdate = text(body.birthdate) || null;
  }

  if (body.birthday !== undefined) {
    data.birthdate = text(body.birthday) || null;
  }

  // Save profile
  const updatedUser = await update(id, data);

  return sanitize(updatedUser);
}

// ================= ADMIN USER LIST =================

export async function list(params = {}) {
  const {
    page,
    limit,
    search,
    startDate,
    endDate,
    role
  } = validateUserParams(params);

  // Get users
  const result = await findAllPaginated({
    page,
    limit,
    search,
    startDate,
    endDate,
    role
  });

  // Get statistics
  const stats = await getUserStats();

  // Get user details
  const users = [];
  const userIds = [];

  for (let i = 0; i < result.users.length; i++) {
    const user = sanitize(result.users[i]);

    users.push(user);
    userIds.push(user.id);
  }

  // Get order counts
  const orderCounts = await getOrderCountsByUserIds(userIds);

  // Add order details
  const updatedUsers = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    let counts = orderCounts[user.id];

    if (!counts) {
      counts = {};
    }

    updatedUsers.push({
      ...user,
      totalOrders: Number(counts.totalOrders) || 0,
      completedOrders: Number(counts.completedOrders) || 0,
      canceledOrders: Number(counts.canceledOrders) || 0,
      lastPurchaseAt: counts.lastPurchaseAt || null,
      totalSpend: Number(counts.totalSpend) || 0
    });
  }

  return {
    ...result,
    users: updatedUsers,
    stats
  };
}

// ================= DELETE USER =================

export async function remove(id) {
  id = validateUserId(id);

  const deletedUser = await deleteById(id);

  if (!deletedUser) {
    fail("User not found", 404);
  }

  return {
    success: true,
    message: "User deleted successfully"
  };
}

// ================= CUSTOMER OVERVIEW =================

export async function overview() {
  return await getCustomerOverview();
}

export default {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  getById,
  updateProfile,
  list,
  remove,
  overview
};