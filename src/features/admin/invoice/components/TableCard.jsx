import { Box } from "@mui/material";

export default function TableCard({ children, theme }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      }}
    >
      {children}
    </Box>
  );
}
