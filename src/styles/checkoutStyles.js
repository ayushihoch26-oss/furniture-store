import { BROWN } from "../features/checkout/checkoutConstants";

export const FIELD_STYLES = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    bgcolor: "var(--c-ffffff)",
    color: "var(--c-111111)",
    fontSize: { xs: 14, lg: 15 },
    "& fieldset": { borderColor: "var(--c-d9d4cf)" },
    "&:hover fieldset": { borderColor: BROWN },
    "&.Mui-focused fieldset": { borderColor: BROWN, borderWidth: 1 },
  },
  "& .MuiInputBase-input": { color: "var(--c-111111)" },
  "& .MuiInputBase-input::placeholder": { color: "var(--c-888888)", opacity: 1 },
  "& .MuiInputLabel-root": {
    fontSize: { xs: 14, lg: 15 },
    color: "var(--c-777777)",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BROWN },
};

export const STEPPER_STYLES = {
  "& .MuiStepIcon-root": {
    color: "#d6cfc8",
    fontSize: { xs: 26, lg: 30 },
  },
  "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
    color: BROWN,
  },
  "& .MuiStepLabel-label": {
    fontSize: { xs: 12, lg: 14 },
    color: "var(--c-888888)",
  },
  "& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
    color: "var(--c-111111)",
    fontWeight: 600,
  },
  "& .MuiStepConnector-line": {
    borderColor: "var(--c-d6cfc8)",
    borderTopWidth: 2,
  },
  "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
    borderColor: BROWN,
  },
};
