import { Box, GlobalStyles } from "@mui/material";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import { ANIMATION_STYLES } from "../aboutStyles";
import AboutHero from "../components/AboutHero";
import AboutIntro from "../components/AboutIntro";
import AboutBanner from "../components/AboutBanner";
import AboutStats from "../components/AboutStats";
import AboutFeatures from "../components/AboutFeatures";
import AboutTeam from "../components/AboutTeam";
import AboutVideo from "../components/AboutVideo";
import AboutCollections from "../components/AboutCollections";
import AboutInstagram from "../components/AboutInstagram";

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
