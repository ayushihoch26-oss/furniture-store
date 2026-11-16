import { Box } from "@mui/material";
import { IMAGES } from "../../features/about/aboutData";
import { anim } from "../../styles/aboutStyles";
import { Photo } from "./AboutPrimitives";

export default function PageHero() {
  return (
    <Box
      sx={{
        aspectRatio: { xs: "16 / 9", md: "1036 / 387" },
        overflow: "hidden",
        animation: anim("fs-fadeIn", 0, 1000),
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          animation: "fs-kenburns 20s ease-in-out infinite alternate",
        }}
      >
        <Photo img={IMAGES.hero} alt="Furniture showroom" eager />
      </Box>
    </Box>
  );
}
