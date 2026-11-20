import { Box, Typography, Button, ButtonBase, Skeleton } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import {
  BROWN,
  GRAY_BG,
  BADGE_COLORS,
  PAGE_SIZE,
} from "../shopConstants";
import { onImgError } from "../../../assets/furnitureImages";
import { ColorDots } from "./ShopShared";

export function ProductCard({ product, onDetail }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        sx={{
          position: "relative",
          aspectRatio: "306 / 350",
          mb: 1.5,
          bgcolor: GRAY_BG,
          overflow: "hidden",
          "&:hover .shop-product-image": {
            filter: "blur(3px)",
            transform: "scale(1.04)",
          },
          "&:hover .shop-view-button": {
            opacity: 1,
            pointerEvents: "auto",
            transform: "translate(-50%, -50%)",
          },
          "@media (hover: none)": {
            "& .shop-view-button": {
              opacity: 1,
              pointerEvents: "auto",
              transform: "translate(-50%, -50%)",
            },
          },
        }}
      >
        <Box
          component="img"
          className="shop-product-image"
          src={product.img}
          alt={product.name}
          onError={onImgError}
          loading="lazy"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 2,
            opacity: product.soldOut ? 0.55 : 1,
            transition: "filter 0.3s ease, transform 0.3s ease",
          }}
        />

        <Button
          className="shop-view-button"
          onClick={() => onDetail(product)}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            opacity: 0,
            pointerEvents: "none",
            transform: "translate(-50%, -40%)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            zIndex: 2,
            borderRadius: 0,
            bgcolor: "#fff",
            color: "#111",
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: BROWN, color: "#fff" },
          }}
        >
          View details
        </Button>

        {product.badge && (
          <Typography
            sx={{
              position: "absolute",
              top: 1,
              left: 1,
              px: 1.5,
              py: 0.5,
              color: "#fff",
              bgcolor: BADGE_COLORS[product.badge] || "#1a1a1a",
              fontSize: 13,
              zIndex: 1,
            }}
          >
            {product.badge}
          </Typography>
        )}
      </Box>

      <Typography sx={{ fontWeight: 600, color: "var(--c-111111)" }}>
        {product.name}
      </Typography>
      <Typography sx={{ color: "var(--c-555555)" }}>
        ${product.price}{" "}
        {product.oldPrice && (
          <s style={{ color: "var(--c-888888)" }}>${product.oldPrice}</s>
        )}
      </Typography>
      <ColorDots sx={{ justifyContent: "center", mt: 1 }} />
    </Box>
  );
}

export function ProductSkeletons({ count = PAGE_SIZE }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
        gap: 3,
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box key={index}>
          <Skeleton
            variant="rectangular"
            sx={{ width: "100%", aspectRatio: "306 / 350", mb: 1 }}
          />
          <Skeleton width="70%" sx={{ mx: "auto" }} />
          <Skeleton width="30%" sx={{ mx: "auto" }} />
        </Box>
      ))}
    </Box>
  );
}

export function Pagination({ page, pages, onChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "center", md: "flex-end" },
        alignItems: "center",
        gap: 1,
        mt: 4,
      }}
    >
      {Array.from({ length: pages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <ButtonBase
            key={pageNumber}
            onClick={() => onChange(pageNumber)}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            sx={{
              width: 40,
              height: 40,
              border: `1px solid ${BROWN}`,
              bgcolor: pageNumber === page ? BROWN : "#fff",
              color: pageNumber === page ? "#fff" : BROWN,
            }}
          >
            {pageNumber}
          </ButtonBase>
        ),
      )}

      <Button
        variant="outlined"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        endIcon={<ChevronRight />}
        sx={{
          borderRadius: 0,
          borderColor: BROWN,
          color: BROWN,
          textTransform: "none",
          "&:hover": {
            borderColor: BROWN,
          },
        }}
      >
        Next
      </Button>
    </Box>
  );
}
