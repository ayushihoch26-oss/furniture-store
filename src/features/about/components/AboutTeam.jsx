import { Box, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import { TEAM } from "../aboutData";
import { BROWN, EASE, GAP, GREY_BG, SIDE, heading, stagger } from "../../../styles/aboutStyles";
import { Reveal } from "./AboutPrimitives";

export default function Team() {
  return (
    <Box sx={{ px: SIDE, pt: 4, pb: 5 }}>
      <Reveal>
        <Typography sx={{ ...heading, textAlign: "center", mb: 3 }}>
          Our Team
        </Typography>
      </Reveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: GAP,
        }}
      >
        {TEAM.map((member, index) => (
          <Reveal key={member.name} delay={stagger(index, 150)}>
            <Box
              sx={{
                textAlign: "center",
                cursor: "pointer",
                "&:hover .fs-person": {
                  transform: "translateY(-10px) scale(1.05)",
                  color: BROWN,
                },
                "&:hover .fs-member": { color: BROWN },
              }}
            >
              <Box
                sx={{
                  bgcolor: GREY_BG,
                  aspectRatio: "223 / 252",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Person
                  className="fs-person"
                  sx={{
                    fontSize: { xs: 240, md: 270 },
                    color: "#ccc",
                    mb: "-14px",
                    transition: `transform .5s ${EASE}, color .3s ease`,
                  }}
                />
              </Box>

              <Typography
                className="fs-member"
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mt: 1,
                  transition: "color .25s ease",
                }}
              >
                {member.name}
              </Typography>

              <Typography sx={{ fontSize: 11, color: "var(--c-8a8a8a)" }}>
                {member.role}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}
