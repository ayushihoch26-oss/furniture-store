// components/OrderDialog.jsx
// Popup used for View, Edit and Delete.
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { COLORS, ORDER_STATUSES, PAYMENT_OPTIONS } from "../constants/orderConstants";
import { formatDate, formatMoney, getOrderNumber, normalizePaymentStatus } from "../utils/orderHelpers";

const TITLES = { view: "Order Details", edit: "Edit Order", delete: "Delete Order" };

// ----- the 3 different bodies -----
function ViewBody({ order, theme }) {
  const rows = [
    ["Order ID", getOrderNumber(order)],
    ["Customer", [order.firstName, order.lastName].filter(Boolean).join(" ") || "—"],
    ["Email", order.email || "—"],
    ["Phone", order.phone || "—"],
    ["Address", [order.street, order.city, order.state, order.zip].filter(Boolean).join(", ") || "—"],
    ["Date", formatDate(order.createdAt)],
    ["Total", formatMoney(order.total)],
    ["Payment", normalizePaymentStatus(order.paymentStatus)],
    ["Status", order.status || "Pending"],
  ];
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      {rows.map(([label, value]) => (
        <Box key={label} sx={{ display: "flex", justifyContent: "space-between", gap: 2, borderBottom: `1px solid ${theme.border}`, pb: 0.75 }}>
          <Typography sx={{ color: theme.muted, fontSize: 12 }}>{label}</Typography>
          <Typography fontWeight={600} fontSize={12} textAlign="right">{value}</Typography>
        </Box>
      ))}

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.brown, mt: 1 }}>
        Ordered Items ({items.length})
      </Typography>
      {items.length === 0 && <Typography fontSize={12}>No items found.</Typography>}
      {items.map((item, i) => (
        <Box key={item.id || i} sx={{ p: 1, borderRadius: 1.5, bgcolor: theme.soft, display: "flex", justifyContent: "space-between" }}>
          <Typography fontSize={12}>
            {item.name || item.productName || "Product"} — Qty {item.quantity || 1}
          </Typography>
          <Typography fontSize={12} fontWeight={700}>
            {formatMoney((item.price || 0) * (item.quantity || 1))}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function EditBody({ order, onChange }) {
  return (
    <Box sx={{ display: "grid", gap: 1.5, py: 1 }}>
      <TextField fullWidth size="small" label="Order ID" value={getOrderNumber(order)} disabled />
      <TextField select fullWidth size="small" label="Payment Status"
        value={normalizePaymentStatus(order.paymentStatus)}
        onChange={(e) => onChange("paymentStatus", e.target.value)}>
        {PAYMENT_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
      </TextField>
      <TextField select fullWidth size="small" label="Order Status"
        value={order.status || "Pending"}
        onChange={(e) => onChange("status", e.target.value)}>
        {ORDER_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
    </Box>
  );
}

// ----- the dialog itself -----
export default function OrderDialog({ actions, theme }) {
  const { action, selectedOrder: order, saving, closeAction, changeField, saveOrder, removeOrder } = actions;

  return (
    <Dialog open={Boolean(action)} onClose={closeAction} fullWidth maxWidth="sm">
      <DialogTitle>{TITLES[action]}</DialogTitle>

      <DialogContent dividers>
        {order && action === "view" && <ViewBody order={order} theme={theme} />}
        {order && action === "edit" && <EditBody order={order} onChange={changeField} />}
        {order && action === "delete" && (
          <Typography>Are you sure you want to delete order {getOrderNumber(order)}? This cannot be undone.</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={closeAction} disabled={saving}>Close</Button>
        {action === "edit" && (
          <Button variant="contained" onClick={saveOrder} disabled={saving} sx={{ bgcolor: COLORS.brown }}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        )}
        {action === "delete" && (
          <Button variant="contained" onClick={removeOrder} disabled={saving} sx={{ bgcolor: COLORS.red }}>
            {saving ? "Deleting…" : "Delete"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
