import { Box, Button, CircularProgress, Typography, Alert } from "@mui/material";
import {
  ShoppingBagOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import {
  BROWN,
  BROWN_BUTTON,
  LIGHT_BG,
  SIDE,
} from "../../features/cart/cartConstants";

export function CartShell({ cartCount, children }) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        color: "var(--c-111111)",
      }}
    >
      <Navbar cartCount={cartCount} />
      <CartHero />
      {children}
      <Footer />
    </Box>
  );
}

export function CartHero() {
  return (
    <Box sx={{ bgcolor: LIGHT_BG, px: SIDE, py: { xs: 4, md: 5, lg: 7 } }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 28, md: 34, lg: 40 },
          fontWeight: 600,
          color: "var(--c-111111)",
          lineHeight: 1.2,
        }}
      >
        Shopping Cart
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 1,
          fontSize: { xs: 12, lg: 14 },
          color: "var(--c-777777)",
        }}
      >
        <Box
          component={Link}
          to="/Dashboard"
          sx={{
            color: "inherit",
            textDecoration: "none",
            "&:hover": { color: BROWN },
          }}
        >
          Home
        </Box>
        /<Box sx={{ color: "var(--c-111111)" }}>Cart</Box>
      </Box>
    </Box>
  );
}

export function CartLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
      }}
    >
      <CircularProgress sx={{ color: BROWN }} />
    </Box>
  );
}

export function CartLoadError({ message, onRetry }) {
  return (
    <Box sx={{ px: SIDE, py: 8, textAlign: "center" }}>
      <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
        {message}
      </Alert>

      <Button onClick={onRetry} sx={BROWN_BUTTON}>
        Try again
      </Button>
    </Box>
  );
}

export function EmptyCart() {
  return (
    <Box
      sx={{
        px: SIDE,
        py: { xs: 8, lg: 14 },
        textAlign: "center",
        color: "var(--c-777777)",
      }}
    >
      <ShoppingBagOutlined sx={{ fontSize: 64 }} />

      <Typography
        sx={{
          fontSize: { xs: 20, md: 24 },
          fontWeight: 600,
          color: "var(--c-111111)",
          mt: 1,
        }}
      >
        Your cart is empty
      </Typography>

      <Typography sx={{ mt: 1 }}>
        Looks like you haven't added anything yet.
      </Typography>

      <Button
        component={Link}
        to="/Shop"
        sx={{ ...BROWN_BUTTON, mt: 4, px: 5 }}
      >
        Go to shop
      </Button>
    </Box>
  );
}
