import { memo } from "react";
import { Badge, Box, Divider, Typography, Button } from "@mui/material";
import { GRAY_BG, LIGHT_BG, TAX_RATE } from "./checkoutConstants";
import { formatMoney } from "./checkoutUtils";
import { Field } from "./CheckoutFields";
import { onImgError } from "../../assets/furnitureImages";

export const CheckoutSummary = memo(function CheckoutSummary({
  items,
  totals,
  coupon,
  setCoupon,
  appliedCoupon,
  applyCoupon,
  couponMessage,
}) {
  return (
    <Box sx={{ bgcolor: LIGHT_BG, p: { xs: 2.5, lg: 4 } }}>
      <Typography sx={{ fontSize: { xs: 18, lg: 22 }, fontWeight: 600, mb: 2.5 }}>
        Order summary
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item, index) => (
          <Box
            key={item.key || item.id || `${item.name}-${index}`}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <Badge
              badgeContent={item.qty}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#111",
                  color: "#fff",
                  fontSize: 11,
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 64, lg: 76 },
                  height: { xs: 64, lg: 76 },
                  bgcolor: GRAY_BG,
                }}
              >
                <Box
                  component="img"
                  src={item.img || item.image}
                  alt={item.name}
                  onError={onImgError}
                  sx={{ width: "100%", height: "100%", objectFit: "contain", p: "6px" }}
                />
              </Box>
            </Badge>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 14, lg: 15 } }}>
                {item.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "var(--c-777777)" }}>
                {item.color}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: 14, lg: 15 }, fontWeight: 600 }}>
              {formatMoney(Number(item.price || 0) * Number(item.qty || 0))}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", gap: 1 }}>
        <Field
          label="Discount code"
          value={coupon}
          onChange={(event) => setCoupon(event.target.value)}
          disabled={Boolean(appliedCoupon)}
        />
        <Button
          type="button"
          onClick={applyCoupon}
          sx={{
            flexShrink: 0,
            minWidth: 88,
            height: 40,
            borderRadius: 0,
            bgcolor: "#2b2b2b",
            color: "#fff",
            textTransform: "none",
            "&:hover": { bgcolor: "#111" },
          }}
        >
          {appliedCoupon ? "Remove" : "Apply"}
        </Button>
      </Box>

      {couponMessage && (
        <Typography
          sx={{
            fontSize: 12.5,
            mt: 0.75,
            color: appliedCoupon ? "#2e7d32" : "#c62828",
          }}
        >
          {couponMessage}
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {[
        ["Subtotal", formatMoney(totals.subtotal)],
        appliedCoupon && [
          `Discount (${appliedCoupon})`,
          `-${formatMoney(totals.discount)}`,
        ],
        ["Shipping", totals.shipping === 0 ? "Free" : formatMoney(totals.shipping)],
        [`Estimated tax (${TAX_RATE * 100}%)`, formatMoney(totals.tax)],
      ]
        .filter(Boolean)
        .map(([label, value]) => (
          <Box
            key={label}
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.25 }}
          >
            <Typography sx={{ fontSize: { xs: 14, lg: 15 }, color: "var(--c-555555)" }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, lg: 15 } }}>
              {value}
            </Typography>
          </Box>
        ))}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: { xs: 16, lg: 18 }, fontWeight: 600 }}>
          Total
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, lg: 24 }, fontWeight: 700 }}>
          <Box component="span" sx={{ fontSize: 12, mr: 1, color: "var(--c-777777)" }}>
            USD
          </Box>
          {formatMoney(totals.total)}
        </Typography>
      </Box>
    </Box>
  );
});
