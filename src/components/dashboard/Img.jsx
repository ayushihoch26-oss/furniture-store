import { Box } from "@mui/material";
import { EASE } from "../../styles/dashboardStyles";

export function Img({ src, alt = "" }) {
  if (!src) return null;

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        p: { xs: "8px", md: "14px", lg: "18px" },
        objectFit: "contain",
        objectPosition: "center",
        display: "block",
        transition: `transform .6s ${EASE}`,
      }}
    />
  );
}
