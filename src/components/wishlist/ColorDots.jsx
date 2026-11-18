import { Box } from "@mui/material";
import { DOTS } from "../../styles/wishlistStyles";

export default function ColorDots({ sx }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "4px",
        alignItems: "center",
        ...sx,
      }}
    >
      {DOTS.map((color) => (
        <Box
          key={color}
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: color,
          }}
        />
      ))}
    </Box>
  );
}
