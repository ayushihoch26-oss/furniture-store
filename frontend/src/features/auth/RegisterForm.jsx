import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { BROWN, fieldSx, primaryBtnSx } from "./authStyles";

export default function RegisterForm({
  form,
  agree,
  showPass,
  errors,
  serverError,
  loading,
  setAgree,
  setShowPass,
  setErrors,
  handleChange,
  handleSubmit,
}) {
  const passwordAdornment = (
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
        InputProps={{ endAdornment: passwordAdornment }}
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
        InputProps={{ endAdornment: passwordAdornment }}
      />

      <FormControlLabel
        sx={{ mt: "8px", alignItems: "flex-start" }}
        control={
          <Checkbox
            checked={agree}
            onChange={(event) => {
              setAgree(event.target.checked);
              setErrors((currentErrors) => ({ ...currentErrors, agree: "" }));
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
          <Typography
            sx={{ fontSize: 13, color: "var(--c-111111)", lineHeight: 1.6 }}
          >
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
        sx={{
          fontSize: 14,
          color: "var(--c-555555)",
          textAlign: "center",
          mt: "28px",
        }}
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
  );
}
