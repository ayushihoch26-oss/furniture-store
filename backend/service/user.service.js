import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userRepository from "../repository/user.repository.js";
import { sendMail } from "../utils/mailer.js";

// Throw an error with an HTTP status
const fail = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitize = (user) => {
  const obj =
    typeof user.get === "function" ? user.get({ plain: true }) : { ...user };
  delete obj.password;
  return obj;
};

const text = (value) => String(value ?? "").trim();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Forgot password helpers ----
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const RESET_MINUTES = 60;

// Only the hash of the emailed token is stored in the database
const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const resetEmail = (name, link) => ({
  subject: "Set your new password",
  text: `Hi ${name},\n\nOpen this link to choose a new password (valid for ${RESET_MINUTES} minutes):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
      <h2 style="margin:0 0 16px">Set a new password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click
         <b>Set new password</b> below to open the page where you enter your
         new password and confirm it. This link is valid for
         ${RESET_MINUTES} minutes.</p>
      <p style="margin:28px 0">
        <a href="${link}"
           style="background:#947458;color:#fff;padding:12px 28px;text-decoration:none">
          Set new password
        </a>
      </p>
      <p style="font-size:13px;color:#666">
        Or copy this link into your browser:<br>${link}
      </p>
      <p style="font-size:13px;color:#666">
        If you did not ask for this, you can safely ignore this email.
      </p>
    </div>`,
});

