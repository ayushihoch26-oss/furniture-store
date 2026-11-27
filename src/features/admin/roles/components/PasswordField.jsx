import { useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { DEFAULT_THEME, getInputSx } from "../utils/roles.theme";

// password box with show / hide eye
export default function PasswordField({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  helperText,
  theme = DEFAULT_THEME,
}) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      fullWidth
      size="small"
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      helperText={helperText}
      sx={getInputSx(theme)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setShow((previous) => !previous)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? (
                <Visibility fontSize="small" />
              ) : (
                <VisibilityOff fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
