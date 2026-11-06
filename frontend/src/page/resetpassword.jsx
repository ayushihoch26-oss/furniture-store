import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useParams } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { BROWN, fieldSx, primaryBtnSx } from "../features/auth/authStyles";
import { resetPassword } from "../service/password.service";

// Route: /reset-password/:token  (this is the link inside the email)
export default function ResetPassword() {
  const { token } = useParams();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const err = {};
    if (form.password.length < 8) err.password = "Minimum 8 characters";
    if (form.confirm !== form.password) err.confirm = "Passwords do not match";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setServerError("");

    try {
      await resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirm,
      });
      setDone(true);
    } catch (err) {
      setServerError(err.message);
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

  // Success screen
  if (done) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been changed. You can now log in with it."
      >
        <Button
          component={Link}
          to="/login"
          replace
          fullWidth
          variant="contained"
          disableElevation
          sx={primaryBtnSx}
        >
          Go to login
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password for your account."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert severity="error" sx={{ mb: "20px", borderRadius: 0 }}>
            {serverError}{" "}
            <Typography
              component={Link}
              to="/forgot-password"
              sx={{ fontSize: 14, color: BROWN, fontWeight: 600 }}
            >
              Request a new link
            </Typography>
          </Alert>
        )}

        <TextField
          fullWidth
          label="New password"
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
          label="Confirm new password"
          name="confirm"
          type={showPass ? "text" : "password"}
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
          error={!!errors.confirm}
          helperText={errors.confirm}
          sx={{ ...fieldSx, mb: "20px" }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disableElevation
          disabled={loading}
          sx={primaryBtnSx}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Reset password"
          )}
        </Button>

        <Typography
          sx={{
            fontSize: 14,
            color: "var(--c-555555)",
            textAlign: "center",
            mt: "28px",
          }}
        >
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
            Back to login
          </Typography>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
