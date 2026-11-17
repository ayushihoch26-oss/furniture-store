import { Box } from "@mui/material";
import { DOTS } from "../../features/dashboard/dashboardData";

// ---------- Reusable pieces ----------
export function ColorDots({ sx }) {
  return (
    <Box sx={{ display: "flex", gap: "4px", alignItems: "center", ...sx }}>
      {DOTS.map((color) => (
        <Box
          key={color}
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: color,
            transition: "transform .25s ease",
            "&:hover": { transform: "scale(1.5)" },
          }}
        />
      ))}
    </Box>
  );
}
