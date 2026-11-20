import { Box } from "@mui/material";
import { FEATURE_ICONS } from "../dashboardData";
import { SIDE } from "../dashboardStyles";
import { Reveal } from "../../../components/common/Reveal";

// ---------- Feature logos ----------
export function Features({ darkMode = false }) {
  return (
    <Box
      sx={{
        px: SIDE,
        minHeight: 150,
        py: { xs: 4, md: 0 },
        display: "flex",
        flexWrap: { xs: "wrap", md: "nowrap" },
        justifyContent: "space-around",
        alignItems: "center",
        gap: { xs: 3, md: 0 },
        bgcolor: darkMode ? "#16120F" : "var(--c-ffffff)",
      }}
    >
      {FEATURE_ICONS.map((src, index) => (
        <Reveal key={index} direction="zoom" delay={index * 130}>
          <Box
            component="img"
            src={src}
            alt=""
            sx={{
              display: "block",
              width: 64,
              height: 64,
              objectFit: "contain",
              transition: "transform .35s cubic-bezier(.3,1.6,.5,1)",
              "&:hover": { transform: "translateY(-6px) scale(1.12)" },
            }}
          />
        </Reveal>
      ))}
    </Box>
  );
}

