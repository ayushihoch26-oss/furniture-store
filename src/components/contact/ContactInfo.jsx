import { Box, Typography } from "@mui/material";
import { CONTACT_INFO } from "../../features/contact/contactData";
import { BROWN } from "../../styles/contactStyles";
import Reveal from "./ContactReveal";

export default function ContactInfo() {
  return (
    <Box sx={{ pt: { xs: 0, lg: "27px" }, minWidth: 0 }}>
      <Reveal direction="left">
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 34, md: 44, lg: 52 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: 1.2,
            mb: "6px",
          }}
        >
          Contact Us
        </Typography>
      </Reveal>

      <Reveal direction="left" delay={120}>
        <Typography
          sx={{
            fontSize: { xs: 14, lg: 16 },
            lineHeight: { xs: "24px", lg: "28px" },
            color: "var(--c-111111)",
            maxWidth: 560,
          }}
        >
          Suspendisse leo et cursus pharetra tellus tincidunt. Risus nulla
          penatibus donec elementum nulla
        </Typography>
      </Reveal>

      <Box sx={{ mt: { xs: "36px", md: "48px", lg: "68px" } }}>
        {CONTACT_INFO.map((contact, index) => {
          const Icon = contact.Icon;

          return (
            <Reveal
              key={contact.label}
              direction="left"
              delay={250 + index * 150}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "34px 1fr", lg: "44px 1fr" },
                  alignItems: "center",
                  mb: { xs: "22px", lg: "28px" },
                  cursor: "default",
                  "&:hover .fs-info-icon": {
                    color: BROWN,
                    transform: "translateY(-4px) scale(1.2)",
                  },
                  "&:hover .fs-info-value": { color: BROWN },
                }}
              >
                <Icon
                  className="fs-info-icon"
                  sx={{
                    fontSize: { xs: 22, lg: 26 },
                    color: "var(--c-8a8a8a)",
                    transition:
                      "transform .35s cubic-bezier(.3,1.6,.5,1), color .25s ease",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: { xs: 18, md: 20, lg: 24 },
                    fontWeight: 500,
                    color: "var(--c-8a8a8a)",
                    lineHeight: "32px",
                  }}
                >
                  {contact.label}
                </Typography>

                <Typography
                  className="fs-info-value"
                  sx={{
                    gridColumn: 2,
                    mt: "16px",
                    maxWidth: 380,
                    fontSize: { xs: 20, md: 24, lg: 28 },
                    fontWeight: 600,
                    color: "var(--c-111111)",
                    lineHeight: { xs: "28px", lg: "36px" },
                    wordBreak: "break-word",
                    transition: "color .25s ease",
                  }}
                >
                  {contact.value}
                </Typography>
              </Box>
            </Reveal>
          );
        })}
      </Box>
    </Box>
  );
}
