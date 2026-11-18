import { useState, useEffect } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../../service/wishlist.service";
import EmptyWishlist from "../../components/wishlist/EmptyWishlist";
import WishlistItem from "../../components/wishlist/WishlistItem";
import {
  SIDE,
  SECTION_PY,
} from "../../styles/wishlistStyles";
import { addProductToCart } from "../../utils/wishlistUtils";

export default function WishlistPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load the wishlist from the database
  useEffect(() => {
    function redirectToLogin() {
      navigate("/login", {
        replace: true,
        state: { from: location },
      });
    }

    if (!localStorage.getItem("token")) {
      redirectToLogin();
      return;
    }

    let active = true;

    async function loadWishlist() {
      try {
        const wishlistData = await fetchWishlist();

        if (active) {
          setWishlistItems(wishlistData.items);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (error.status === 401) {
          redirectToLogin();
        } else {
          setErrorMessage(error.message || "Failed to load your wishlist");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadWishlist();

    return () => {
      active = false;
    };
  }, [navigate, location]);

  async function handleRemoveItem(productId) {
    setErrorMessage("");

    try {
      const wishlistData = await removeFromWishlist(productId);
      setWishlistItems(wishlistData.items);
    } catch (error) {
      setErrorMessage(error.message || "Could not remove this item");
    }
  }

  async function handleClearWishlist() {
    setErrorMessage("");

    try {
      const wishlistData = await clearWishlist();
      setWishlistItems(wishlistData.items);
    } catch (error) {
      setErrorMessage(error.message || "Could not clear your wishlist");
    }
  }

  let wishlistContent;

  if (isLoading) {
    wishlistContent = (
      <Typography sx={{ textAlign: "center", color: "var(--c-777777)" }}>
        Loading your wishlist...
      </Typography>
    );
  } else if (wishlistItems.length === 0) {
    wishlistContent = <EmptyWishlist />;
  } else {
    wishlistContent = (
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
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"} saved
          </Typography>

          <Button
            variant="outlined"
            onClick={handleClearWishlist}
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
          {wishlistItems.map((product) => (
            <WishlistItem
              key={product.id}
              product={product}
              onRemove={handleRemoveItem}
              onAddToCart={addProductToCart}
            />
          ))}
        </Box>
      </>
    );
  }

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
        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 0 }}
            onClose={() => setErrorMessage("")}
          >
            {errorMessage}
          </Alert>
        )}

        {wishlistContent}
      </Box>

      <Footer />
    </Box>
  );
}
