import { PlayArrow } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { Reveal } from "../../../components/common/Reveal";

// ---------- Video banner ----------
export function VideoBanner() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: { xs: "auto", md: 520, lg: 560, xl: 640 },
        bgcolor: "var(--c-f4f2f0)",
      }}
    >
      <Reveal
        direction="left"
        sx={{ display: "flex", minHeight: { xs: 280, md: "100%" } }}
      >
        <Box
          sx={{
            position: "relative",
            flex: 1,
            background: `
    linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.15)),
    url("https://images.unsplash.com/photo-1680007889201-114ac772447d?q=80&w=900&h=700&fit=crop")
    center / cover no-repeat
  `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            aria-label="Play video"
            sx={{
              position: "relative",
              width: 60,
              height: 60,
              bgcolor: "#000",
              color: "#fff",
              transition: "transform .25s ease, background-color .25s ease",
              "&:hover": { bgcolor: "#222", transform: "scale(1.12)" },
              // Pulsing rings around the play button
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.7)",
                animation: "fs-pulse 2.2s ease-out infinite",
                pointerEvents: "none",
              },
              "&::after": { animationDelay: "1.1s" },
            }}
          >
            <PlayArrow />
          </IconButton>
        </Box>
      </Reveal>

      <Box
        sx={{
          px: { xs: 2, md: "100px" },
          py: { xs: 5, md: 0 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Reveal direction="right">
          <Typography
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 600,
              lineHeight: 1.3,
              maxWidth: 340,
              mb: "40px",
            }}
          >
            Affordable furniture for every home
          </Typography>
        </Reveal>

        <Box sx={{ maxWidth: 360 }}>
          <Reveal direction="right" delay={150}>
            <Typography
              sx={{
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--c-222222)",
                mb: "6px",
              }}
            >
              Ultrices porttitor lacus sed condimentum nulla viverra. Maecenas
              sed nisi imperdiet sed lorem sed quis sagittis in. Auctor augue ut
              nec a quisque libero imperdiet velit ut.
            </Typography>
          </Reveal>
          <Reveal direction="right" delay={280}>
            <Typography
              sx={{ fontSize: 12, lineHeight: 1.7, color: "var(--c-222222)" }}
            >
              Tellus dui pharetra ut pellentesque posuere ut amet. Curabitur
              lectus viverra in sit tortor. Magnis tristique tristique blandit
              nunc tincidunt et duis adipiscing ac. Nulla dictum semper commodo
            </Typography>
          </Reveal>
        </Box>
      </Box>
    </Box>
  );
}

