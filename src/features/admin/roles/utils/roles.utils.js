import {
  EMAIL_REGEX,
  MESSAGES,
  PASSWORD_MIN_LENGTH,
} from "../constants/roles.constants";

export const isValidEmail = (email) => EMAIL_REGEX.test(email);

export const isProfileDraftInvalid = (draft) =>
  !draft.firstName.trim() || !draft.lastName.trim() || !isValidEmail(draft.email);

export const getFullName = (profile) =>
  `${profile.firstName} ${profile.lastName}`.trim();

// "" means the field is valid
export const getPasswordErrors = (passwords) => ({
  current: passwords.current ? "" : MESSAGES.passwordCurrentRequired,
  next: passwords.next.length >= PASSWORD_MIN_LENGTH ? "" : MESSAGES.passwordTooShort,
  repeat: passwords.repeat === passwords.next ? "" : MESSAGES.passwordMismatch,
});
