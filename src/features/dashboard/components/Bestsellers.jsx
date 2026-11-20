import { Box, Skeleton, Typography } from "@mui/material";
import { money, stagger } from "../utils/dashboardUtils";
import { EASE, SECTION_PY, SIDE, zoomOnHover } from "../dashboardStyles";
import { useProducts } from "../hooks/useDashboardData";
import { ColorDots } from "../../../components/common/ColorDots";
import { Img } from "./Img";
import { Reveal } from "../../../components/common/Reveal";
import { SectionHeader } from "./SectionHeader";

// ---------- Bestsellers ----------
export function Bestsellers() {
  const { items, loading, error } = useProducts({ sort: "latest", limit: 8 });

  if (!loading && items.length === 0 && !error) return null;

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <SectionHeader title="Bestsellers" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          columnGap: { xs: 2, md: "17px" },
          rowGap: { xs: 4, md: "30px" },
        }}
      >
        {loading &&
          Array.from({ length: 8 }, (_, index) => (
            <Box key={index}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "416 / 555",
                  mb: "14px",
                }}
              />
              <Skeleton width="60%" sx={{ mx: "auto" }} />
            </Box>
          ))}

        {!loading && error && (
          <Typography
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--c-777777)",
              py: 6,
            }}
          >
            {error}
          </Typography>
        )}

        {!loading &&
          items.map((product, index) => (
            <Reveal key={product.id} delay={stagger(index % 4, 110)}>
              <Box
                sx={{
                  textAlign: "center",
                  transition: `transform .4s ${EASE}`,
                  "&:hover": { transform: "translateY(-8px)" },
                  "&:hover .fs-card-frame": {
                    boxShadow: "0 16px 32px rgba(0,0,0,.12)",
                  },
                }}
              >
                <Box
                  className="fs-card-frame"
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "416 / 555",
                    bgcolor: "var(--c-f4f2f0)",
                    overflow: "hidden",
                    mb: "14px",
                    transition: "box-shadow .4s ease",
                    ...zoomOnHover,
                  }}
                >
                  <Box sx={{ position: "absolute", inset: 0 }}>
                    <Img src={product.img} alt={product.name} />
                  </Box>

                  {product.badge && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        px: "10px",
                        py: "3px",
                        fontSize: 11,
                        lineHeight: 1.5,
                        color: "#fff",
                        bgcolor:
                          product.badge === "SALE" ? "#FF5252" : "#1a1a1a",
                      }}
                    >
                      {product.badge}
                    </Box>
                  )}
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                  }}
                >
                  {product.name}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "var(--c-555555)",
                    lineHeight: 1.6,
                  }}
                >
                  {product.salePrice ? (
                    <>
                      <s>${money(product.oldPrice)}</s>{" "}
                      <b style={{ color: "var(--c-111111)", fontWeight: 500 }}>
                        ${money(product.salePrice)}
                      </b>
                    </>
                  ) : (
                    `$${money(product.price)}`
                  )}
                </Typography>

                <ColorDots sx={{ justifyContent: "center", mt: "4px" }} />
              </Box>
            </Reveal>
          ))}
      </Box>
    </Box>
  );
}

