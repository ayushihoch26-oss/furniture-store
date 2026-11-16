import { Box, Typography } from "@mui/material";
import { IMAGES } from "../../features/about/aboutData";
import { SIDE, heading, stagger, zoomOnHover } from "../../styles/aboutStyles";
import { Photo, Reveal } from "./AboutPrimitives";

export default function Instagram() {
  return (
    <Box sx={{ px: SIDE, pt: 7, pb: 8 }}>
      <Reveal>
        <Typography sx={{ ...heading, fontSize: { xs: 24, md: 26 }, mb: 2 }}>
          Follow Us on Instagram
        </Typography>
      </Reveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
          gap: "12px",
        }}
      >
        {IMAGES.instagram.map((img, index) => (
          <Reveal key={img.src} direction="zoom" delay={stagger(index, 100)}>
            <Box
              sx={{
                position: "relative",
                aspectRatio: "1",
                cursor: "pointer",
                ...zoomOnHover,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(148,116,88,.35)",
                  opacity: 0,
                  transition: "opacity .35s ease",
                  pointerEvents: "none",
                },
                "&:hover::after": { opacity: 1 },
              }}
            >
              <Photo img={img} alt={`Instagram post ${index + 1}`} />
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}
