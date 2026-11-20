export function validateRegister(form, agree) {
  const errors = {};

  if (!form.firstName?.trim()) {
    errors.firstName = "Required";
  }

  if (!form.lastName?.trim()) {
    errors.lastName = "Required";
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email?.trim() || "")) {
    errors.email = "Enter a valid email";
  }

  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
    errors.phone = "Enter a valid phone";
  }

  if (form.password.length < 8) {
    errors.password = "Minimum 8 characters";
  }

  if (form.confirm !== form.password) {
    errors.confirm = "Passwords do not match";
  }

  if (!agree) {
    errors.agree = "Please accept the terms";
  }

  return errors;
}

export function getRegisterErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to create your account. Please try again."
  );
}
