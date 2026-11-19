import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Badge, Fab, Snackbar, Alert, GlobalStyles } from "@mui/material";
import { ShoppingBagOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ProductModal from "../components/ProductModal";
import ShopMain from "../components/shop/ShopCatalog";
import { Services, Featured } from "../components/shop/ShopSections";
import { LazySection } from "../components/shop/ShopMotion";
import { useShopExtras } from "../hooks/shop/useShopProducts";
import { BROWN, log } from "../features/shop/shopConstants";
import { EASE, ANIMATION_STYLES } from "../features/shop/shopMotionStyles";

const Footer = lazy(() => import("../components/common/Footer"));

export default function Shop() {
  const extras = useShopExtras();
  const latest = useMemo(() => extras.slice(0, 4), [extras]);

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("furniture_cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("furniture_cart", JSON.stringify(cart));
    } catch {
      // Ignore unavailable storage.
    }
  }, [cart]);

  const openDetail = useCallback((product) => {
    log("open product:", product.id, product.name);
    setSelected(product);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const addToCart = useCallback((product, color, qty) => {
    const key = `${product.id}-${color}`;
    log("add to cart:", product.id, color, qty);

    setCart((previous) => {
      const exists = previous.find((item) => item.key === key);

      if (exists) {
        return previous.map((item) =>
          item.key === key ? { ...item, qty: item.qty + qty } : item,
        );
      }

      return [
        ...previous,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          color,
          qty,
        },
      ];
    });

    setModalOpen(false);
    setSnackbarOpen(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart],
  );

  return (
    <Box
      className="fs-shop"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        overflowX: "clip",
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />

      <ShopMain latest={latest} onDetail={openDetail} />

      <Services />

      {extras.length > 0 && (
        <LazySection minHeight={480}>
          <Featured products={extras} onDetail={openDetail} />
        </LazySection>
      )}

      <LazySection minHeight={200}>
        <Suspense fallback={<Box sx={{ minHeight: 200 }} />}>
          <Footer />
        </Suspense>
      </LazySection>

      <ProductModal
        product={selected}
        open={modalOpen}
        onClose={closeModal}
        onAddToCart={addToCart}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%", bgcolor: BROWN }}
        >
          Product successfully added to cart!
        </Alert>
      </Snackbar>

      <Fab
        component={Link}
        to="/cart"
        aria-label="Open cart"
        sx={{
          position: "fixed",
          right: { xs: 16, md: 28 },
          bottom: { xs: 16, md: 28 },
          bgcolor: BROWN,
          color: "#fff",
          animation: `fs-popIn .6s ${EASE} .8s backwards`,
          "&:hover": { bgcolor: "#7d6048" },
        }}
      >
        <Box
          key={cartCount}
          sx={{
            display: "flex",
            animation: cartCount > 0 ? "fs-bump .5s ease" : "none",
          }}
        >
          <Badge badgeContent={cartCount} color="error" showZero={false}>
            <ShoppingBagOutlined sx={{ color: "#fff" }} />
          </Badge>
        </Box>
      </Fab>
    </Box>
  );
}
