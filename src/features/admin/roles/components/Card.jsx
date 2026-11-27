import { Box } from "@mui/material";

export default function Card({ children, sx, theme, darkMode }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,.25)"
          : "0 1px 4px rgba(0,0,0,.06)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
