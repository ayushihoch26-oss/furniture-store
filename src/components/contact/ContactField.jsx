import {
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { BROWN } from "../../styles/contactStyles";

export default function ContactField({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  multiline = false,
}) {
  const fieldSize = multiline
    ? {
        p: 0,
        alignItems: "flex-start",
        minHeight: { xs: 120, lg: 134 },
      }
    : {
        height: { xs: 44, lg: 48 },
      };

  return (
    <Box
      sx={{
        minWidth: 0,
        animation: error ? "fs-shake .4s ease" : "none",
        "&:focus-within label": {
          color: BROWN,
        },
      }}
    >
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          display: "block",
          fontSize: { xs: 14, lg: 16 },
          fontWeight: 500,
          color: "var(--c-111111)",
          lineHeight: "24px",
          mb: "6px",
          transition: "color .25s ease",
        }}
      >
        {label}
      </Typography>

      <TextField
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 4 : undefined}
        error={Boolean(error)}
        helperText={error || undefined}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            bgcolor: "var(--c-ffffff)",
            fontSize: { xs: 14, lg: 16 },
            color: "var(--c-111111)",
            transition: "box-shadow .25s ease",
            ...fieldSize,
            "& fieldset": {
              borderColor: "var(--c-e2e2e2)",
              transition: "border-color .25s ease",
            },
            "&:hover fieldset": {
              borderColor: "#BDBDBD",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(148,116,88,.18)",
            },
            "&.Mui-focused fieldset": {
              borderColor: BROWN,
            },
            "&.Mui-error fieldset": {
              borderColor: "#d32f2f",
            },
          },
          "& input": {
            px: "16px",
            py: 0,
            height: "100%",
            boxSizing: "border-box",
          },
          "& textarea": {
            px: "16px",
            py: "14px",
          },
          "& ::placeholder": {
            color: "#A8A8A8",
            opacity: 1,
          },
          "& .MuiFormHelperText-root": {
            mx: 0,
            mt: "4px",
            fontSize: 12,
          },
        }}
      />
    </Box>
  );
}
