import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HighlightCard from "../components/about/HighlightCard";
import aboutImage from "../assets/aboutus-bg.jpg";
import livingRoomImage from "../assets/banner.jpg";

const highlights = [
  {
    title: "Quality furniture",
    text: "We choose durable materials and thoughtful designs for everyday use.",
  },
  {
    title: "Made for your home",
    text: "Find comfortable pieces that make your space feel warm and personal.",
  },
  {
    title: "Helpful service",
    text: "Our team is here to help you choose furniture that fits your needs.",
  },
];

export default function AboutUs() {
  return (
    <Box>
      <Navbar />

      <Box
        component="section"
        sx={{
          minHeight: { xs: 320, md: 440 },
          display: "flex",
          alignItems: "center",
          color: "#fff",
          backgroundImage: `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.4)), url(${aboutImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <Container maxWidth="lg">
          <Typography component="h1" sx={{ fontSize: { xs: 36, md: 52 }, fontWeight: 700 }}>
            About our store
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 560, lineHeight: 1.8 }}>
            We help make your home comfortable with furniture that looks good
            and works well in everyday life.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Box
          component="section"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 5,
            alignItems: "center",
          }}
        >
          <Box>
            <Typography component="h2" sx={{ fontSize: 30, fontWeight: 600 }}>
              Furniture for real homes
            </Typography>
            <Typography sx={{ mt: 2, color: "text.secondary", lineHeight: 1.8 }}>
              Our store brings together useful, comfortable, and welcoming
              furniture for every room. We believe a well-designed home should
              feel good to live in every day.
            </Typography>
            <Button
              component={Link}
              to="/Shop"
              variant="contained"
              sx={{ mt: 3, bgcolor: "#947458", borderRadius: 0 }}
            >
              Explore our furniture
            </Button>
          </Box>

          <Box
            component="img"
            src={livingRoomImage}
            alt="Comfortable living room with furniture"
            sx={{ width: "100%", display: "block", objectFit: "cover" }}
          />
        </Box>

        <Box component="section" sx={{ mt: { xs: 7, md: 10 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: 30, fontWeight: 600, textAlign: "center", mb: 4 }}
          >
            What matters to us
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {highlights.map((item) => (
              <HighlightCard
                key={item.title}
                title={item.title}
                text={item.text}
              />
            ))}
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
