import { Box } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { IMAGES } from "../aboutData";
import { SIDE, zoomOnHover } from "../../../styles/aboutStyles";
import { Photo, Reveal } from "./AboutPrimitives";

export default function Video() {
  return (
    <Box sx={{ px: SIDE, pt: 4, pb: 8 }}>
      <Reveal direction="zoom">
        <Box
          sx={{
            position: "relative",
            aspectRatio: { xs: "16 / 10", md: "696 / 333" },
            ...zoomOnHover,
          }}
        >
          <Photo img={IMAGES.video} alt="Furniture showroom video preview" />

          <Box
            component="button"
            type="button"
            aria-label="Play video"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              border: 0,
              borderRadius: "50%",
              bgcolor: "#000",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "transform .25s ease, background-color .25s ease",
              "&:hover": {
                bgcolor: "#222",
                transform: "translate(-50%, -50%) scale(1.15)",
              },
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.75)",
                animation: "fs-pulse 2.2s ease-out infinite",
                pointerEvents: "none",
              },
              "&::after": { animationDelay: "1.1s" },
            }}
          >
            <PlayArrow />
          </Box>
        </Box>
      </Reveal>
    </Box>
  );
}
