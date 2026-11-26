// components/StatCard.jsx
// One small card, e.g. "Total Orders  120".
import { Box, Typography } from "@mui/material";
import { COLORS } from "../constants/orderConstants";

export default function StatCard({ title, value, theme, darkMode }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: "12px",
        p: 2.5,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        transition: "0.3s",
        "&:hover": { transform: "translateY(-5px)" },
      }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{title}</Typography>
      <Typography
        sx={{ fontSize: 28, fontWeight: 800, mt: 1.5, color: darkMode ? "#D8B89A" : COLORS.brown }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: theme.muted, mt: 1 }}>Last 7 days</Typography>
    </Box>
  );
}
