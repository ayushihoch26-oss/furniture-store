import { Box, GlobalStyles } from "@mui/material";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ANIMATION_STYLES } from "../../styles/aboutStyles";
import AboutHero from "../../components/about/AboutHero";
import AboutIntro from "../../components/about/AboutIntro";
import AboutBanner from "../../components/about/AboutBanner";
import AboutStats from "../../components/about/AboutStats";
import AboutFeatures from "../../components/about/AboutFeatures";
import AboutTeam from "../../components/about/AboutTeam";
import AboutVideo from "../../components/about/AboutVideo";
import AboutCollections from "../../components/about/AboutCollections";
import AboutInstagram from "../../components/about/AboutInstagram";

export default function AboutUs() {
  return (
    <Box
      className="fs-about"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        overflowX: "clip",
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />
      <AboutHero />
      <AboutIntro />
      <AboutBanner />
      <AboutStats />
      <AboutFeatures />
      <AboutTeam />
      <AboutVideo />
      <AboutCollections />
      <AboutInstagram />
      <Footer />
    </Box>
  );
}
