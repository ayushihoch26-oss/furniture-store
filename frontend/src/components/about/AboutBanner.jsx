import { Box, Typography } from "@mui/material";
import { IMAGES } from "../../features/about/aboutData";
import { EASE, GREY_BG, SIDE, heading } from "../../styles/aboutStyles";
import { useInView } from "../../hooks/useInView";
import { BrownButton, Photo, Reveal } from "./AboutPrimitives";

export default function Banner() {
  const [imageRef, imageSeen] = useInView(0.2);

  return (
    <>
      <Box
        ref={imageRef}
        sx={{
          width: "100%",
          height: { xs: "auto", md: 640 },
          aspectRatio: { xs: "16 / 9", md: "auto" },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            transform: imageSeen ? "scale(1)" : "scale(1.15)",
            transition: `transform 1.8s ${EASE}`,
          }}
        >
          <Photo img={IMAGES.banner} alt="Cozy living room" />
        </Box>
      </Box>

      <Box sx={{ bgcolor: GREY_BG, px: SIDE, py: { xs: 4, md: 0 } }}>
        <Box
          sx={{
            minHeight: { md: 154 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Reveal direction="left">
            <Typography sx={{ ...heading, fontSize: { xs: 24, md: 28 } }}>
              Live comfortably inside your home
            </Typography>
            <Typography sx={{ fontSize: 12.5, mt: 1 }}>
              Est nulla tincidunt commodo massa. Nunc interdum cras id augue.
            </Typography>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <BrownButton>Shop now</BrownButton>
          </Reveal>
        </Box>
      </Box>
    </>
  );
}
