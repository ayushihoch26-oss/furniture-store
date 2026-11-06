
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { BROWN, fieldSx, primaryBtnSx } from "./authStyles";

export default function LoginForm({
  form,
  remember,
  showPass,
  errors,
  serverError,
  loading,
  setRemember,
  setShowPass,
  handleChange,
  handleSubmit,
}) {
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>

      {/* Server Error */}
      {serverError && (
        <Alert severity="error" sx={{ mb: "20px", borderRadius: 0 }}>
          {serverError}
        </Alert>
      )}

      {/* Email Field */}
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

      {/* Password Field */}
      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPass ? "text" : "password"}
        autoComplete="current-password"
        value={form.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
        sx={fieldSx}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPass(!showPass)}
                edge="end"
                size="small"
                aria-label="Toggle password visibility"
              >
                {showPass ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Remember Me and Forgot Password */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: "12px",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              size="small"
              sx={{
                color: "var(--c-999999)",
                "&.Mui-checked": { color: BROWN },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: "var(--c-111111)" }}>
              Remember me
            </Typography>
          }
        />

        <Typography
          component={Link}
          to="/forgot-password"
          sx={{ fontSize: 13, color: BROWN, textDecoration: "none" }}
        >
          Forgot password?
        </Typography>
      </Box>

      {/* Login Button */}
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
          "Login"
        )}
      </Button>

      {/* OR Divider */}
      <Divider sx={{ my: "28px", fontSize: 12, color: "var(--c-999999)" }}>
        or
      </Divider>

      {/* Google Button */}
      <Button
        fullWidth
        variant="outlined"
        sx={{
          height: 48,
          borderRadius: 0,
          borderColor: "var(--c-111111)",
          color: "var(--c-111111)",
          fontSize: 14,
          textTransform: "none",
          "&:hover": {
            borderColor: "var(--c-111111)",
            bgcolor: "transparent",
          },
        }}
      >
        Continue with Google
      </Button>

      {/* Register Link */}
      <Typography
        sx={{
          fontSize: 14,
          color: "var(--c-555555)",
          textAlign: "center",
          mt: "28px",
        }}
      >
        Don't have an account?{" "}

        <Typography
          component={Link}
          to="/register"
          sx={{
            fontSize: 14,
            color: BROWN,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Register
        </Typography>
      </Typography>

    </Box>
  );
}
