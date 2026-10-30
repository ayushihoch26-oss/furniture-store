import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";

import AuthLayout, {
  BROWN,
  fieldSx,
  primaryBtnSx,
} from "../components/AuthLayout";
import { forgotPassword } from "../service/password.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [sentTo, setSentTo] = useState(""); // email the link was sent to
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setFieldError("Enter a valid email");
      return;
    }

    setLoading(true);
    setServerError("");
    setSentTo("");

    try {
      await forgotPassword(cleanEmail);
      setSentTo(cleanEmail);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we will send you a link to reset your password."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert severity="error" sx={{ mb: "20px", borderRadius: 0 }}>
            {serverError}
          </Alert>
        )}

        {sentTo && (
          <Alert severity="success" sx={{ mb: "20px", borderRadius: 0 }}>
            Password reset link has been sent to <b>{sentTo}</b> (if an account
            exists for it). Please check your inbox and spam folder. The link is
            valid for 60 minutes.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldError("");
            setServerError("");
          }}
          error={!!fieldError}
          helperText={fieldError}
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
          ) : sentTo ? (
            "Send again"
          ) : (
            "Send reset link"
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
          Remembered your password?{" "}
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
