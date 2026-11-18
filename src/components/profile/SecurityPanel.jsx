import { useState } from "react";
import { Box, Button, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import profileService from "../../service/profile.service";
import { Field, PanelTitle } from "./ProfileShared";
import { brownBtn } from "../../styles/profileStyles";

function PasswordField({ label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={error}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"} edge="end">
                {show ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default function SecurityPanel({ notify }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const set = (name) => (event) => {
    setForm((previous) => ({ ...previous, [name]: event.target.value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationErrors = {};
    if (!form.current) validationErrors.current = "Enter your current password";
    if (form.next.length < 8 || !/\d/.test(form.next)) validationErrors.next = "At least 8 characters, including a number";
    if (form.confirm !== form.next) validationErrors.confirm = "Passwords do not match";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;
    try {
      await profileService.changePassword(form);
      setForm({ current: "", next: "", confirm: "" });
      setErrors({});
      notify("Password updated");
    } catch (error) {
      notify(error.message || "Failed to update password");
    }
  };

  return (
    <Box component="form" noValidate onSubmit={submit} sx={{ maxWidth: 520 }}>
      <PanelTitle title="Change password" subtitle="Use a strong password you don't use elsewhere." />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <PasswordField label="Current password" value={form.current} onChange={set("current")} error={errors.current} />
        <PasswordField label="New password" value={form.next} onChange={set("next")} error={errors.next} />
        <PasswordField label="Confirm new password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
      </Box>
      <Button type="submit" sx={{ ...brownBtn, mt: 4 }}>Update password</Button>
    </Box>
  );
}
