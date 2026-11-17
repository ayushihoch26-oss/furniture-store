import { Box, GlobalStyles } from "@mui/material";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { ANIMATION_STYLES } from "../../styles/dashboardStyles";
import { Hero } from "../../components/dashboard/Hero";
import { Categories } from "../../components/dashboard/Categories";
import { NewProducts } from "../../components/dashboard/NewProducts";
import { Rooms } from "../../components/dashboard/Rooms";
import { VideoBanner } from "../../components/dashboard/VideoBanner";
import { Bestsellers } from "../../components/dashboard/Bestsellers";
import { Reviews } from "../../components/dashboard/Reviews";
import { Features } from "../../components/dashboard/Features";

function PageSection({ children, order, desktopOrder }) {
  const sectionOrder =
    desktopOrder === undefined
      ? order
      : { xs: order, xl: desktopOrder };

  return <Box sx={{ order: sectionOrder }}>{children}</Box>;
}

export default function DashboardPage() {
  return (
    <Box
      className="fs-home"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden", // slide-in animations never cause a horizontal scrollbar
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />
      <Hero />

      <PageSection order={1} desktopOrder={3}>
        <Categories />
      </PageSection>
      <PageSection order={2} desktopOrder={1}>
        <NewProducts />
      </PageSection>
      <PageSection order={3} desktopOrder={2}>
        <Rooms />
      </PageSection>

      <PageSection order={4}>
        <VideoBanner />
      </PageSection>
      <PageSection order={5}>
        <Bestsellers />
      </PageSection>
      <PageSection order={6}>
        <Reviews />
      </PageSection>
      <PageSection order={7}>
        <Features />
      </PageSection>
      <PageSection order={8}>
        <Footer />
      </PageSection>
    </Box>
  );
}
