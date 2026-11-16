import { Box, Typography } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { COLLECTIONS, IMAGES } from "../aboutData";
import { BROWN, GAP, GREY_BG, SIDE, stagger, zoomOnHover } from "../../../styles/aboutStyles";
import { Photo, Reveal } from "./AboutPrimitives";

export default function Collections() {
  return (
    <Box sx={{ bgcolor: GREY_BG, px: SIDE, py: 8 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: GAP,
        }}
      >
        {COLLECTIONS.map((item, index) => (
          <Reveal key={item.title} delay={stagger(index, 180)}>
            <Box
              sx={{
                "&:hover .fs-shop-arrow": { transform: "translateX(5px)" },
                "&:hover .fs-shop-link": { color: BROWN },
              }}
            >
              <Box sx={{ aspectRatio: "342 / 223", mb: 1, ...zoomOnHover }}>
                <Photo img={IMAGES.collections[index]} alt={item.title} />
              </Box>

              <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: 9,
                  lineHeight: "15px",
                  color: "var(--c-666666)",
                  mb: 1,
                }}
              >
                {item.text}
              </Typography>

              <Box
                className="fs-shop-link"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "color .25s ease",
                }}
              >
                Shop Now
                <ArrowForward
                  className="fs-shop-arrow"
                  sx={{ fontSize: 13, transition: "transform .3s ease" }}
                />
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}
