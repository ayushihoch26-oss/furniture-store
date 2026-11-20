import { lazy, Suspense } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { ShoppingBagOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { BROWN, LIGHT_BG, SIDE } from "../checkoutConstants";
import { formatMoney } from "../../../utils/formatters";
import { getOrderNumber } from "../../invoice/utils/invoiceUtils";

const InvoiceDialog = lazy(() => import("../../invoice/components/InvoiceDialog"));

export function CheckoutHero() {
  return (
    <Box sx={{ bgcolor: LIGHT_BG, px: SIDE, py: { xs: 4, md: 5, lg: 7 } }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 28, md: 34, lg: 40 },
          fontWeight: 600,
          lineHeight: 1.2,
          color: "var(--c-111111)",
        }}
      >
        Checkout
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1, fontSize: { xs: 12, lg: 14 }, color: "var(--c-777777)" }}>
        <Box component={Link} to="/Dashboard" sx={{ color: "inherit", textDecoration: "none" }}>
          Home
        </Box>
        /
        <Box component={Link} to="/Shop" sx={{ color: "inherit", textDecoration: "none" }}>
          Shop
        </Box>
        / <Box sx={{ color: "var(--c-111111)" }}>Checkout</Box>
      </Box>
    </Box>
  );
}

export function EmptyCart() {
  return (
    <Box sx={{ px: SIDE, py: { xs: 8, lg: 14 }, textAlign: "center", color: "var(--c-777777)" }}>
      <ShoppingBagOutlined sx={{ fontSize: 64 }} />
      <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 600, color: "var(--c-111111)", mt: 1 }}>
        Your cart is empty
      </Typography>
      <Typography sx={{ mt: 1 }}>
        Add some products to continue to checkout.
      </Typography>
      <Button
        component={Link}
        to="/Shop"
        sx={{
          mt: 4,
          height: 48,
          px: 5,
          borderRadius: 0,
          bgcolor: BROWN,
          color: "#fff",
          textTransform: "none",
          "&:hover": { bgcolor: "#7d6048" },
        }}
      >
        Go to shop
      </Button>
    </Box>
  );
}

export function OrderSuccess({ order, isInvoiceOpen, openInvoice, closeInvoice }) {
  return (
    <>
      <Box sx={{ px: SIDE, py: { xs: 8, lg: 14 }, textAlign: "center" }}>
        <CheckCircleOutlinedIcon sx={{ fontSize: { xs: 64, lg: 80 }, color: BROWN }} />
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 600, mt: 2 }}>
          Thank you for your order!
        </Typography>
        <Typography sx={{ color: "var(--c-555555)", mt: 1.5, fontSize: { xs: 14, lg: 16 } }}>
          Order <b>{getOrderNumber(order)}</b> for {formatMoney(order.total)} has been placed.
          <br />
          You can view it anytime in My Orders.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5, mt: 4 }}>
          <Button
            component={Link}
            to="/Shop"
            sx={{ height: 48, px: 5, borderRadius: 0, bgcolor: BROWN, color: "#fff", textTransform: "none", "&:hover": { bgcolor: "#7d6048" } }}
          >
            Continue shopping
          </Button>
          <Button
            onClick={openInvoice}
            sx={{ height: 48, px: 4, borderRadius: 0, border: `1px solid ${BROWN}`, color: BROWN, textTransform: "none" }}
          >
            Download invoice
          </Button>
        </Box>
      </Box>

      {isInvoiceOpen && (
        <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress size={28} sx={{ color: BROWN }} /></Box>}>
          <InvoiceDialog open={isInvoiceOpen} order={order} onClose={closeInvoice} />
        </Suspense>
      )}
    </>
  );
}
