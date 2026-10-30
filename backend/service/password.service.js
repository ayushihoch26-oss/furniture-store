import crypto from "crypto";
import bcrypt from "bcryptjs";
import passwordRepository from "../repository/password.repository.js";
import { sendMail } from "../utils/mailer.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const LINK_MINUTES = 60;

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const resetEmail = (name, link) => ({
  subject: "Reset your password",
  text: `Hi ${name},\n\nOpen this link to choose a new password (valid for ${LINK_MINUTES} minutes):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
      <h2 style="margin:0 0 16px">Reset your password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below
         to choose a new one. This link is valid for ${LINK_MINUTES} minutes.</p>
      <p style="margin:28px 0">
        <a href="${link}"
           style="background:#947458;color:#fff;padding:12px 28px;text-decoration:none">
          Reset password
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

const passwordService = {
  // Step 1: user enters their email on the "Forgot password" page
  async forgot({ email } = {}) {
    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      throw new AppError("Enter a valid email address", 400);
    }

    const user = await passwordRepository.findByEmail(cleanEmail);

    // Same answer whether or not the email exists, so nobody can probe accounts
    const response = {
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };

    if (!user) return response;

    // Random token goes in the email; only its hash goes in the database
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + LINK_MINUTES * 60 * 1000);

    await passwordRepository.saveResetToken(user, hashToken(token), expires);

    const link = `${CLIENT_URL}/reset-password/${token}`;
    const mail = resetEmail(user.firstName || "there", link);

    try {
      await sendMail({ to: user.email, ...mail });
    } catch (error) {
      console.error("Reset email failed:", error.message);
      throw new AppError(
        "We could not send the email right now. Please try again later.",
        500,
      );
    }

    return response;
  },

  // Step 2: user opens the emailed link and submits the new password
  async reset({ token, password, confirmPassword } = {}) {
    if (!token) {
      throw new AppError("Reset link is invalid or has expired", 400);
    }

    if (!password || String(password).length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    if (password !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const user = await passwordRepository.findByValidResetToken(
      hashToken(token),
    );

    if (!user) {
      throw new AppError("Reset link is invalid or has expired", 400);
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    await passwordRepository.setNewPassword(user, passwordHash);

    return {
      success: true,
      message: "Password updated successfully. You can now log in.",
    };
  },
};

export default passwordService;
