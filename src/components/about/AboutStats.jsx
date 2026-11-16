import { Box, Typography } from "@mui/material";
import { STATS } from "../../features/about/aboutData";
import { BROWN, SIDE, stagger } from "../../styles/aboutStyles";
import { CountUp, Reveal } from "./AboutPrimitives";

export default function Stats() {
  return (
    <Box
      sx={{
        px: SIDE,
        py: 6,
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 4,
        textAlign: "center",
      }}
    >
      {STATS.map(({ icon: Icon, value, label }, index) => (
        <Reveal key={label} delay={stagger(index, 120)}>
          <Box
            sx={{
              "&:hover .fs-stat-icon": {
                color: BROWN,
                transform: "translateY(-6px) scale(1.15)",
              },
            }}
          >
            <Icon
              className="fs-stat-icon"
              sx={{
                fontSize: 36,
                color: "var(--c-6b6b6b)",
                transition:
                  "transform .35s cubic-bezier(.3,1.6,.5,1), color .25s ease",
              }}
            />

            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <CountUp value={value} />
            </Typography>

            <Typography sx={{ fontSize: 9.5, color: "var(--c-555555)" }}>
              {label}
            </Typography>
          </Box>
        </Reveal>
      ))}
    </Box>
  );
}
