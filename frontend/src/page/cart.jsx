import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  Add,
  Remove,
  Close,
  LockOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { onImgError } from "../assets/furnitureImages";

import {
  getMyCart,
  updateCartItem,
  removeCartItem,
} from "../service/cart.service";

const BROWN = "#947458";
const GRAY_BG = "var(--c-f4f2f0)";
const LIGHT_BG = "var(--c-f8f8f8)";
const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };

const money = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const brownBtn = {
  height: { xs: 50, lg: 56 },
  borderRadius: 0,
  bgcolor: BROWN,
  color: "#fff",
  textTransform: "none",
  fontSize: { xs: 15, lg: 16 },
  fontWeight: 600,
  "&:hover": { bgcolor: "#7d6048" },
};

const ROW_COLUMNS = {
  xs: "1fr auto",
  md: "minmax(0, 1fr) 110px 140px 110px 36px",
};

function QtyStepper({ qty, onMinus, onPlus, disabled = false }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: 112,
        height: 38,
        border: "1px solid #947458",
        borderRadius: "4px",
        bgcolor: "#25201d",
        overflow: "hidden",
      }}
    >
      <IconButton
        size="small"
        onClick={onMinus}
        aria-label="Decrease quantity"
        disabled={disabled || Number(qty) <= 1}
        sx={{
          width: 34,
          height: 36,
          color: "#e8d7c7",
          borderRadius: 0,
          "&:hover": { bgcolor: "#49372b" },
          "&.Mui-disabled": { color: "#71645b" },
        }}
      >
        <Remove sx={{ fontSize: 17 }} />
      </IconButton>

      <Typography
        sx={{
          minWidth: 28,
          textAlign: "center",
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Number(qty) || 1}
      </Typography>

      <IconButton
        size="small"
        onClick={onPlus}
        aria-label="Increase quantity"
        disabled={disabled}
        sx={{
          width: 34,
          height: 36,
          color: "#e8d7c7",
          borderRadius: 0,
          "&:hover": { bgcolor: "#49372b" },
          "&.Mui-disabled": { color: "#71645b" },
        }}
      >
        <Add sx={{ fontSize: 17 }} />
      </IconButton>
    </Box>
  );
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);

  // Load the authenticated user's cart from the backend.
  const loadMyCart = useCallback(async () => {
    try {
      setLoading(true);
      setCartError("");

      const cart = await getMyCart();
      setItems(cart.items || []);
    } catch (error) {
      setCartError(error.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    loadMyCart();
  }, [loadMyCart]);

  // Refresh the cart when ProductModal adds a product.
  useEffect(() => {
    const refreshCart = () => {
      loadMyCart();
    };

    window.addEventListener("cart:changed", refreshCart);

    return () => {
      window.removeEventListener("cart:changed", refreshCart);
    };
  }, [loadMyCart]);

  // Update quantity on the backend.
  const changeQty = async (itemId, delta) => {
    if (updatingItem !== null) return;

    const item = items.find((current) => String(current.id) === String(itemId));

    if (!item) return;

    const currentQty = Number(item.quantity) || 1;
    const quantity = Math.max(1, currentQty + delta);

    if (quantity === currentQty) return;

    try {
      setUpdatingItem(itemId);
      setCartError("");

      const response = await updateCartItem(item.id, quantity);
      const cart = response.cart ?? response;

      setItems(cart.items ?? []);
      window.dispatchEvent(new Event("cart:changed"));
    } catch (error) {
      setCartError(error.message || "Unable to update quantity.");
    } finally {
      setUpdatingItem(null);
    }
  };

  // Remove an item on the backend.

  const removeItem = async (itemId) => {
    if (updatingItem !== null) return;

    if (itemId == null || !Number.isFinite(Number(itemId))) {
      console.error("Invalid cart item ID:", itemId);
      setCartError("Unable to identify this cart item.");
      return;
    }

    try {
      setUpdatingItem(itemId);
      setCartError("");

      await removeCartItem(itemId);

      // Refresh the cart after successful removal.
      const cart = await getMyCart();
      setItems(cart.items || []);
    } catch (error) {
      setCartError(error.message || "Unable to remove item.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const count = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.total) ||
        (Number(item.price) || 0) * (Number(item.quantity) || 0)),
    0,
  );

  const Hero = (
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

  // Loading state.
  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "var(--c-ffffff)",
        }}
      >
        <Navbar cartCount={0} />
        {Hero}

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

        <Footer />
      </Box>
    );
  }

  // Error state with retry.
  if (cartError && items.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "var(--c-ffffff)",
        }}
      >
        <Navbar cartCount={0} />
        {Hero}

        <Box sx={{ px: SIDE, py: 8, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
            {cartError}
          </Alert>

          <Button onClick={loadMyCart} sx={brownBtn}>
            Try again
          </Button>
        </Box>

        <Footer />
      </Box>
    );
  }

  // Empty cart.
  if (items.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "var(--c-ffffff)",
        }}
      >
        <Navbar cartCount={0} />
        {Hero}

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
            sx={{ ...brownBtn, mt: 4, px: 5 }}
          >
            Go to shop
          </Button>
        </Box>

        <Footer />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
      }}
    >
      <Navbar cartCount={count} />

      {Hero}

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
        {/* Cart items */}
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
                {/* Product */}
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
                      src={item.img || item.image || ""}
                      alt={item.name}
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
                      {item.name}
                    </Typography>

                    {item.color && (
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "var(--c-777777)",
                          mt: 0.25,
                        }}
                      >
                        {item.color}
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
                      {money(item.price)} each
                    </Typography>

                    <Typography
                      component="button"
                      disabled={busy}
                      onClick={() => removeItem(item.id)}
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

                {/* Unit price */}
                <Typography
                  sx={{
                    display: { xs: "none", md: "block" },
                    fontSize: 15,
                  }}
                >
                  {money(item.price)}
                </Typography>

                {/* Quantity */}
                <Box>
                  <QtyStepper
                    qty={Number(item.quantity) || 1}
                    disabled={updatingItem !== null}
                    onMinus={() => changeQty(item.id, -1)}
                    onPlus={() => changeQty(item.id, 1)}
                  />
                </Box>

                {/* Line total */}
                <Typography
                  sx={{
                    textAlign: "right",
                    fontSize: { xs: 16, lg: 17 },
                    fontWeight: 700,
                  }}
                >
                  {money(
                    Number(item.total) ||
                      (Number(item.price) || 0) * (Number(item.quantity) || 0),
                  )}
                </Typography>

                {/* Desktop remove */}
                <IconButton
                  onClick={() => removeItem(item.id)}
                  disabled={busy}
                  aria-label={`Remove ${item.name}`}
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

        {/* Order summary */}
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

            <Typography sx={{ fontSize: 15 }}>{money(subtotal)}</Typography>
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
              {money(subtotal)}
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/Checkout"
            fullWidth
            startIcon={<LockOutlined sx={{ fontSize: 18 }} />}
            sx={brownBtn}
          >
            Proceed to checkout
          </Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
