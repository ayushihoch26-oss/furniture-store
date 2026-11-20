import { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { FavoriteBorder, Favorite } from "@mui/icons-material";
import { BROWN, GRAY_BG, SIDE, SECTION_PY, SERVICES } from "../../features/shop/shopConstants";
import { getWishlist, toggleWishlist } from "../ProductModal";
import { ColorDots, ProductImage, SectionHeader } from "./ShopShared";
import { Reveal } from "./ShopMotion";
import { stagger } from "../../features/shop/shopMotionStyles";

export function Services() {
  return (
    <Box sx={{ bgcolor: "var(--c-f8f8f8)", px: SIDE }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 3, md: 2 },
          minHeight: { xs: "auto", md: 130, lg: 187 },
          py: { xs: 4, md: 0 },
        }}
      >
        {SERVICES.map(({ Icon, title, text }, index) => (
          <Reveal key={title} delay={stagger(index, 150)}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: "14px", lg: "20px" },
                "&:hover .fs-service-icon": {
                  color: BROWN,
                  transform: "translateY(-6px) scale(1.12)",
                },
              }}
            >
              <Icon
                className="fs-service-icon"
                sx={{
                  fontSize: { xs: 38, md: 42, lg: 56 },
                  color: "var(--c-111111)",
                  flexShrink: 0,
                  transition:
                    "transform .35s cubic-bezier(.3,1.6,.5,1), color .25s ease",
                }}
              />
              <Box sx={{ maxWidth: { xs: 260, lg: 300 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: 15, md: 16, lg: 20 },
                    fontWeight: 600,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 11, md: 12, lg: 14 },
                    color: "var(--c-777777)",
                    lineHeight: 1.6,
                  }}
                >
                  {text}
                </Typography>
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Featured products
// ---------------------------------------------------------------------------
export function Featured({ products, onDetail }) {
  const [wishListIds, setWishListIds] = useState(() => {
    return getWishlist().map((item) => String(item.id));
  });

  const saleOrNew = products.filter((product) => {
    return product.isSale || product.isNew;
  });
  const saleOrNewIds = saleOrNew.map((product) => product.id);
  const normalProducts = products.filter((product) => {
    return !saleOrNewIds.includes(product.id);
  });
  const featuredProducts = [...saleOrNew, ...normalProducts].slice(0, 3);

  function handleWishlistToggle(event, product) {
    event.stopPropagation();
    toggleWishlist(product);
    setWishListIds(getWishlist().map((item) => String(item.id)));
  }

  if (featuredProducts.length === 0) return null;

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <SectionHeader title="Featured Products" />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: { xs: 3, md: "16px", lg: "24px" },
        }}
      >
        {featuredProducts.map((product, index) => {
          const isWished = wishListIds.includes(String(product.id));

          return (
            <Reveal key={product.id} delay={stagger(index, 150)}>
              <Box
                sx={{
                  "&:hover .fs-feat-frame": {
                    boxShadow: "0 16px 32px rgba(0,0,0,.12)",
                  },
                  "&:hover .fs-feat-frame img": {
                    transform: "scale(1.07)",
                  },
                  "&:hover .fs-feat-name": { color: BROWN },
                }}
              >
                <Box
                  className="fs-feat-frame"
                  onClick={() => onDetail(product)}
                  sx={{
                    position: "relative",
                    bgcolor: GRAY_BG,
                    aspectRatio: "1 / 1.15",
                    mb: { xs: "14px", lg: "18px" },
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow .4s ease",
                  }}
                >
                  <ProductImage
                    src={product.img}
                    alt={product.name}
                    pad={{ xs: "12px", md: "20px", lg: "20px" }}
                    fit="contain"
                  />

                  <IconButton
                    size="small"
                    aria-label="Add to wishlist"
                    onClick={(event) => handleWishlistToggle(event, product)}
                    sx={{
                      position: "absolute",
                      right: { xs: 10, lg: 14 },
                      bottom: { xs: 10, lg: 14 },
                      width: { xs: 32, lg: 44 },
                      height: { xs: 32, lg: 44 },
                      bgcolor: "var(--c-ffffff)",
                      color: isWished ? "#FF5252" : "var(--c-333333)",
                      transition: "transform .25s ease",
                      "&:hover": {
                        bgcolor: "var(--c-ffffff)",
                        transform: "scale(1.12)",
                      },
                    }}
                  >
                    {isWished ? (
                      <Favorite
                        sx={{
                          fontSize: { xs: 17, lg: 22 },
                          animation: "fs-heartPop .45s ease both",
                        }}
                      />
                    ) : (
                      <FavoriteBorder sx={{ fontSize: { xs: 17, lg: 22 } }} />
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
                    className="fs-feat-name"
                    sx={{
                      fontSize: { xs: 15, md: 17, lg: 22 },
                      fontWeight: 700,
                      color: "var(--c-111111)",
                      transition: "color .25s ease",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <ColorDots />
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: 13, md: 14, lg: 16 },
                    color: "var(--c-111111)",
                    mt: "6px",
                  }}
                >
                  ${product.price}{" "}
                  {product.oldPrice && (
                    <s style={{ color: "var(--c-888888)", marginLeft: 6 }}>
                      ${product.oldPrice}
                    </s>
                  )}
                </Typography>
              </Box>
            </Reveal>
          );
        })}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
