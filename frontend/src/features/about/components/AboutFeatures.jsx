import { Box, Typography } from "@mui/material";
import { IMAGES } from "../aboutData";
import { GAP, GREY_BG, SIDE, zoomOnHover } from "../../../styles/aboutStyles";
import { BrownButton, Photo, Reveal } from "./AboutPrimitives";

function TextCard({ bg, title, text, button }) {
  return (
    <Box
      sx={{
        bgcolor: bg,
        p: { xs: 3, md: "26px 22px" },
        aspectRatio: { md: "342 / 273" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        transition: "box-shadow .4s ease",
        "&:hover": { boxShadow: "0 14px 30px rgba(0,0,0,.08)" },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 20, md: 40 },
          fontWeight: 600,
          lineHeight: 1.4,
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          lineHeight: "14px",
          color: "var(--c-666666)",
          mb: 3,
        }}
      >
        {text}
      </Typography>

      <Box>
        <BrownButton sx={{ minWidth: 103, height: 25 }}>{button}</BrownButton>
      </Box>
    </Box>
  );
}

export default function Features() {
  const photoStyle = {
    aspectRatio: { xs: "4 / 5", md: "342 / 430" },
    ...zoomOnHover,
  };

  return (
    <Box sx={{ px: SIDE, pt: 3, pb: 8 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: GAP,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <Reveal direction="left">
            <Box sx={photoStyle}>
              <Photo img={IMAGES.featureLeft} alt="Living room furniture" />
            </Box>
          </Reveal>

          <Reveal direction="left" delay={150}>
            <TextCard
              bg={GREY_BG}
              title={
                <>
                  Furniture That Will Last
                  <br />A Lifetime
                </>
              }
              text="Tellus dui pharetra ut pellentesque posuere ut amet. Curabitur lectus viverra in sit tortor. Magnis tristique blandit nunc tincidunt et duis adipiscing ac."
              button="Learn more"
            />
          </Reveal>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <Reveal direction="right" delay={100}>
            <TextCard
              bg="var(--c-f8f8f8)"
              title={
                <>
                  Live Comfortably
                  <br />
                  Inside Your Home
                </>
              }
              text="Ullamcorper sit lacus sed risus congue integer amet erat risus. Euismod lacus lectus a dignissim velit. Facilisi lorem vitae purus habitant ac neque scelerisque adipiscing."
              button="Shop now"
            />
          </Reveal>

          <Reveal direction="right" delay={250}>
            <Box sx={photoStyle}>
              <Photo img={IMAGES.featureRight} alt="Comfortable sofa" />
            </Box>
          </Reveal>
        </Box>
      </Box>
    </Box>
  );
}
