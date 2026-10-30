import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { Link } from "react-router-dom";
import shopService from "../service/shop.service";

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const percentOff = (product) => {
  const price = Number(product.price);
  const finalPrice = Number(product.finalPrice ?? product.salePrice);

  if (!price || !finalPrice || finalPrice >= price) return 0;

  return Math.round(((price - finalPrice) / price) * 100);
};

export default function SaleTicker({
  fallback = "This weekend sale 20% off on all products",
}) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;

    shopService
      .getProducts({ onSale: true, sort: "latest", page: 1, limit: 20 })
      .then((data) => {
        if (!active) return;

        const products = (data?.products || [])
          .filter((product) => product.onSale)
          .map((product) => ({
            id: product.id,
            name: product.name,
            off: percentOff(product),
            price: Number(product.finalPrice ?? product.salePrice),
            oldPrice: Number(product.price),
          }))
          .filter((product) => product.off > 0);

        setItems(products);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  if (!items.length) {
    return (
      <Typography
        sx={{
          fontSize: { xs: 11, sm: 12, md: 14 },
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          textAlign: "center",
        }}
      >
        {fallback}
      </Typography>
    );
  }

  // Repeat products to maintain seamless scrolling.
  const half = [];
  while (half.length < Math.max(8, items.length)) {
    half.push(...items);
  }

  const duration = half.length * 4;

  const renderItems = (hidden = false) =>
    half.map((item, index) => (
      <Box
        key={`${hidden ? "b" : "a"}-${item.id}-${index}`}
        component={Link}
        to={`/Shop?search=${encodeURIComponent(item.name)}&page=1`}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          px: { xs: 2, md: 4 },
          color: "#fff",
          textDecoration: "none",
          whiteSpace: "nowrap",
          fontSize: { xs: 11, sm: 12, md: 14 },
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        <Box
          component="span"
          sx={{
            bgcolor: "#FF5252",
            px: "6px",
            py: "1px",
            fontWeight: 700,
            fontSize: "0.9em",
          }}
        >
          {item.off}% OFF
        </Box>

        <span>{item.name}</span>
        <b>${item.price}</b>
        <s style={{ opacity: 0.7 }}>${item.oldPrice}</s>

        <Box component="span" sx={{ opacity: 0.5, pl: { xs: 2, md: 4 } }}>
          •
        </Box>
      </Box>
    ));

  return (
    <Box
      aria-label="Products on sale"
      sx={{
        width: "100%",
        overflow: "hidden",
        "&:hover .fs-ticker-track": {
          animationPlayState: "paused",
        },
      }}
    >
      <Box
        className="fs-ticker-track"
        sx={{
          display: "flex",
          width: "max-content",
          animation: `${scroll} ${duration}s linear infinite`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            overflowX: "auto",
          },
        }}
      >
        {renderItems()}
        {renderItems(true)}
      </Box>
    </Box>
  );
}
