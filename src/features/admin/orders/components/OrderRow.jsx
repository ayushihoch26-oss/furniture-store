// components/OrderRow.jsx
// ONE row of the table.
import { Box, Checkbox, IconButton, Typography } from "@mui/material";
import { DeleteOutlined, EditOutlined, Inventory2Outlined, VisibilityOutlined } from "@mui/icons-material";
import { COLORS, STATUS_STYLE, TABLE_COLUMNS } from "../constants/orderConstants";
import {
  formatDate, formatMoney, getCustomerName, getOrderNumber,
  getProductSummary, normalizePaymentStatus,
} from "../utils/orderHelpers";

export default function OrderRow({ order, number, checked, onToggle, onAction, theme }) {
  const status = order.status || "Pending";
  const { color, Icon } = STATUS_STYLE[status] || STATUS_STYLE.Pending;
  const payment = normalizePaymentStatus(order.paymentStatus);
  const product = getProductSummary(order);

  const ellipsis = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

  return (
    <Box
      sx={{
        display: "grid", gridTemplateColumns: TABLE_COLUMNS, gap: 1, alignItems: "center",
        px: 1, py: 1.25, fontSize: 13, color: theme.text,
        borderBottom: `1px solid ${theme.border}`,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Checkbox size="small" checked={checked} onChange={onToggle}
          sx={{ p: 0.5, "&.Mui-checked": { color: COLORS.brown } }} />
        <span>{number}</span>
      </Box>

      <span>{getOrderNumber(order)}</span>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: theme.soft, color: COLORS.brown, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Inventory2Outlined sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.brown, ...ellipsis }}>
            {getCustomerName(order)}
          </Typography>
          <Typography sx={{ fontSize: 13, ...ellipsis }} title={product}>{product}</Typography>
        </Box>
      </Box>

      <span>{formatDate(order.createdAt || order.date)}</span>
      <span>{formatMoney(order.total ?? order.price)}</span>

      <span style={{ color: payment === "Paid" ? COLORS.green : COLORS.red }}>
        ● <span style={{ color: theme.text }}>{payment}</span>
      </span>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color }}>
        <Icon sx={{ fontSize: 20 }} />
        <span>{status}</span>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton size="small" title="View" onClick={() => onAction(order, "view")} sx={{ color: COLORS.brown }}><VisibilityOutlined fontSize="small" /></IconButton>
        <IconButton size="small" title="Edit" onClick={() => onAction(order, "edit")} sx={{ color: COLORS.green }}><EditOutlined fontSize="small" /></IconButton>
        <IconButton size="small" title="Delete" onClick={() => onAction(order, "delete")} sx={{ color: COLORS.red }}><DeleteOutlined fontSize="small" /></IconButton>
      </Box>
    </Box>
  );
}
