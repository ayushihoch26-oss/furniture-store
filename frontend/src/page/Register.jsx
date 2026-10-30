import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout, {
  BROWN,
  fieldSx,
  primaryBtnSx,
} from "../components/AuthLayout";
import { registerUser } from "../service/register.service";

export default function Register() {
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "Required";
    if (!form.lastName.trim()) err.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email";
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone))
      err.phone = "Enter a valid phone";
    // Backend requires at least 8 characters
    if (form.password.length < 8) err.password = "Minimum 8 characters";
    if (form.confirm !== form.password) err.confirm = "Passwords do not match";
    if (!agree) err.agree = "Please accept the terms";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

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
    } catch (err) {
      // 409 = email already registered -> show it on the email field
      if (err.status === 409) {
        setErrors((prev) => ({ ...prev, email: err.message }));
      } else {
        setServerError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const eye = (
    <InputAdornment position="end">
      <IconButton
        aria-label="Toggle password visibility"
        onClick={() => setShowPass(!showPass)}
        edge="end"
        size="small"
      >
        {showPass ? (
          <VisibilityOff fontSize="small" />
        ) : (
          <Visibility fontSize="small" />
        )}
      </IconButton>
    </InputAdornment>
  );

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join us and discover furniture for every home."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert severity="error" sx={{ mb: "20px", borderRadius: 0 }}>
            {serverError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            mb: "20px",
          }}
        >
          <TextField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            sx={fieldSx}
          />
          <TextField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            sx={fieldSx}
          />
        </Box>

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          sx={{ ...fieldSx, mb: "20px" }}
        />

        <TextField
          fullWidth
          label="Phone (optional)"
          name="phone"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          sx={{ ...fieldSx, mb: "20px" }}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPass ? "text" : "password"}
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          sx={{ ...fieldSx, mb: "20px" }}
          InputProps={{ endAdornment: eye }}
        />

        <TextField
          fullWidth
          label="Confirm password"
          name="confirm"
          type={showPass ? "text" : "password"}
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
          error={!!errors.confirm}
          helperText={errors.confirm}
          sx={fieldSx}
        />

        <FormControlLabel
          sx={{ mt: "8px", alignItems: "flex-start" }}
          control={
            <Checkbox
              checked={agree}
              onChange={(e) => {
                setAgree(e.target.checked);
                setErrors({ ...errors, agree: "" });
              }}
              size="small"
              sx={{
                color: "var(--c-999999)",
                "&.Mui-checked": { color: BROWN },
                pt: "6px",
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: "var(--c-111111)", lineHeight: 1.6 }}>
              I agree to the{" "}
              <Box component="span" sx={{ color: BROWN }}>
                Terms of Service
              </Box>{" "}
              and{" "}
              <Box component="span" sx={{ color: BROWN }}>
                Privacy Policy
              </Box>
            </Typography>
          }
        />
        {errors.agree && (
          <FormHelperText error sx={{ ml: "14px", mt: 0 }}>
            {errors.agree}
          </FormHelperText>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disableElevation
          disabled={loading}
          sx={{ ...primaryBtnSx, mt: "20px" }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Create account"
          )}
        </Button>

        <Typography
          sx={{ fontSize: 14, color: "var(--c-555555)", textAlign: "center", mt: "28px" }}
        >
          Already have an account?{" "}
          <Typography
            component={Link}
            to="/login"
            sx={{
              fontSize: 14,
              color: BROWN,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Login
          </Typography>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
