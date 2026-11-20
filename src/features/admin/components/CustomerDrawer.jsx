import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { Box, Typography, Drawer, IconButton, Avatar } from "@mui/material";
import {
  Close,
  ContentCopy,
  Check,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const BROWN = "#947458";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function getDetails(customer) {
  return {
    name:
      customer.name ||
      [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
      "Customer",
    phone: customer.phone || "-",
    email: customer.email || "-",
    address:
      customer.address ||
      [customer.street, customer.city, customer.state, customer.zip]
        .filter(Boolean)
        .join(", ") ||
      "-",

    // use the raw dates, not the already formatted strings
    registration: formatDate(customer.createdAt),
    lastPurchase: formatDate(customer.lastPurchaseAt),

    total: Number(customer.totalOrders ?? customer.orders ?? 0) || 0,
    completed: Number(customer.completedOrders ?? 0) || 0,
    canceled:
      Number(customer.canceledOrders ?? customer.cancelledOrders ?? 0) || 0,
  };
}

const SectionLabel = memo(function SectionLabel({ children, theme }) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        color: theme.muted,
        mt: 3,
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
});

const InfoRow = memo(function InfoRow({ icon, children, theme }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minHeight: 44,
        px: 1.5,
        py: 0.5,
        mb: 1.5,
        fontSize: 14,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: 2,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", color: theme.strong, flexShrink: 0 }}>
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>{children}</Box>
    </Box>
  );
});

const StatBox = memo(function StatBox({ value, label, color, theme }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 1.5,
        border: `1px solid ${theme.border}`,
        borderRadius: 2,
        color,
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 600,
          color: "inherit",
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          color: "inherit",
          overflowWrap: "anywhere",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
});

function CustomerDrawer({ open, onClose, customer, darkMode = false }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setCopied(false);
  }, [customer, open]);

  const theme = useMemo(
    () => ({
      card: darkMode ? "#292421" : "#FFFFFF",
      text: darkMode ? "#F5F0EB" : "#333333",
      strong: darkMode ? "#F5F0EB" : "#0F172A",
      muted: darkMode ? "#B8AAA0" : "#888888",
      email: darkMode ? "#D0C5BC" : "#555555",
      border: darkMode ? "#403832" : "#E3E8EF",
      soft: darkMode ? "#332D28" : BG,
    }),
    [darkMode],
  );

  const details = useMemo(
    () => (customer ? getDetails(customer) : null),
    [customer],
  );

  const initials = useMemo(() => {
    if (!details) return "";

    return details.name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [details]);

  const copyEmail = useCallback(async () => {
    if (!details || details.email === "-") return;

    try {
      await navigator.clipboard.writeText(details.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [details]);

  if (!customer || !details) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 360 },
            maxWidth: "100%",
            p: 3,
            bgcolor: theme.card,
            color: theme.text,
            backgroundImage: "none",
            boxSizing: "border-box",
          },
        },
      }}
    >
      <IconButton
        size="small"
        aria-label="Close"
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: theme.muted,
        }}
      >
        <Close fontSize="small" />
      </IconButton>

      {/* Customer profile */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, pr: 3 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: BROWN,
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: theme.strong,
              overflowWrap: "anywhere",
            }}
          >
            {details.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: theme.email,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              noWrap
            >
              {details.email}
            </Typography>

            <IconButton
              size="small"
              aria-label="Copy email"
              onClick={copyEmail}
              disabled={details.email === "-"}
              sx={{ color: BROWN, p: 0.25, flexShrink: 0 }}
            >
              {copied ? (
                <Check sx={{ fontSize: 16 }} />
              ) : (
                <ContentCopy sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Customer information */}
      <SectionLabel theme={theme}>Customer Info</SectionLabel>

      <InfoRow theme={theme} icon={<Phone sx={{ fontSize: 18 }} />}>
        {details.phone}
      </InfoRow>

      <InfoRow theme={theme} icon={<LocationOn sx={{ fontSize: 18 }} />}>
        {details.address}
      </InfoRow>

      {/* Activity */}
      <SectionLabel theme={theme}>Activity</SectionLabel>

      <Typography sx={{ fontSize: 14, mb: 1.5, color: theme.text }}>
        Registration: {details.registration}
      </Typography>

      <Typography sx={{ fontSize: 14, color: theme.text }}>
        Last purchase: {details.lastPurchase}
      </Typography>

      {/* Order counts */}
      <SectionLabel theme={theme}>Order overview</SectionLabel>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1.5,
        }}
      >
        <StatBox
          value={details.total}
          label="Total Orders"
          color={BROWN}
          theme={theme}
        />

        <StatBox
          value={details.completed}
          label="Completed"
          color={GREEN}
          theme={theme}
        />

        <StatBox
          value={details.canceled}
          label="Cancelled"
          color={RED}
          theme={theme}
        />
      </Box>
    </Drawer>
  );
}

export default memo(CustomerDrawer);
