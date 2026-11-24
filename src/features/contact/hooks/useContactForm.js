import { useState } from "react";
import { EMPTY_FORM } from "../contactData";
import { sendContactMessage } from "../services/contact.service";

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name";
  }

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email";
  }

  if (!values.message.trim()) {
    errors.message = "Please enter a message";
  }

  return errors;
}

export default function useContactForm() {
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [messageSent, setMessageSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormValues((previousValues) => ({
      ...previousValues,
      [fieldName]: fieldValue,
    }));

    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [fieldName]: "",
    }));

    setMessageSent(false);
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSending) {
      return;
    }

    setMessageSent(false);
    setSubmitError("");

    const errors = validateForm(formValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSending(true);

    try {
      await sendContactMessage({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        message: formValues.message,
      });

      setMessageSent(true);
      setFormValues({ ...EMPTY_FORM });
      setFormErrors({});
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to send your message. Please try again.";

      setSubmitError(errorMessage);
    } finally {
      setIsSending(false);
    }
  }

  return {
    formValues,
    formErrors,
    messageSent,
    isSending,
    submitError,
    handleChange,
    handleSubmit,
  };
}
