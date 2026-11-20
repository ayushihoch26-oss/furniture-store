import { useNavigate } from "react-router-dom";
import { ArrowForward } from "@mui/icons-material";
import { Box, Skeleton, Typography } from "@mui/material";
import { categoryLook, MAX_CATEGORY_CARDS } from "../dashboardData";
import { stagger } from "../utils/dashboardUtils";
import { BROWN, SECTION_PY, SIDE, zoomOnHover } from "../dashboardStyles";
import { useCategories } from "../hooks/useDashboardData";
import { Reveal } from "../../../components/common/Reveal";
import { SectionHeader } from "./SectionHeader";

// ---------- Categories ----------
export function Categories() {
  const navigate = useNavigate();
  const categories = useCategories();

  if (categories && categories.length === 0) return null;

  const cards = categories
    ? categories.slice(0, MAX_CATEGORY_CARDS).map((item, index) => ({
      ...item,
      ...categoryLook(item.name, index),
    }))
    : [];

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <SectionHeader title="Shop by Categories" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: { xs: 2, md: "17px" },
        }}
      >
        {categories === null &&
          Array.from({ length: MAX_CATEGORY_CARDS }, (_, index) => (
            <Box key={index}>
              <Skeleton
                variant="rectangular"
                sx={{ aspectRatio: "1", height: "auto", mb: "14px" }}
              />
              <Skeleton width="50%" />
            </Box>
          ))}

        {cards.map((item, index) => (
          <Reveal key={item.name} delay={stagger(index, 120)}>
            <Box
              onClick={() =>
                navigate(`/Shop?categories=${encodeURIComponent(item.name)}`)
              }
              sx={{
                cursor: "pointer",
                "&:hover .fs-cat-name": { color: BROWN },
                "&:hover .fs-cat-arrow": {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "1",
                  background: item.bg,
                  mb: "14px",
                  overflow: "hidden",
                  ...zoomOnHover,
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Typography
                  className="fs-cat-name"
                  sx={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                    transition: "color .25s ease",
                  }}
                >
                  {item.name}
                </Typography>
                <ArrowForward
                  className="fs-cat-arrow"
                  sx={{
                    fontSize: 16,
                    color: BROWN,
                    opacity: 0,
                    transform: "translateX(-8px)",
                    transition: "opacity .25s ease, transform .25s ease",
                  }}
                />
              </Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--c-777777)", lineHeight: 1.5 }}
              >
                {item.count} {item.count === 1 ? "product" : "products"}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

