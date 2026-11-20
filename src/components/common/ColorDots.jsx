import { Box } from "@mui/material";
import { COLOR_DOTS } from "../../config/constants";

export function ColorDots({ sx, colors = COLOR_DOTS, hoverScale = true }) {
  return (
    <Box sx={{ display: "flex", gap: "4px", alignItems: "center", ...sx }}>
      {colors.map((color) => (
        <Box
          key={color}
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: color,
            ...(hoverScale && {
              transition: "transform .25s ease",
              "&:hover": { transform: "scale(1.5)" },
            }),
          }}
        />
      ))}
    </Box>
  );
}

export default ColorDots;
