import { useState } from "react";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Box, IconButton, Skeleton, Typography } from "@mui/material";
import { toggleWishlist } from "../../service/wishlist.service";
import { MAX_TABS } from "../../features/dashboard/dashboardData";
import { anim, money, stagger } from "../../utils/dashboardUtils";
import { BROWN, H2, SECTION_PY, SIDE, zoomOnHover } from "../../styles/dashboardStyles";
import { useCategories, useProducts, useWishedIds } from "../../hooks/dashboard/useDashboardData";
import { ColorDots } from "./ColorDots";
import { Img } from "./Img";
import { Reveal } from "./Reveal";

// ---------- New products ----------
export function NewProducts() {
  const [tab, setTab] = useState("All");
  const wishedIds = useWishedIds();

  const categories = useCategories();
  const tabs = [
    "All",
    ...(categories || []).slice(0, MAX_TABS).map((c) => c.name),
  ];

  // Newest products of the selected category (3 cards, same as the design)
  const { items, loading, error } = useProducts({
    sort: "latest",
    limit: 3,
    categories: tab === "All" ? "" : tab,
  });

  return (
    <Box sx={{ bgcolor: "var(--c-f8f9fb)", px: SIDE, py: SECTION_PY }}>
      <Reveal>
        <Typography sx={{ ...H2, textAlign: "center" }}>
          New Products
        </Typography>
      </Reveal>

      <Reveal delay={120}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: { xs: 2.5, md: "44px" },
            mt: "24px",
            mb: { xs: 3, md: "44px" },
          }}
        >
          {tabs.map((item) => (
            <Typography
              key={item}
              onClick={() => setTab(item)}
              sx={{
                cursor: "pointer",
                fontSize: 16,
                color: tab === item ? BROWN : "var(--c-111111)",
                pb: "3px",
                borderBottom:
                  tab === item ? `2px solid ${BROWN}` : "2px solid transparent",
                transition: "color .25s ease, border-color .25s ease",
                "&:hover": { color: BROWN },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Reveal>

      {/* key={tab}: the cards animate in again every time the tab changes */}
      <Box
        key={tab}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: { xs: 2, md: "17px" },
        }}
      >
        {loading &&
          Array.from({ length: 3 }, (_, index) => (
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
              <Skeleton width="60%" />
            </Box>
          ))}

        {!loading && items.length === 0 && (
          <Typography
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--c-777777)",
              py: 6,
              animation: anim("fs-fadeUp", 0, 500),
            }}
          >
            {error || "No products in this category yet."}
          </Typography>
        )}

        {!loading &&
          items.map((product, index) => {
            const liked = wishedIds.includes(String(product.id));

            return (
              <Reveal key={product.id} delay={stagger(index, 120)}>
                <Box
                  sx={{
                    "&:hover .fs-card-frame": {
                      boxShadow: "0 14px 30px rgba(0,0,0,.1)",
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
                    <IconButton
                      size="small"
                      aria-label={
                        liked ? "Remove from wishlist" : "Add to wishlist"
                      }
                      onClick={() => toggleWishlist(product)}
                      sx={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        color: liked ? "#FF5252" : "var(--c-333333)",
                      }}
                    >
                      {liked ? (
                        <Favorite
                          sx={{
                            fontSize: 17,
                            animation: "fs-heartPop .45s ease both",
                          }}
                        />
                      ) : (
                        <FavoriteBorder sx={{ fontSize: 17 }} />
                      )}
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--c-111111)",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <ColorDots />
                  </Box>

                  <Typography
                    sx={{ fontSize: 13, color: "var(--c-111111)", mt: "4px" }}
                  >
                    ${money(product.price)}
                  </Typography>
                </Box>
              </Reveal>
            );
          })}
      </Box>
    </Box>
  );
}

