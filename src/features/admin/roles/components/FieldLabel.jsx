import { Typography } from "@mui/material";

export default function FieldLabel({ children, theme }) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 600,
        mb: 0.75,
        color: theme?.text || "#0F172A",
      }}
    >
      {children}
    </Typography>
  );
}
