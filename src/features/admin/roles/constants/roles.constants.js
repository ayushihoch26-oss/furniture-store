// ---------- Colors (same as Dashboard / Products / Reviews) ----------
export const BROWN = "#947458";
export const BROWN_DARK = "#7d6149";
export const BROWN_LIGHT = "#F3ECE5";
export const BG = "#F7F7F7";
export const RED = "#E5484D";

// ---------- Storage / timing ----------
export const DARK_MODE_STORAGE_KEY = "admin-dark-mode";
export const TOAST_DURATION_MS = 3000;

// ---------- Static data ----------
export const COUNTRY_CODES = ["+1", "+44", "+61", "+91"];
export const CARDS = ["843-4359-4444", "512-7788-1020", "309-4412-9087"];

// ---------- Limits / validation ----------
export const BIO_LIMIT = 250;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Initial state ----------
// Empty until the real profile is loaded from the backend
export const INITIAL_PROFILE = {
  image: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "**********",
  countryCode: "+1",
  phone: "",
  birthDate: "", // YYYY-MM-DD (date input format)
  location: "",
  card: CARDS[0],
  bio: "",
};

export const EMPTY_PASSWORDS = { current: "", next: "", repeat: "" };

// ---------- Messages ----------
export const MESSAGES = {
  loadFailed: "Could not load profile",
  updated: "Profile updated",
  updateFailed: "Could not update profile",
  notAnImage: "Please choose an image file",
  imageTooLarge: "Image must be smaller than 2 MB",
  photoUpdated: "Profile photo updated",
  photoUploadFailed: "Could not upload photo",
  photoRemoved: "Profile photo removed",
  photoRemoveFailed: "Could not remove photo",
  emailCopied: "Email copied",
  emailCopyFailed: "Could not copy email",
  passwordChanged: "Password changed",
  passwordChangeFailed: "Could not change password",
  passwordCurrentRequired: "Enter your current password",
  passwordTooShort: "New password must be at least 8 characters",
  passwordMismatch: "Passwords do not match",
  invalidEmail: "Enter a valid email",
};
