import nodemailer from "nodemailer";

// If you already have a mail helper for your email OTP, use that instead
// and change the import in password.service.js.
//
// .env (Gmail needs an "App password": Google Account > Security > 2-Step Verification > App passwords)
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=465
//   SMTP_USER=yourname@gmail.com
//   SMTP_PASS=your-16-letter-app-password
//   MAIL_FROM="FurnitureStore <yourname@gmail.com>"   (optional)

const port = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = ({ to, subject, html, text }) =>
  transporter.sendMail({
    from:
      process.env.MAIL_FROM || `"FurnitureStore" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
