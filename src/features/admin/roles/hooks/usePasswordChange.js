import { useState } from "react";
import adminProfileService, {
  getErrorMessage,
} from "../services/adminProfile.service";
import { EMPTY_PASSWORDS, MESSAGES } from "../constants/roles.constants";
import { getPasswordErrors } from "../utils/roles.utils";

export default function usePasswordChange({ showToast }) {
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [touched, setTouched] = useState(false);

  const updatePassword = (field, value) =>
    setPasswords((previous) => ({ ...previous, [field]: value }));

  const passwordErrors = getPasswordErrors(passwords);

  // Errors only show after the first save attempt
  const showError = (field) => touched && Boolean(passwordErrors[field]);

  const savePassword = async () => {
    setTouched(true);

    if (Object.values(passwordErrors).some(Boolean)) return;

    try {
      await adminProfileService.changePassword(passwords);
      setPasswords(EMPTY_PASSWORDS);
      setTouched(false);
      showToast(MESSAGES.passwordChanged);
    } catch (err) {
      showToast(getErrorMessage(err, MESSAGES.passwordChangeFailed), "error");
    }
  };

  return { passwords, passwordErrors, showError, updatePassword, savePassword };
}
