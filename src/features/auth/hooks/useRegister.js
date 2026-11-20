import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/register.service";
import {
  getRegisterErrorMessage,
  validateRegister,
} from "../utils/validateRegister";

export default function useRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const validationErrors = validateRegister(form, agree);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirm,
      });

      navigate("/", { replace: true });
    } catch (error) {
      if (error?.status === 409) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: error.message || "This email is already registered",
        }));
      } else {
        setServerError(getRegisterErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    agree,
    showPass,
    errors,
    serverError,
    loading,
    setAgree,
    setShowPass,
    setErrors,
    handleChange,
    handleSubmit,
  };
}
