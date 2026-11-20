import { Box, Button, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  BROWN_BUTTON,
  LIGHT_BG,
  formatCartMoney,
} from "../../features/cart/cartConstants";

export function CartSummary({ count, subtotal }) {
  return (
    <Box
      sx={{
        bgcolor: LIGHT_BG,
        p: { xs: 2.5, lg: 4 },
        position: { md: "sticky" },
        top: { md: 24 },
      }}
    >
      <Typography
        sx={{ fontSize: { xs: 18, lg: 22 }, fontWeight: 600, mb: 3 }}
      >
        Order summary
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 15, color: "var(--c-555555)" }}>
          Items ({count})
        </Typography>

        <Typography sx={{ fontSize: 15 }}>{formatCartMoney(subtotal)}</Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          color: "var(--c-777777)",
          mb: 2.5,
        }}
      >
        Shipping &amp; taxes calculated at checkout
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          pt: 2,
          mb: 3,
          borderTop: "1px solid var(--c-e5e0db)",
        }}
      >
        <Typography sx={{ fontSize: { xs: 16, lg: 18 }, fontWeight: 600 }}>
          Subtotal
        </Typography>

        <Typography sx={{ fontSize: { xs: 20, lg: 24 }, fontWeight: 700 }}>
          {formatCartMoney(subtotal)}
        </Typography>
      </Box>

      <Button
        component={Link}
        to="/Checkout"
        fullWidth
        startIcon={<LockOutlined sx={{ fontSize: 18 }} />}
        sx={BROWN_BUTTON}
      >
        Proceed to checkout
      </Button>
    </Box>
  );
}
