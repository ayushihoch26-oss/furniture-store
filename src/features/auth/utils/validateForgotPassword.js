export function validateForgotPasswordEmail(email) {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    return "Email is required";
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  if (isValidEmail) {
    return "";
  }

  return "Enter a valid email";
}
