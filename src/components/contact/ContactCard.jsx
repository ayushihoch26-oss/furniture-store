import { Box } from "@mui/material";
import { HERO_OVERLAP, SIDE } from "../../styles/contactStyles";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";
import Reveal from "./ContactReveal";

export default function ContactCard() {
  return (
    <Box sx={{ position: "relative", px: SIDE, mt: HERO_OVERLAP }}>
      <Reveal delay={150}>
        <Box
          sx={{
            bgcolor: "var(--c-f4f2f0)",
            p: { xs: 2.5, sm: 4, md: "40px", lg: "60px" },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "596fr 580fr" },
            columnGap: { md: "24px", lg: 0 },
            rowGap: { xs: 4, md: 0 },
            alignItems: "start",
          }}
        >
          <ContactInfo />
          <ContactForm />
        </Box>
      </Reveal>
    </Box>
  );
}
