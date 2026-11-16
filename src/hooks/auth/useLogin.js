import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../service/login.service";
import {
  getLoginErrorMessage,
  validateLogin,
} from "../../utils/auth/validateLogin";

export default function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
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

    const validationErrors = validateLogin(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setServerError("");

    try {
      const { user } = await loginUser({ ...form, remember });
      const from = location.state?.from?.pathname;
      const target =
        user.role === "admin"
          ? from?.startsWith("/admin")
            ? from
            : "/admin"
          : from && !from.startsWith("/admin")
            ? from
            : "/";

      navigate(target, { replace: true });
    } catch (error) {
      setServerError(getLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    remember,
    showPass,
    errors,
    serverError,
    loading,
    setRemember,
    setShowPass,
    handleChange,
    handleSubmit,
  };
}
