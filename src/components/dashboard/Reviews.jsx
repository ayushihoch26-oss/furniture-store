import { Person, Star } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { U, ROOM } from "../../assets/furnitureImages";
import { H2 } from "../../styles/dashboardStyles";
import { useInView } from "../../hooks/useInView";
import { Reveal } from "./Reveal";

// ---------- Reviews ----------
export function Reviews() {
  // Stars pop in one after another when the section scrolls into view
  const [starsRef, starsSeen] = useInView();

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: { xs: "auto", md: 520, lg: 562, xl: 640 },
        bgcolor: "var(--c-f4f2f0)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          pl: { xs: 2, md: "20%" },
          pr: { xs: 2, md: "14%" },
          py: { xs: 5, md: 0 },
        }}
      >
        <Reveal>
          <Typography
            sx={{ ...H2, fontSize: { xs: 26, md: 28, xl: 32 }, mb: "28px" }}
          >
            Customer Reviews
          </Typography>
        </Reveal>

        <Box ref={starsRef} sx={{ display: "flex", gap: "2px", mb: "20px" }}>
          {[1, 2, 3, 4, 5].map((star, i) => (
            <Star
              key={star}
              sx={{
                fontSize: 20,
                color: "#FFC107",
                opacity: starsSeen ? 1 : 0,
                transform: starsSeen
                  ? "scale(1) rotate(0deg)"
                  : "scale(0) rotate(-120deg)",
                transition: `opacity .4s ease ${i * 120}ms, transform .5s cubic-bezier(.3,1.6,.5,1) ${i * 120}ms`,
              }}
            />
          ))}
        </Box>

        <Reveal delay={150}>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: "24px",
              color: "var(--c-111111)",
              mb: "12px",
            }}
          >
            Ultrices porttitor lacus sed condimentum nulla viverra. Maecenas sed
            nisi imperdiet sed lorem sed quis sagittis in. Auctor augue ut nec a
            quisque libero imperdiet velit ut.
          </Typography>
        </Reveal>

        <Reveal delay={260}>
          <Typography
            sx={{ fontSize: 14, lineHeight: "24px", color: "var(--c-111111)" }}
          >
            Ullamcorper sit lacus sed risus congue integer amet erat risus.
            Euismod lacus lectus a dignissim velit. Facilisi lorem vitae purus
            habitant ac neque...
          </Typography>
        </Reveal>

        <Reveal delay={380}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              mt: "28px",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "var(--c-e4e4e4)",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                transition: "transform .3s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              <Person sx={{ fontSize: 44, color: "#B8B8B8", mb: "-4px" }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--c-111111)",
                  lineHeight: 1.4,
                }}
              >
                Devon Simpson
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "var(--c-8a8a8a)", lineHeight: 1.4 }}
              >
                Customer
              </Typography>
            </Box>
          </Box>
        </Reveal>
      </Box>

      <Reveal
        direction="right"
        sx={{ display: "flex", minHeight: { xs: 300, md: "100%" } }}
      >
        <Box
          sx={{
            flex: 1,
            background: `url(${U(ROOM.interior, 900, 800)}) center/cover`,
          }}
        />
      </Reveal>
    </Box>
  );
}

