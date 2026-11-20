import { Box } from "@mui/material";
import { MAP_URL } from "../contactData";
import { SIDE } from "../contactStyles";
import useLazyMap from "../hooks/useLazyMap";
import Reveal from "./ContactReveal";

export default function ContactMap() {
  const [mapRef, shouldLoadMap] = useLazyMap();

  return (
    <Box
      ref={mapRef}
      sx={{
        px: SIDE,
        py: { xs: "56px", md: "80px", lg: "120px" },
      }}
    >
      <Reveal direction="zoom">
        <Box
          sx={{
            width: "100%",
            height: { xs: 260, md: 360, lg: 460 },
            bgcolor: "var(--c-f4f2f0)",
            overflow: "hidden",
          }}
        >
          {shouldLoadMap && (
            <Box
              component="iframe"
              title="Furniture Store location"
              src={MAP_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                border: 0,
                filter: "grayscale(0.25)",
                transition: "filter .5s ease",
                "&:hover": { filter: "grayscale(0)" },
              }}
            />
          )}
        </Box>
      </Reveal>
    </Box>
  );
}
