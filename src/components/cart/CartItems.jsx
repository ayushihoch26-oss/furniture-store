import { Box, Button, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { onImgError } from "../../assets/furnitureImages";
import {
  BROWN,
  GRAY_BG,
  ROW_COLUMNS,
  formatCartMoney,
} from "../../features/cart/cartConstants";
import { CartQtyStepper } from "./CartQtyStepper";

export function CartItems({
  items,
  updatingItem,
  onChangeQty,
  onRemoveItem,
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: ROW_COLUMNS,
          columnGap: 2,
          pb: 1.5,
          borderBottom: "1px solid var(--c-e5e0db)",
          fontSize: 14,
          color: "var(--c-777777)",
        }}
      >
        <Box>Product</Box>
        <Box>Price</Box>
        <Box>Quantity</Box>
        <Box sx={{ textAlign: "right" }}>Total</Box>
        <Box />
      </Box>

      {items.map((item) => {
        const busy = updatingItem !== null;
        const product =
          item.product && typeof item.product === "object" ? item.product : {};
        const productName =
          item.name ||
          item.productName ||
          product.name ||
          `Product #${item.productId ?? item.id}`;
        const productImage =
          item.img || item.image || product.image || product.img || "";
        const productColor = item.color || product.color;
        const unitPrice = Number(item.price ?? product.price) || 0;
        const lineTotal =
          Number(item.total) ||
          unitPrice * (Number(item.quantity) || 0);

        return (
          <Box
            key={item.id}
            sx={{
              display: "grid",
              gridTemplateColumns: ROW_COLUMNS,
              columnGap: 2,
              rowGap: 1.5,
              alignItems: "center",
              py: { xs: 2.5, md: 3 },
              borderBottom: "1px solid var(--c-e5e0db)",
              opacity: updatingItem === item.id ? 0.65 : 1,
            }}
          >
            <Box
              sx={{
                gridColumn: { xs: "1 / -1", md: "auto" },
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 84, lg: 104 },
                  height: { xs: 84, lg: 104 },
                  bgcolor: GRAY_BG,
                  flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={productImage}
                  alt={productName}
                  onError={onImgError}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    p: "8px",
                    display: "block",
                  }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 15, lg: 17 },
                    fontWeight: 600,
                    color: "var(--c-111111)",
                  }}
                >
                  {productName}
                </Typography>

                {productColor && (
                  <Typography
                    sx={{ fontSize: 13, color: "var(--c-777777)", mt: 0.25 }}
                  >
                  {productColor}
                  </Typography>
                )}

                <Typography
                  sx={{
                    display: { xs: "block", md: "none" },
                    fontSize: 13,
                    color: "var(--c-777777)",
                    mt: 0.5,
                  }}
                >
                  {formatCartMoney(unitPrice)} each
                </Typography>

                <Typography
                  component="button"
                  disabled={busy}
                  onClick={() => onRemoveItem(item.id)}
                  sx={{
                    display: { xs: "inline-block", md: "none" },
                    mt: 0.5,
                    p: 0,
                    border: 0,
                    bgcolor: "transparent",
                    fontFamily: "inherit",
                    fontSize: 12.5,
                    color: "#c62828",
                    textDecoration: "underline",
                    cursor: busy ? "default" : "pointer",
                  }}
                >
                  Remove
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                display: { xs: "none", md: "block" },
                fontSize: 15,
              }}
            >
              {formatCartMoney(unitPrice)}
            </Typography>

            <Box>
              <CartQtyStepper
                qty={Number(item.quantity) || 1}
                disabled={updatingItem !== null}
                onMinus={() => onChangeQty(item.id, -1)}
                onPlus={() => onChangeQty(item.id, 1)}
              />
            </Box>

            <Typography
              sx={{
                textAlign: "right",
                fontSize: { xs: 16, lg: 17 },
                fontWeight: 700,
              }}
            >
              {formatCartMoney(lineTotal)}
            </Typography>

            <IconButton
              onClick={() => onRemoveItem(item.id)}
              disabled={busy}
              aria-label={`Remove ${productName}`}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                "&:hover": { color: "#c62828" },
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        );
      })}

      <Button
        component={Link}
        to="/Shop"
        sx={{
          mt: 3,
          color: "var(--c-555555)",
          textTransform: "none",
          fontSize: 15,
          "&:hover": {
            color: BROWN,
            bgcolor: "transparent",
          },
        }}
      >
        ← Continue shopping
      </Button>
    </Box>
  );
}
