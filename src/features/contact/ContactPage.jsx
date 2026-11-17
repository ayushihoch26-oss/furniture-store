import { Box, GlobalStyles } from "@mui/material";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import ContactHero from "../../components/contact/ContactHero";
import ContactCard from "../../components/contact/ContactCard";
import ContactMap from "../../components/contact/ContactMap";
import { ANIMATION_STYLES } from "../../styles/contactStyles";

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
