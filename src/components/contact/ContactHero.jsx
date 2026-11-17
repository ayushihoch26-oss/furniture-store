import { memo } from "react";
import { Box } from "@mui/material";
import { HERO_BACKGROUND } from "../../features/contact/contactData";
import { anim, HERO_HEIGHT } from "../../styles/contactStyles";

// Hero section
const Hero = memo(function Hero() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: HERO_HEIGHT,
        backgroundColor: "#705a43",
        animation: anim("fs-fadeIn", 0, 900),
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: HERO_BACKGROUND,
          backgroundColor: "#705a43",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          animation: "fs-kenburns 22s ease-in-out infinite alternate",
        }}
      />
    </Box>
  );
});

export default Hero;
