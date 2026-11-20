import { Box, GlobalStyles } from "@mui/material";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import ContactHero from "../components/ContactHero";
import ContactCard from "../components/ContactCard";
import ContactMap from "../components/ContactMap";
import { ANIMATION_STYLES } from "../contactStyles";

export default function ContactPage() {
  return (
    <Box
      className="fs-contact"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        overflowX: "clip",
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />
      <Navbar />
      <ContactHero />
      <ContactCard />
      <ContactMap />
      <Footer />
    </Box>
  );
}
