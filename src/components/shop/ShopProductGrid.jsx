import { useState } from "react";
import { Box, Typography, Button, ButtonBase, Skeleton } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { BROWN, GRAY_BG, BADGE_COLORS, PAGE_SIZE } from "../../features/shop/shopConstants";
import { EASE } from "../../features/shop/shopMotionStyles";
import { onImgError } from "../../assets/furnitureImages";
import { ColorDots } from "./ShopShared";

export function ProductCard({ product, onDetail }) {
  const [active, setActive] = useState(false);

  function handlePointerEnter(event) {
    if (event.pointerType === "mouse") setActive(true);
  }

  function handlePointerLeave(event) {
    if (event.pointerType === "mouse") setActive(false);
  }

  function handleImageClick(event) {
    const type = event.nativeEvent.pointerType;
    if (type === "touch" || type === "pen") {
      setActive((previous) => !previous);
    }
  }

  function handleDetailClick(event) {
    event.stopPropagation();
    onDetail(product);
  }

  return (
    <Box
      sx={{
        textAlign: "center",
        "&:hover .fs-card-name": { color: BROWN },
        "&:hover .fs-card-frame": {
          boxShadow: "0 14px 28px rgba(0,0,0,.1)",
        },
      }}
    >
      <Box
        className="fs-card-frame"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleImageClick}
        sx={{
          position: "relative",
          bgcolor: GRAY_BG,
          width: "100%",
          aspectRatio: "306 / 350",
          mb: { xs: "12px", lg: "20px" },
          overflow: "hidden",
          cursor: "pointer",
          transition: "box-shadow .4s ease",
        }}
      >
        <Box
          component="img"
          src={product.img}
          alt={product.name}
          onError={onImgError}
          loading="lazy"
          decoding="async"
          sx={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            p: { xs: "12px", md: "18px", lg: "24px" },
            boxSizing: "border-box",
            opacity: product.soldOut ? 0.55 : 1,
            transform: active ? "scale(1.04)" : "none",
            filter: active ? "blur(3px)" : "none",
            transition: "transform 0.3s ease, filter 0.3s ease",
          }}
        />

        {product.badge && (
          <Box
            sx={{
              position: "absolute",
              top: { xs: 10, lg: 22 },
              left: { xs: 10, lg: 22 },
              px: { xs: "10px", lg: "14px" },
              py: { xs: "3px", lg: "5px" },
              fontSize: { xs: 11, lg: 15 },
              lineHeight: 1.5,
              color: "#fff",
              bgcolor: BADGE_COLORS[product.badge] || "#1a1a1a",
              zIndex: 1,
              animation: `fs-popIn .5s ${EASE} .3s both`,
            }}
          >
            {product.badge}
          </Box>
        )}

        <Button
          onClick={handleDetailClick}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: active
              ? "translate(-50%, -50%)"
              : "translate(-50%, -40%)",
            opacity: active ? 1 : 0,
            pointerEvents: active ? "auto" : "none",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            zIndex: 2,
            minWidth: { xs: 96, lg: 130 },
            height: { xs: 36, lg: 44 },
            px: 2,
            borderRadius: 0,
            bgcolor: "var(--c-ffffff)",
            color: "var(--c-111111)",
            fontSize: { xs: 13, lg: 15 },
            fontWeight: 600,
            textTransform: "none",
            whiteSpace: "nowrap",
            boxShadow: "none",
            "&:hover": { bgcolor: BROWN, color: "#fff" },
          }}
        >
          View Details
        </Button>
      </Box>

      <Typography
        className="fs-card-name"
        sx={{
          fontSize: { xs: 14, md: 16, lg: 20 },
          fontWeight: 600,
          color: "var(--c-111111)",
          lineHeight: 1.4,
          transition: "color .25s ease",
        }}
      >
        {product.name}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 13, md: 14, lg: 16 },
          color: "var(--c-555555)",
          lineHeight: 1.7,
        }}
      >
        ${product.price}{" "}
        {product.oldPrice && (
          <s style={{ color: "var(--c-888888)", marginLeft: 6 }}>
            ${product.oldPrice}
          </s>
        )}
      </Typography>
      <ColorDots sx={{ justifyContent: "center", mt: "6px" }} />
    </Box>
  );
}

export function ProductSkeletons({ count = PAGE_SIZE }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
        columnGap: { xs: 1.5, md: "16px", lg: "24px" },
        rowGap: { xs: 3, md: "20px", lg: "34px" },
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box key={index}>
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              width: "100%",
              aspectRatio: "306 / 350",
              mb: 1.5,
            }}
          />
          <Skeleton animation="wave" width="70%" sx={{ mx: "auto" }} />
          <Skeleton animation="wave" width="30%" sx={{ mx: "auto" }} />
        </Box>
      ))}
    </Box>
  );
}

export function Pagination({ page, pages, onChange }) {
  const boxSx = (active) => ({
    width: { xs: 30, lg: 42 },
    height: { xs: 30, lg: 42 },
    border: `1px solid ${BROWN}`,
    bgcolor: active ? BROWN : "var(--c-ffffff)",
    color: active ? "#fff" : BROWN,
    fontSize: { xs: 13, lg: 16 },
    fontWeight: 600,
    transition:
      "transform .25s ease, background-color .25s ease, color .25s ease",
    transform: active ? "scale(1.08)" : "none",
    "&:hover": {
      transform: "translateY(-3px)",
      bgcolor: active ? BROWN : "var(--c-f4f2f0)",
    },
  });

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: { xs: "center", md: "flex-end" },
        alignItems: "center",
        gap: "12px",
        mt: { xs: 4, md: "40px", lg: "50px" },
        minHeight: { xs: 30, lg: 42 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: "6px", lg: "8px" },
          position: { md: "absolute" },
          left: { md: "50%" },
          transform: { md: "translateX(-50%)" },
        }}
      >
        {Array.from({ length: pages }, (_, index) => index + 1).map(
          (number) => (
            <ButtonBase
              key={number}
              onClick={() => number !== page && onChange(number)}
              aria-label={`Page ${number}`}
              aria-current={number === page ? "page" : undefined}
              sx={boxSx(number === page)}
            >
              {number}
            </ButtonBase>
          ),
        )}
      </Box>

      <Button
        variant="outlined"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        endIcon={
          <ChevronRight
            sx={{ fontSize: 18, transition: "transform .25s ease" }}
          />
        }
        sx={{
          height: { xs: 30, lg: 40 },
          minWidth: { xs: 72, lg: 106 },
          borderRadius: 0,
          borderColor: BROWN,
          color: "var(--c-555555)",
          fontSize: { xs: 13, lg: 16 },
          fontWeight: 600,
          textTransform: "none",
          "&:hover": { borderColor: BROWN, bgcolor: "transparent" },
          "&:hover .MuiSvgIcon-root": { transform: "translateX(4px)" },
          "&.Mui-disabled": {
            borderColor: "var(--c-d8cfc6)",
            color: "var(--c-aaaaaa)",
          },
        }}
      >
        Next
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
