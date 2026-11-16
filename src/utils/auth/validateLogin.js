export function validateLogin(form) {
  const errors = {};

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email";
  }

  if (!form.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function getLoginErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to log in. Please try again."
  );
}
