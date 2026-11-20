import { Alert, Box } from "@mui/material";
import { CartItems } from "../components/CartItems";
import { CartSummary } from "../components/CartSummary";
import {
  CartLoadError,
  CartLoading,
  CartShell,
  EmptyCart,
} from "../components/CartLayout";
import { SIDE } from "../cartConstants";
import { useCart } from "../hooks/useCart";

export default function CartPage() {
  const {
    items,
    loading,
    cartError,
    setCartError,
    updatingItem,
    loadMyCart,
    changeQty,
    removeItem,
    count,
    subtotal,
  } = useCart();

  if (loading) {
    return (
      <CartShell cartCount={0}>
        <CartLoading />
      </CartShell>
    );
  }

  if (cartError && items.length === 0) {
    return (
      <CartShell cartCount={0}>
        <CartLoadError message={cartError} onRetry={loadMyCart} />
      </CartShell>
    );
  }

  if (items.length === 0) {
    return (
      <CartShell cartCount={0}>
        <EmptyCart />
      </CartShell>
    );
  }

  return (
    <CartShell cartCount={count}>
      {cartError && (
        <Box sx={{ px: SIDE, pt: 2 }}>
          <Alert severity="error" onClose={() => setCartError("")}>
            {cartError}
          </Alert>
        </Box>
      )}

      <Box
        sx={{
          px: SIDE,
          py: { xs: 3, md: "48px", lg: "72px" },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) 320px",
            lg: "minmax(0, 1fr) 400px",
          },
          columnGap: { md: "32px", lg: "56px" },
          rowGap: 4,
          alignItems: "start",
        }}
      >
        <CartItems
          items={items}
          updatingItem={updatingItem}
          onChangeQty={changeQty}
          onRemoveItem={removeItem}
        />
        <CartSummary count={count} subtotal={subtotal} />
      </Box>
    </CartShell>
  );
}
