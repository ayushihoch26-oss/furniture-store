import crypto from "crypto";
import bcrypt from "bcryptjs";
import passwordRepository from "../repository/password.repository.js";
import { sendMail } from "../utils/mailer.js";
import {
  validateForgotPassword,
  validateResetPassword,
} from "../validator/password.validatior.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// FORGOT PASSWORD
export const forgot = async (data = {}) => {
  const { email } = validateForgotPassword(data);
  const user = await passwordRepository.findByEmail(email);

  // Same response for security
  if (!user) {
    return {
      success: true,
      message: "If account exists, reset link has been sent.",
    };
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");

  // Hash token before saving
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Token expires in 1 hour
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await passwordRepository.saveResetToken(user, hashedToken, expires);

  // Create reset link
  const link = `${CLIENT_URL}/reset-password/${token}`;

  // Send email
  await sendMail({
    to: user.email,
    subject: "Reset Password",
    text: `Click this link to reset your password: ${link}`,
  });

  return {
    success: true,
    message: "If account exists, reset link has been sent.",
  };
};

// RESET PASSWORD
export const reset = async (data = {}) => {
  const { token, password } = validateResetPassword(data);

  // Hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user using token
  const user = await passwordRepository.findByValidResetToken(hashedToken);

  if (!user) {
    throw new Error("Invalid or expired reset link");
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 10);

  // Update password and remove reset token
  await passwordRepository.setNewPassword(user, passwordHash);

  return {
    success: true,
    message: "Password updated successfully",
  };
};

export default {
  forgot,
  reset,
};
