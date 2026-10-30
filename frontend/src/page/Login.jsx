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
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";

import AuthLayout, {
  BROWN,
  fieldSx,
  primaryBtnSx,
} from "../components/AuthLayout";
import { loginUser } from "../service/login.service";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
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
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email";
    if (!form.password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setServerError("");
    try {
      const { user } = await loginUser({ ...form, remember });
      const from = location.state?.from?.pathname;

      let target = "/";
      if (user.role === "admin") {
        // admin goes back to the admin page they wanted, otherwise the dashboard
        target = from?.startsWith("/admin") ? from : "/admin";
      } else {
        // customers never land in /admin
        target = from && !from.startsWith("/admin") ? from : "/";
      }

      navigate(target, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your account to continue."
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert severity="error" sx={{ mb: "20px", borderRadius: 0 }}>
            {serverError}
          </Alert>
        )}

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
            ),
          }}
        />

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
                sx={{ color: "var(--c-999999)", "&.Mui-checked": { color: BROWN } }}
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

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disableElevation
          disabled={loading}
          sx={primaryBtnSx}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
        </Button>

        <Divider sx={{ my: "28px", fontSize: 12, color: "var(--c-999999)" }}>or</Divider>

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
            "&:hover": { borderColor: "var(--c-111111)", bgcolor: "transparent" },
          }}
        >
          Continue with Google
        </Button>

        <Typography
          sx={{ fontSize: 14, color: "var(--c-555555)", textAlign: "center", mt: "28px" }}
        >
          Don&apos;t have an account?{" "}
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
    </AuthLayout>
  );
}
