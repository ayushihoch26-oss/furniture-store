import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";

export function CartQtyStepper({
  qty,
  onMinus,
  onPlus,
  disabled = false,
}) {
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
