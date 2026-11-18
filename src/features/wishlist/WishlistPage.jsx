import { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Alert } from "@mui/material";
import { Close, ShoppingBagOutlined } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../../service/wishlist.service";
import ColorDots from "../../components/wishlist/ColorDots";
import EmptyWishlist from "../../components/wishlist/EmptyWishlist";
import WishlistImage from "../../components/wishlist/WishlistImage";
import {
  BROWN,
  SIDE,
  SECTION_PY,
} from "../../styles/wishlistStyles";
import { addProductToCart } from "../../utils/wishlistUtils";

export default function WishlistPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Send guests to Login (and a 401 from the server does the same)
  const goToLogin = () =>
    navigate("/login", { replace: true, state: { from: location } });

  // Load the wishlist from the database
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      goToLogin();
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const data = await fetchWishlist();
        if (active) setItems(data.items);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) goToLogin();
        else setError(err.message || "Failed to load your wishlist");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = async (productId) => {
    setError("");
    try {
      const data = await removeFromWishlist(productId);
      setItems(data.items);
    } catch (err) {
      setError(err.message || "Could not remove this item");
    }
  };

  const clearAll = async () => {
    setError("");
    try {
      const data = await clearWishlist();
      setItems(data.items);
    } catch (err) {
      setError(err.message || "Could not clear your wishlist");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      {/* Title bar */}
      <Box sx={{ bgcolor: "var(--c-f4f2f0)", px: SIDE, py: { xs: 4, md: 6 } }}>
        <Typography sx={{ fontSize: 13, color: "var(--c-777777)", mb: "8px" }}>
          <Link
            to="/"
            style={{ color: "var(--c-777777)", textDecoration: "none" }}
          >
            Home
          </Link>{" "}
          / Wishlist
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 26, md: 32 },
            fontWeight: 600,
            color: "var(--c-111111)",
          }}
        >
          My Wishlist
        </Typography>
      </Box>

      <Box sx={{ flex: 1, px: SIDE, py: SECTION_PY }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 0 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Typography sx={{ textAlign: "center", color: "var(--c-777777)" }}>
            Loading your wishlist...
          </Typography>
        ) : items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: { xs: 3, md: "40px" },
              }}
            >
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </Typography>
              <Button
                variant="outlined"
                onClick={clearAll}
                sx={{
                  height: 40,
                  px: 3,
                  borderRadius: 0,
                  borderColor: "var(--c-111111)",
                  color: "var(--c-111111)",
                  fontSize: 14,
                  fontWeight: 400,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "var(--c-111111)",
                    bgcolor: "transparent",
                  },
                }}
              >
                Clear all
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                columnGap: { xs: 2, md: "17px" },
                rowGap: { xs: 4, md: "40px" },
              }}
            >
              {items.map((product) => (
                <Box key={product.id} sx={{ textAlign: "center" }}>
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
                          bgcolor:
                            product.badge === "SALE" ? "#FF5252" : "#1a1a1a",
                        }}
                      >
                        {product.badge}
                      </Box>
                    )}

                    <IconButton
                      size="small"
                      aria-label="Remove from wishlist"
                      onClick={() => removeItem(product.id)}
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
                        <b
                          style={{ color: "var(--c-111111)", fontWeight: 500 }}
                        >
                          ${product.salePrice}
                        </b>
                      </>
                    ) : (
                      `$${product.price}`
                    )}
                  </Typography>

                  <ColorDots
                    sx={{ justifyContent: "center", mt: "4px", mb: "14px" }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    startIcon={<ShoppingBagOutlined sx={{ fontSize: 16 }} />}
                    onClick={() => addProductToCart(product)}
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
              ))}
            </Box>
          </>
        )}
      </Box>

      <Footer />
    </Box>
  );
}