const userService = {
  // Register
  async register({
    firstName,
    lastName,
    email,
    password,
    phone,
    street,
    apartment,
    city,
    state,
    zip,
    country,
  } = {}) {
    if (!firstName || !lastName || !email || !password) {
      fail("All required fields must be provided");
    }

    email = text(email).toLowerCase();

    if (!EMAIL_REGEX.test(email)) fail("Invalid email address");
    if (String(password).length < 8)
      fail("Password must be at least 8 characters");

    const existing = await userRepository.findByEmail(email);
    if (existing) fail("Email already registered", 409);

    const hashed = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      firstName: text(firstName),
      lastName: text(lastName),
      email,
      phone: text(phone) || null,
      street: text(street) || null,
      apartment: text(apartment) || null,
      city: text(city) || null,
      state: text(state) || null,
      zip: text(zip) || null,
      country: text(country) || "United States",
      password: hashed,
    });

    return { success: true, token: signToken(user), user: sanitize(user) };
  },

  // Login
  async login({ email, password } = {}) {
    if (!email || !password) fail("Email and password are required");

    email = text(email).toLowerCase();

    const user = await userRepository.findByEmailWithPassword(email);
    if (!user || !user.password) fail("Invalid email or password", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) fail("Invalid email or password", 401);

    return { success: true, token: signToken(user), user: sanitize(user) };
  },

  // Change password
  async changePassword(id, { currentPassword, newPassword } = {}) {
    if (!currentPassword || !newPassword) {
      fail("Current and new password are required");
    }
    if (newPassword.length < 8) {
      fail("Password must be at least 8 characters");
    }

    const user = await userRepository.findByIdWithPassword(id);
    if (!user) fail("User not found", 404);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) fail("Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 10);
    await userRepository.update(id, { password: hashed });
  },

  // Forgot password: email a reset link
  async forgotPassword({ email } = {}) {
    email = text(email).toLowerCase();

    if (!EMAIL_REGEX.test(email)) fail("Enter a valid email address");

    const user = await userRepository.findByEmail(email);

    // Same answer whether or not the email exists, so accounts cannot be guessed
    const response = {
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };

    if (!user) return response;

    const token = crypto.randomBytes(32).toString("hex");

    await userRepository.update(user.id, {
      resetPasswordToken: hashToken(token),
      resetPasswordExpires: new Date(Date.now() + RESET_MINUTES * 60 * 1000),
    });

    const link = `${CLIENT_URL}/reset-password/${token}`;
    const mail = resetEmail(user.firstName || "there", link);

    try {
      await sendMail({ to: user.email, ...mail });
    } catch (error) {
      console.error("Reset email failed:", error.message);
      fail(
        "We could not send the email right now. Please try again later.",
        500,
      );
    }

    return response;
  },

  // Reset password: the page opened from the email link
  async resetPassword({ token, password, confirmPassword } = {}) {
    if (!token) fail("Reset link is invalid or has expired");

    if (!password || String(password).length < 8) {
      fail("Password must be at least 8 characters");
    }

    if (password !== confirmPassword) fail("Passwords do not match");

    const user = await userRepository.findByValidResetToken(hashToken(token));
    if (!user) fail("Reset link is invalid or has expired");

    const hashed = await bcrypt.hash(String(password), 10);

    // Save the new password and make the link single-use
    await userRepository.update(user.id, {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return {
      success: true,
      message: "Password updated successfully. You can now log in.",
    };
  },

  // Get one user
  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) fail("User not found", 404);
    return sanitize(user);
  },

  // Update profile (account details + address)
  async updateProfile(id, body = {}) {
    const user = await userRepository.findById(id);
    if (!user) fail("User not found", 404);

    const data = {};

    if (body.firstName !== undefined) {
      if (!text(body.firstName)) fail("First name is required");
      data.firstName = text(body.firstName);
    }

    if (body.lastName !== undefined) {
      data.lastName = text(body.lastName);
    }

    if (body.email !== undefined) {
      const email = text(body.email).toLowerCase();
      if (!EMAIL_REGEX.test(email)) fail("Invalid email address");

      if (email !== user.email) {
        const taken = await userRepository.findByEmail(email);
        if (taken && taken.id !== user.id)
          fail("Email already registered", 409);
      }
      data.email = email;
    }

    // Optional fields: empty text is saved as NULL
    ["phone", "street", "apartment", "city", "state", "zip"].forEach(
      (field) => {
        if (body[field] !== undefined) data[field] = text(body[field]) || null;
      },
    );

    if (body.country !== undefined) {
      data.country = text(body.country) || "United States";
    }

    if (body.gender !== undefined) {
      const gender = text(body.gender) || null;
      if (gender && !["male", "female", "other"].includes(gender)) {
        fail("Invalid gender");
      }
      data.gender = gender;
    }

    // The frontend calls it "birthday", the database calls it "birthdate"
    const birthdate =
      body.birthdate !== undefined ? body.birthdate : body.birthday;
    if (birthdate !== undefined) {
      data.birthdate = text(birthdate) || null;
    }

    const updated = await userRepository.update(id, data);
    return sanitize(updated);
  },

  // Admin: users list with pagination, search, dates
  // Admin: users list with pagination, search, dates, and order counts
  // Admin: users list with pagination, search, dates, and order counts
  async list({
    page = 1,
    limit = 7,
    search = "",
    startDate = "",
    endDate = "",
    role = "",
  } = {}) {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 7, 1), 100);

    const [result, stats] = await Promise.all([
      userRepository.findAllPaginated({
        page,
        limit,
        search: text(search),
        startDate,
        endDate,
        role: text(role),
      }),
      userRepository.getUserStats(),
    ]);

    const users = result.users.map(sanitize);
    const userIds = users.map((user) => user.id);

    // Get order counts from the repository
    const orderCounts = await userRepository.getOrderCountsByUserIds(userIds);

    const updatedUsers = users.map((user) => {
      const counts = orderCounts?.[user.id] || {};

      return {
        ...user,
        totalOrders: Number(counts.totalOrders) || 0,
        completedOrders: Number(counts.completedOrders) || 0,
        canceledOrders: Number(counts.canceledOrders) || 0,
        lastPurchaseAt: counts.lastPurchaseAt || null,
        totalSpend: Number(counts.totalSpend) || 0,
      };
    });

    return {
      ...result,
      users: updatedUsers,
      stats,
    };
  },
  // Admin: delete user
  async remove(id) {
    const deleted = await userRepository.deleteById(id);
    if (!deleted) fail("User not found", 404);
  },
  // Admin: customer sign-ups per day (last 14 days)
  async overview() {
    return userRepository.getCustomerOverview();
  },
};

export default userService;
