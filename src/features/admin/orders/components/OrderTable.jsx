// components/OrderTable.jsx
// Shows filters + table + pagination + dialog. It does NOT fetch anything:
// all data and actions come in through props from the page.
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { COLORS, PAGE_SIZE, TABLE_COLUMNS } from "../constants/orderConstants";
import OrderFilters from "./OrderFilters";
import OrderRow from "./OrderRow";
import OrderPagination from "./OrderPagination";
import OrderDialog from "./OrderDialog";

const HEADINGS = ["Select", "Order ID", "Product", "Date", "Price", "Payment", "Status", "Actions"];

export default function OrderTable({ orders, actions, theme }) {
  const { rows, loading, page, setPage, totalPages } = orders;

  return (
    <Box sx={{ bgcolor: theme.card, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: "10px", p: 2.5 }}>
      {actions.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => actions.setSuccess("")}>{actions.success}</Alert>
      )}
      {(orders.error || actions.error) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => { orders.setError(""); actions.setError(""); }}>
          {orders.error || actions.error}
        </Alert>
      )}

      <OrderFilters orders={orders} theme={theme} />

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 900 }}>
          {/* header */}
          <Box sx={{ display: "grid", gridTemplateColumns: TABLE_COLUMNS, gap: 1, p: 1.5, bgcolor: theme.header, border: `1px solid ${theme.border}`, fontSize: 13, fontWeight: 600 }}>
            {HEADINGS.map((h) => <span key={h}>{h}</span>)}
          </Box>

          {/* body: loading / empty / rows */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, py: 5 }}>
              <CircularProgress size={22} sx={{ color: COLORS.brown }} />
              <Typography fontSize={13}>Loading orders…</Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: "center", fontSize: 13, color: theme.muted }}>No orders found</Typography>
          ) : (
            rows.map((order, index) => (
              <OrderRow
                key={order.id ?? index}
                order={order}
                number={(page - 1) * PAGE_SIZE + index + 1}
                checked={actions.isSelected(order.id)}
                onToggle={() => actions.toggleSelected(order.id)}
                onAction={actions.openAction}
                theme={theme}
              />
            ))
          )}
        </Box>
      </Box>

      <OrderPagination page={page} totalPages={totalPages} loading={loading} onChange={setPage} theme={theme} />
      <OrderDialog actions={actions} theme={theme} />
    </Box>
  );
}
