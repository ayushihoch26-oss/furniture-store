import { Box, Typography, Button } from "@mui/material";
import { FavoriteBorder } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { BROWN } from "../wishlistStyles";

export default function EmptyWishlist() {
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
