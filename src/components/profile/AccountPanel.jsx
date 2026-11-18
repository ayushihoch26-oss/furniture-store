import { useState } from "react";
import { Box, Button, MenuItem } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

import { Field, PanelTitle } from "./ProfileShared";
import { brownBtn, outlineBtn } from "../../styles/profileStyles";

export default function AccountPanel({ profile, onSave }) {
  const [form, setForm] = useState({ ...profile });
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

  function handleSubmit(event) {
    event.preventDefault();

    const formErrors = {};

    if (!form.firstName.trim()) {
      formErrors.firstName = "Required";
    }

    if (!form.lastName.trim()) {
      formErrors.lastName = "Required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      formErrors.email = "Enter a valid email address";
    }

    if (form.phone.replace(/\D/g, "").length < 7) {
      formErrors.phone = "Enter a valid phone number";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      onSave(form);
    }
  }

  function handleReset() {
    setForm({ ...profile });
    setErrors({});
  }

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <PanelTitle
        title="Account details"
        subtitle="Update your personal information."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Field
          label="First name"
          value={form.firstName}
          onChange={(event) => handleChange("firstName", event)}
          error={errors.firstName}
        />

        <Field
          label="Last name"
          value={form.lastName}
          onChange={(event) => handleChange("lastName", event)}
          error={errors.lastName}
        />

        <Field
          label="Email address"
          type="email"
          value={form.email}
          onChange={(event) => handleChange("email", event)}
          error={errors.email}
        />

        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={(event) => handleChange("phone", event)}
          error={errors.phone}
        />

        <Field
          label="Birthday"
          type="date"
          value={form.birthday}
          onChange={(event) => handleChange("birthday", event)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Field
          select
          label="Gender"
          value={form.gender}
          onChange={(event) => handleChange("gender", event)}
          slotProps={{
            select: {
              IconComponent: KeyboardArrowDown,
              MenuProps: { disableScrollLock: true },
            },
          }}
        >
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Field>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          type="submit"
          sx={{
            ...brownBtn,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Save changes
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={handleReset}
          sx={{
            ...outlineBtn,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}
