import { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Alert } from "@mui/material";
import {
  Close,
  FavoriteBorder,
  ShoppingBagOutlined,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../service/wishlist.service";

// ---------- Same tokens as Dashboard ----------
const BROWN = "#947458";
const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };
const SECTION_PY = { xs: "40px", md: "64px", xl: "80px" };
const DOTS = ["#BDBDBD", "#A79186", "#9A9AAE"];

// ---------- Small reusable pieces ----------
function ColorDots({ sx }) {
  return (
    <Box sx={{ display: "flex", gap: "4px", alignItems: "center", ...sx }}>
      {DOTS.map((color) => (
        <Box
          key={color}
          sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: color }}
        />
      ))}
    </Box>
  );
}

function Img({ src, alt = "" }) {
  if (!src) return null;
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        p: { xs: "8px", md: "14px", lg: "18px" },
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}

function EmptyWishlist() {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: { xs: 8, md: 12 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          bgcolor: "var(--c-f4f2f0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: "24px",
        }}
      >
        <FavoriteBorder sx={{ fontSize: 40, color: BROWN }} />
      </Box>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 600,
          color: "var(--c-111111)",
          mb: "8px",
        }}
      >
        Your wishlist is empty
      </Typography>
      <Typography
        sx={{
          fontSize: 14,
          color: "var(--c-777777)",
          maxWidth: 360,
          mb: "28px",
        }}
      >
        Tap the heart on any product to save it here and come back to it later.
      </Typography>
      <Button
        component={Link}
        to="/shop"
        variant="contained"
        disableElevation
        sx={{
          bgcolor: BROWN,
          borderRadius: 0,
          textTransform: "none",
          fontSize: 14,
          minWidth: 180,
          height: 45,
          "&:hover": { bgcolor: "#7d6149" },
        }}
      >
        Continue shopping
      </Button>
    </Box>
  );
}

// ---------- Page ----------
export default function Wishlist() {
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

  // Uses the same "furniture_cart" storage as your Shop page
  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("furniture_cart")) || [];
      const color = "Grey";
      const key = `${product.id}-${color}`;
      const exists = cart.find((i) => i.key === key);

      const next = exists
        ? cart.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
        : [
            ...cart,
            {
              key,
              id: product.id,
              productId: product.id,
              name: product.name,
              price: product.salePrice ?? product.price,
              img: product.img,
              color,
              qty: 1,
            },
          ];

      localStorage.setItem("furniture_cart", JSON.stringify(next));
    } catch {
      /* storage not available */
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
                      <Img src={product.img} alt={product.name} />
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
                    onClick={() => handleAddToCart(product)}
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
