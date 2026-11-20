import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import {
  forgotPasswordAlertSx,
  forgotPasswordFieldSx,
  forgotPasswordFooterSx,
  forgotPasswordLinkSx,
  primaryBtnSx,
} from "../forgotPasswordStyles";

export default function ForgotPasswordForm({
  email,
  fieldError,
  serverError,
  sentTo,
  loading,
  handleChange,
  handleSubmit,
}) {
  const buttonText = sentTo ? "Send again" : "Send reset link";

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <Alert severity="error" sx={forgotPasswordAlertSx}>
          {serverError}
        </Alert>
      )}

      {sentTo && (
        <Alert severity="success" sx={forgotPasswordAlertSx}>
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
        onChange={handleChange}
        error={!!fieldError}
        helperText={fieldError}
        sx={forgotPasswordFieldSx}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disableElevation
        disabled={loading}
        sx={primaryBtnSx}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : buttonText}
      </Button>

      <Typography sx={forgotPasswordFooterSx}>
        Remembered your password?{" "}
        <Typography component={Link} to="/login" sx={forgotPasswordLinkSx}>
          Login
        </Typography>
      </Typography>
    </Box>
  );
}
