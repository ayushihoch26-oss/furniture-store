import { Box, Button, IconButton, Typography } from "@mui/material";
import { Close, ShoppingBagOutlined } from "@mui/icons-material";

import ColorDots from "./ColorDots";
import WishlistImage from "./WishlistImage";
import { BROWN } from "../../styles/wishlistStyles";

export default function WishlistItem({ product, onRemove, onAddToCart }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "416 / 555",
          bgcolor: "var(--c-f4f2f0)",
          overflow: "hidden",
          mb: "14px",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0 }}>
          <WishlistImage src={product.img} alt={product.name} />
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
              bgcolor: product.badge === "SALE" ? "#FF5252" : "#1a1a1a",
            }}
          >
            {product.badge}
          </Box>
        )}

        <IconButton
          size="small"
          aria-label="Remove from wishlist"
          onClick={() => onRemove(product.id)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "var(--c-ffffff)",
            color: "var(--c-333333)",
            "&:hover": {
              bgcolor: "var(--c-ffffff)",
              color: "#FF5252",
            },
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
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
            <s>${product.oldPrice ?? product.price}</s>{" "}
            <b style={{ color: "var(--c-111111)", fontWeight: 500 }}>
              ${product.salePrice}
            </b>
          </>
        ) : (
          `$${product.price}`
        )}
      </Typography>

      <ColorDots
        sx={{
          justifyContent: "center",
          mt: "4px",
          mb: "14px",
        }}
      />

      <Button
        fullWidth
        variant="contained"
        disableElevation
        startIcon={<ShoppingBagOutlined sx={{ fontSize: 16 }} />}
        onClick={() => onAddToCart(product)}
        sx={{
          bgcolor: BROWN,
          borderRadius: 0,
          height: 40,
          fontSize: 13,
          textTransform: "none",
          "&:hover": { bgcolor: "#7d6149" },
        }}
      >
        Add to cart
      </Button>
    </Box>
  );
}
