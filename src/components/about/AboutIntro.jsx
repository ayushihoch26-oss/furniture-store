import { Box, Typography } from "@mui/material";
import { BROWN } from "../../styles/aboutStyles";
import { Reveal } from "./AboutPrimitives";

export default function Intro() {
  const text = {
    fontSize: { xs: 13, md: 14 },
    lineHeight: { xs: "19px", md: "20px" },
    color: "var(--c-111111)",
  };

  return (
    <Box
      sx={{
        bgcolor: "var(--c-ffffff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: "40px", md: "60px", lg: "80px" },
        px: { xs: 2, sm: 4 },
        py: { xs: "56px", md: "80px", lg: "120px" },
      }}
    >
      <Reveal sx={{ width: "100%", maxWidth: 720 }}>
        <Typography
          component="h1"
          sx={{
            width: "100%",
            textAlign: "center",
            fontSize: { xs: 24, sm: 30, md: 36, lg: 40 },
            fontWeight: 700,
            lineHeight: 1.25,
            color: "var(--c-111111)",
          }}
        >
          Lectus morbi eget justo tellus facilisi orci venenatis aliquet.
          Egestas rutrum volutpat pretium curabitur scelerisque.
        </Typography>
      </Reveal>

      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          columnGap: "40px",
          rowGap: "16px",
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Reveal delay={100}>
            <Typography sx={text}>
              Mi tristique est nunc sapien orci tortor ac. Suspendisse leo et
              cursus pharetra tellus tincidunt. Risus nulla penatibus donec
              elementum nulla. Pellentesque ipsum consequat velit blandit vel
              ornare augue magna.
            </Typography>
          </Reveal>

          <Reveal delay={200}>
            <Typography sx={text}>
              Suspendisse leo et cursus pharetra tellus tincidunt. Risus nulla
              penatibus donec elementum nulla. Pellentesque ipsum consequat
              velit blandit vel ornare augue magna.
            </Typography>
          </Reveal>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Reveal delay={250}>
            <Typography sx={text}>
              Suspendisse leo et cursus pharetra tellus tincidunt. Risus nulla
              penatibus donec elementum nulla.
            </Typography>
          </Reveal>

          <Reveal delay={350}>
            <Typography sx={text}>
              Est nulla tincidunt commodo massa. Nunc interdum cras id augue.
              Tortor cras pharetra ac dignissim hendrerit fames fermentum.
            </Typography>
          </Reveal>

          <Reveal delay={450}>
            <Typography
              sx={{
                display: "inline-block",
                position: "relative",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.4px",
                color: "var(--c-111111)",
                cursor: "pointer",
                mt: "4px",
                transition: "color .25s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: -2,
                  height: "1px",
                  width: "100%",
                  bgcolor: BROWN,
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform .3s ease",
                },
                "&:hover": { color: BROWN },
                "&:hover::after": { transform: "scaleX(1)" },
              }}
            >
              READ MORE
            </Typography>
          </Reveal>
        </Box>
      </Box>
    </Box>
  );
}
