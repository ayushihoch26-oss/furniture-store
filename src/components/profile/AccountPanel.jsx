import { useState } from "react";
import { Box, Button, MenuItem } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Field, PanelTitle } from "./ProfileShared";
import { brownBtn, outlineBtn } from "../../styles/profileStyles";

export default function AccountPanel({ profile, onSave }) {
  const [form, setForm] = useState(() => ({ ...profile }));
  const [errors, setErrors] = useState({});

  const set = (name) => (event) => {
    setForm((previous) => ({ ...previous, [name]: event.target.value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const validationErrors = {};
    if (!form.firstName.trim()) validationErrors.firstName = "Required";
    if (!form.lastName.trim()) validationErrors.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) validationErrors.email = "Enter a valid email address";
    if (form.phone.replace(/\D/g, "").length < 7) validationErrors.phone = "Enter a valid phone number";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) onSave(form);
  };

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <PanelTitle title="Account details" subtitle="Update your personal information." />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <Field label="First name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
        <Field label="Last name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        <Field label="Email address" type="email" value={form.email} onChange={set("email")} error={errors.email} />
        <Field label="Phone number" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <Field label="Birthday" type="date" value={form.birthday} onChange={set("birthday")} slotProps={{ inputLabel: { shrink: true } }} />
        <Field select label="Gender" value={form.gender} onChange={set("gender")} slotProps={{ select: { IconComponent: KeyboardArrowDown, MenuProps: { disableScrollLock: true } } }}>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Field>
      </Box>
      <Box sx={{ display: "flex", gap: 2, mt: 4, flexDirection: { xs: "column", sm: "row" } }}>
        <Button type="submit" sx={{ ...brownBtn, width: { xs: "100%", sm: "auto" } }}>Save changes</Button>
        <Button type="button" variant="outlined" onClick={() => { setForm({ ...profile }); setErrors({}); }} sx={{ ...outlineBtn, width: { xs: "100%", sm: "auto" } }}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}
