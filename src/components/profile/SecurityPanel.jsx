import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import profileService from "../../service/profile.service";
import { Field, PanelTitle } from "./ProfileShared";
import { brownBtn } from "../../styles/profileStyles";

function PasswordField({ label, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <Field
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={error}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                edge="end"
              >
                {showPassword ? (
                  <VisibilityOff sx={{ fontSize: 20 }} />
                ) : (
                  <Visibility sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default function SecurityPanel({ notify }) {
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});

  function handleChange(fieldName, event) {
    const newValue = event.target.value;

    setForm({
      ...form,
      [fieldName]: newValue,
    });

    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: undefined,
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formErrors = {};

    if (!form.current) {
      formErrors.current = "Enter your current password";
    }

    if (form.next.length < 8 || !/\d/.test(form.next)) {
      formErrors.next = "At least 8 characters, including a number";
    }

    if (form.confirm !== form.next) {
      formErrors.confirm = "Passwords do not match";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    try {
      await profileService.changePassword(form);

      setForm({
        current: "",
        next: "",
        confirm: "",
      });
      setErrors({});
      notify("Password updated");
    } catch (error) {
      notify(error.message || "Failed to update password");
    }
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ maxWidth: 520 }}
    >
      <PanelTitle
        title="Change password"
        subtitle="Use a strong password you don't use elsewhere."
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <PasswordField
          label="Current password"
          value={form.current}
          onChange={(event) => handleChange("current", event)}
          error={errors.current}
        />

        <PasswordField
          label="New password"
          value={form.next}
          onChange={(event) => handleChange("next", event)}
          error={errors.next}
        />

        <PasswordField
          label="Confirm new password"
          value={form.confirm}
          onChange={(event) => handleChange("confirm", event)}
          error={errors.confirm}
        />
      </Box>

      <Button
        type="submit"
        sx={{
          ...brownBtn,
          mt: 4,
        }}
      >
        Update password
      </Button>
    </Box>
  );
}
