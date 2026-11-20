import { useState } from "react";
import { forgotPassword as sendPasswordResetEmail } from "../services/password.service";
import { validateForgotPasswordEmail } from "../utils/validateForgotPassword";

export default function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
    setFieldError("");
    setServerError("");
  }; 

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim();

    const emailError = validateForgotPasswordEmail(cleanEmail);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setLoading(true);
    setServerError("");
    setSentTo("");

    try {
      await sendPasswordResetEmail(cleanEmail);
      setSentTo(cleanEmail);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    fieldError,
    serverError,
    sentTo,
    loading,
    handleChange,
    handleSubmit,
  };
}
