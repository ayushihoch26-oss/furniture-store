import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import { sendContactMessage } from "../../service/contact.service";
import { EMPTY_FORM } from "../../features/contact/contactData";
import { BROWN } from "../../styles/contactStyles";
import ContactField from "./ContactField";
import Reveal from "./ContactReveal";

export default function ContactForm() {
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

  function validateForm() {
    const errors = {};

    if (!formValues.name.trim()) {
      errors.name = "Please enter your name";
    }

    if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) {
      errors.email = "Please enter a valid email";
    }

    if (!formValues.message.trim()) {
      errors.message = "Please enter a message";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSending) {
      return;
    }

    setMessageSent(false);
    setSubmitError("");

    const formIsValid = validateForm();

    if (!formIsValid) {
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

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{
        bgcolor: "var(--c-ffffff)",
        p: {
          xs: "24px 20px 28px",
          md: "30px 32px 36px",
          lg: "36px 40px 40px",
        },
        minWidth: 0,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        transition: "box-shadow .4s ease",
        "&:hover": {
          boxShadow: "0 18px 40px rgba(0,0,0,.08)",
        },
      }}
    >
      <Reveal delay={200}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 22, lg: 28 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: "36px",
            mb: { xs: "20px", lg: "28px" },
          }}
        >
          Get in touch
        </Typography>
      </Reveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "24px",
        }}
      >
        <Reveal delay={300}>
          <ContactField
            id="name"
            name="name"
            label="Name"
            placeholder="Your name..."
            value={formValues.name}
            onChange={handleChange}
            error={formErrors.name}
            disabled={isSending}
          />
        </Reveal>

        <Reveal delay={400}>
          <ContactField
            id="phone"
            name="phone"
            label="Phone"
            type="tel"
            placeholder="Your phone number..."
            value={formValues.phone}
            onChange={handleChange}
            disabled={isSending}
          />
        </Reveal>

        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <Reveal delay={500}>
            <ContactField
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Your email address..."
              value={formValues.email}
              onChange={handleChange}
              error={formErrors.email}
              disabled={isSending}
            />
          </Reveal>
        </Box>

        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <Reveal delay={600}>
            <ContactField
              id="message"
              name="message"
              label="Message"
              multiline
              placeholder="Your message..."
              value={formValues.message}
              onChange={handleChange}
              error={formErrors.message}
              disabled={isSending}
            />
          </Reveal>
        </Box>
      </Box>

      <Reveal delay={700}>
        <Box
          sx={{
            mt: { xs: "28px", lg: "40px" },
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isSending}
            sx={{
              width: { xs: "100%", sm: 200 },
              height: { xs: 46, lg: 50 },
              bgcolor: BROWN,
              borderRadius: 0,
              textTransform: "none",
              fontSize: { xs: 16, lg: 18 },
              fontWeight: 500,
              transition:
                "transform .25s ease, background-color .25s ease, box-shadow .25s ease",
              "&:hover": {
                bgcolor: "#7d6149",
                transform: "translateY(-3px)",
                boxShadow: "0 10px 20px rgba(125,97,73,.35)",
              },
              "&:active": {
                transform: "translateY(0) scale(.97)",
              },
              "&.Mui-disabled": {
                bgcolor: BROWN,
                color: "#fff",
                opacity: 0.7,
              },
            }}
          >
            {isSending ? "Sending..." : "Send message"}
          </Button>

          {messageSent && (
            <Box
              role="status"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#2e7d32",
                animation: "fs-popIn .5s ease both",
              }}
            >
              <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: 14, color: "inherit" }}>
                Thanks! Your message has been sent.
              </Typography>
            </Box>
          )}

          {submitError && (
            <Typography
              role="alert"
              sx={{
                width: "100%",
                color: "#d32f2f",
                fontSize: 14,
              }}
            >
              {submitError}
            </Typography>
          )}
        </Box>
      </Reveal>
    </Box>
  );
}
