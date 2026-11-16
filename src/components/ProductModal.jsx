import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Button,
  ButtonBase,
  IconButton,
  Dialog,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  Close,
  FavoriteBorder,
  Favorite,
  Add,
  Remove,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

import { onImgError } from "../assets/furnitureImages";

import {
  getWishlist,
  toggleWishlist,
  fetchWishlist,
} from "../service/wishlist.service";

import { addToCart } from "../service/cart.service";

// eslint-disable-next-line react-refresh/only-export-components
export { getWishlist, toggleWishlist };

const BROWN = "#947458";
const BG = "var(--c-f4f2f0)";
const GRAY = "var(--c-888888)";
const DARK_GRAY = "var(--c-444444)";
const BORDER = "var(--c-dddddd)";

const isInWishlist = (product) => {
  if (!product?.id) return false;

  return getWishlist().some((item) => String(item.id) === String(product.id));
};

function ProductModal({ product, open, onClose, onAddToCart }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("details");
  const [color, setColor] = useState("Grey");
  const [qty, setQty] = useState(1);
  const [wishlistVersion, setWishlistVersion] = useState(0);

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  // Reset product-specific state when the selected product changes.
  useEffect(() => {
    // eslint-disable-next-line
    setQty(1);
    setTab("details");
    setColor("Grey");
    setCartMessage("");
    setCartError("");
  }, [product?.id]);

  // Listen for wishlist changes.
  useEffect(() => {
    const refreshWishlist = () => {
      setWishlistVersion((previous) => previous + 1);
    };

    window.addEventListener("wishlist:changed", refreshWishlist);

    return () => {
      window.removeEventListener("wishlist:changed", refreshWishlist);
    };
  }, []);

  // Load the server wishlist when the modal opens.
  useEffect(() => {
    if (open && localStorage.getItem("token")) {
      fetchWishlist().catch(() => {});
    }
  }, [open]);

  // Memoize product information.
  const gallery = useMemo(() => {
    if (product?.gallery?.length > 0) {
      return product.gallery;
    }

    return [product?.img || product?.image];
  }, [product?.gallery, product?.img, product?.image]);

  const details = product?.details || {};

  const category = details.category || product?.cats?.[0] || "—";

  const detailRows = useMemo(
    () => [
      ["Material", details.material || "—"],
      ["Size", details.size || "—"],
      ["Category", category],
      ["Shipping", details.shipping || "—"],
    ],
    [details.material, details.size, details.shipping, category],
  );

  const stock = product?.stock == null ? null : Number(product.stock);

  const soldOut = Boolean(product?.soldOut) || (stock !== null && stock <= 0);

  const maxQty = stock !== null && stock > 0 ? stock : Infinity;

  const sku =
    product?.sku && !String(product.sku).startsWith("TMP")
      ? product.sku
      : `SKU-${String(product?.id ?? "").padStart(5, "0")}`;

  const liked = useMemo(
    () => isInWishlist(product),
    // eslint-disable-next-line
    [product, wishlistVersion],
  );

  const handleWishlistToggle = useCallback(() => {
    if (!localStorage.getItem("token")) {
      onClose?.();
      navigate("/login", { state: { from: location } });
      return;
    }

    toggleWishlist(product);

    setWishlistVersion((previous) => previous + 1);
  }, [product, onClose, navigate, location]);

  const handleDecrease = useCallback(() => {
    setQty((previous) => Math.max(1, previous - 1));
  }, []);

  const handleIncrease = useCallback(() => {
    setQty((previous) => Math.min(maxQty, previous + 1));
  }, [maxQty]);

  const handleAddToCart = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      onClose?.();
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!product?.id) {
      setCartError("Product ID is missing.");
      return;
    }

    if (soldOut || addingToCart) return;

    try {
      setAddingToCart(true);
      setCartError("");
      setCartMessage("");

      await addToCart(product, qty);

      // Notify the Navbar and CartPage.
      window.dispatchEvent(new Event("cart:changed"));

      setCartMessage(`${product.name} added to cart successfully`);

      setQty(1);
      setColor("Grey");

      // Do not send a second cart request from the parent.
      onAddToCart?.(product, color, qty, {
        alreadyAdded: true,
      });
    } catch (error) {
      setCartError(error?.message || "Unable to add product to cart.");
    } finally {
      setAddingToCart(false);
    }
  }, [
    product,
    qty,
    color,
    soldOut,
    addingToCart,
    onClose,
    navigate,
    location,
    onAddToCart,
  ]);

  if (!product) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            bgcolor: "var(--c-ffffff)",
            boxShadow: "none",
          },
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
          }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.15fr 1fr",
            },
            gap: { xs: 3, md: 5 },
            p: { xs: 2, sm: 4 },
            pt: { xs: 7, sm: 5 },
          }}
        >
          {/* Product image */}
          <Box>
            <Box
              component="img"
              src={gallery[0]}
              alt={product.name || "Product"}
              loading="lazy"
              decoding="async"
              onError={onImgError}
              sx={{
                width: "100%",
                height: { xs: 320, sm: 460 },
                objectFit: "contain",
                bgcolor: BG,
                p: 2,
                boxSizing: "border-box",
              }}
            />
          </Box>

          {/* Product information */}
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                color: GRAY,
              }}
            >
              {sku}
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 24, md: 30 },
                fontWeight: 700,
                color: BROWN,
                mt: 0.5,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              sx={{
                fontSize: 30,
                fontWeight: 700,
                color: BROWN,
                py: 1.5,
                borderBottom: `2px solid ${BROWN}`,
              }}
            >
              ${Number(product.price || 0).toFixed(2)}{" "}
              {product.oldPrice != null && (
                <s
                  style={{
                    fontSize: 18,
                    fontWeight: 400,
                    color: GRAY,
                  }}
                >
                  ${Number(product.oldPrice).toFixed(2)}
                </s>
              )}
            </Typography>

            {stock !== null && (
              <Typography
                sx={{
                  fontSize: 13,
                  mt: 1,
                  color: soldOut ? "#d32f2f" : "var(--c-555555)",
                }}
              >
                {soldOut
                  ? "Out of stock"
                  : product.stockStatus === "low_stock"
                    ? `Only ${stock} left`
                    : "In stock"}
              </Typography>
            )}

            {/* Description and details tabs */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                mt: 2,
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              {["description", "details"].map((item) => (
                <ButtonBase
                  key={item}
                  onClick={() => setTab(item)}
                  sx={{
                    pb: 1,
                    fontSize: 13,
                    fontWeight: tab === item ? 700 : 400,
                    borderBottom:
                      tab === item
                        ? `2px solid ${BROWN}`
                        : "2px solid transparent",
                  }}
                >
                  {item.toUpperCase()}
                </ButtonBase>
              ))}
            </Box>

            {/* Product details */}
            <Box sx={{ mt: 2, minHeight: 100 }}>
              {tab === "details" ? (
                detailRows.map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      py: 0.6,
                      fontSize: 13,
                    }}
                  >
                    <Typography
                      sx={{
                        width: 90,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: DARK_GRAY,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: DARK_GRAY,
                  }}
                >
                  {product.description ||
                    `${product.name} features quality materials and a modern design for your living room, bedroom, or workspace.`}
                </Typography>
              )}
            </Box>

            {/* Quantity selector */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mt: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Qty
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--c-cccccc)",
                }}
              >
                <IconButton
                  size="small"
                  aria-label="Decrease quantity"
                  disabled={soldOut || addingToCart || qty <= 1}
                  onClick={handleDecrease}
                >
                  <Remove fontSize="small" />
                </IconButton>

                <Typography
                  sx={{
                    width: 30,
                    textAlign: "center",
                  }}
                >
                  {qty}
                </Typography>

                <IconButton
                  size="small"
                  aria-label="Increase quantity"
                  disabled={soldOut || addingToCart || qty >= maxQty}
                  onClick={handleIncrease}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Add to cart and wishlist */}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                mt: 5,
              }}
            >
              <Button
                fullWidth
                disabled={soldOut || addingToCart}
                onClick={handleAddToCart}
                sx={{
                  height: 48,
                  borderRadius: "24px",
                  bgcolor: BROWN,
                  color: "#fff",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#816247",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#cfc5bb",
                    color: "#fff",
                  },
                }}
              >
                {addingToCart ? (
                  <CircularProgress size={20} color="inherit" />
                ) : soldOut ? (
                  "Out of Stock"
                ) : (
                  "Add to Cart"
                )}
              </Button>

              <IconButton
                onClick={handleWishlistToggle}
                aria-label="Wishlist"
                sx={{
                  width: 48,
                  height: 48,
                  border: `1px solid ${BROWN}`,
                  color: liked ? "#FF5252" : BROWN,
                }}
              >
                {liked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Success notification */}
      <Snackbar
        open={Boolean(cartMessage)}
        autoHideDuration={3000}
        onClose={() => setCartMessage("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCartMessage("")}
        >
          {cartMessage}
        </Alert>
      </Snackbar>

      {/* Error notification */}
      <Snackbar
        open={Boolean(cartError)}
        autoHideDuration={4000}
        onClose={() => setCartError("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setCartError("")}
        >
          {cartError}
        </Alert>
      </Snackbar>
    </>
  );
}

export default memo(ProductModal);
