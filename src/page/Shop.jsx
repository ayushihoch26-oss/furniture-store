import { Suspense, lazy, useEffect, useState } from "react";
import { Box, Badge, Fab, Snackbar, Alert, GlobalStyles } from "@mui/material";
import { ShoppingBagOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ProductModal from "../components/ProductModal";
import ShopMain from "../components/shop/ShopCatalog";
import { Services, Featured } from "../components/shop/ShopSections";
import { LazySection } from "../components/shop/ShopMotion";
import { useShopExtras } from "../hooks/shop/useShopProducts";
import { BROWN } from "../features/shop/shopConstants";
import { EASE, ANIMATION_STYLES } from "../features/shop/shopMotionStyles";

const Footer = lazy(() => import("../components/common/Footer"));

export default function Shop() {
  const featuredProducts = useShopExtras();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // Read the saved cart from local storage.
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("furniture_cart")) || [];
    } catch {
      return [];
    }
  });

  // Save the cart whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem("furniture_cart", JSON.stringify(cart));
    } catch {
      // Ignore unavailable storage.
    }
  }, [cart]);

  function openProductDetails(product) {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  function addToCart(product, selectedColor, quantity) {
    const cartKey = `${product.id}-${selectedColor}`;

    setCart((oldCart) => {
      const oldItem = oldCart.find((item) => item.key === cartKey);

      if (oldItem) {
        return oldCart.map((item) =>
          item.key === cartKey
            ? { ...item, qty: item.qty + quantity }
            : item,
        );
      }

      return [
        ...oldCart,
        {
          key: cartKey,
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          color: selectedColor,
          qty: quantity,
        },
      ];
    });

    setIsModalOpen(false);
    setIsMessageOpen(true);
  }

  function closeSnackbar() {
    setIsMessageOpen(false);
  }

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

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

      <ShopMain onDetail={openProductDetails} extras={featuredProducts} />

      <Services />

      {featuredProducts.length > 0 && (
        <LazySection minHeight={480}>
          <Featured
            products={featuredProducts}
            onDetail={openProductDetails}
          />
        </LazySection>
      )}

      <LazySection minHeight={200}>
        <Suspense fallback={<Box sx={{ minHeight: 200 }} />}>
          <Footer />
        </Suspense>
      </LazySection>

      <ProductModal
        product={selectedProduct}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
      />

      <Snackbar
        open={isMessageOpen}
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
