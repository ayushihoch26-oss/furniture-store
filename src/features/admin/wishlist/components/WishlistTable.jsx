import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  DeleteOutlined,
  Refresh,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";

import useWishlistTable from "../hooks/useWishlistTable";
import { PAGE_SIZE } from "../services/wishlist.service";

const BROWN = "#947458";
const RED = "#E5484D";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB");
}

function formatPrice(value) {
  const price = Number(value);
  return Number.isFinite(price)
    ? `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
}

export default function WishlistTable({
  setWishlists,
  selected = [],
  setSelected,
  page,
  setPage,
  darkMode = false,
  onRefresh,
}) {
  const table = useWishlistTable({
    setWishlists,
    selected,
    setSelected,
    page,
    setPage,
  });

  const theme = {
    card: darkMode ? "#292421" : "#fff",
    text: darkMode ? "#F5F0EB" : "#222",
    muted: darkMode ? "#B8AAA0" : "#777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : "#F7F7F7",
    header: darkMode ? "#332D28" : "#F3ECE5",
  };

  const allSelected =
    table.visibleRows.length > 0 &&
    table.visibleRows.every((item) => selected.includes(item.id));

  const someSelected =
    table.visibleRows.some((item) => selected.includes(item.id));

  const from =
    table.total === 0
      ? 0
      : (table.serverPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(table.serverPage * PAGE_SIZE, table.total);

  function refresh() {
    table.refresh();
    onRefresh?.();
  }

  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            height: 40,
            borderRadius: 1,
            bgcolor: theme.soft,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search sx={{ color: theme.muted, mr: 1 }} />
          <InputBase
            placeholder="Search wishlist"
            value={table.search}
            onChange={(event) => table.setSearch(event.target.value)}
            sx={{ flex: 1, color: theme.text }}
          />
        </Box>

        <TextField
          size="small"
          placeholder="Customer ID"
          value={table.userId}
          onChange={(event) => table.setUserId(event.target.value)}
        />
        <TextField
          size="small"
          placeholder="Product ID"
          value={table.productId}
          onChange={(event) => table.setProductId(event.target.value)}
        />
        <TextField
          select
          size="small"
          value={table.sort}
          onChange={(event) => table.setSort(event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="default">Default order</MenuItem>
          <MenuItem value="asc">Price: Low to High</MenuItem>
          <MenuItem value="desc">Price: High to Low</MenuItem>
        </TextField>
        <IconButton
          onClick={refresh}
          title="Refresh"
          sx={{ border: `1px solid ${theme.border}`, color: BROWN }}
        >
          <Refresh />
        </IconButton>
        {(table.search ||
          table.userId ||
          table.productId ||
          table.sort !== "default") && (
            <Button
              onClick={table.clearFilters}
              sx={{ color: BROWN, textTransform: "none" }}
            >
              Clear
            </Button>
          )}
      </Box>

      {table.error && (
        <Alert
          severity="error"
          onClose={() => table.setError("")}
          sx={{ mb: 2 }}
        >
          {table.error}
        </Alert>
      )}

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{ bgcolor: theme.header, borderColor: theme.border }}
              >
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={table.toggleAll}
                  sx={{ "&.Mui-checked": { color: BROWN } }}
                />
              </TableCell>
              {[
                "No.",
                "Wishlist ID",
                "Customer",
                "Product",
                "Added Date",
                "Price",
                "Product ID",
                "Actions",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  sx={{
                    color: theme.text,
                    bgcolor: theme.header,
                    borderColor: theme.border,
                    fontWeight: 700,
                  }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {table.loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} sx={{ color: BROWN }} />
                </TableCell>
              </TableRow>
            ) : table.visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ color: theme.muted, py: 4 }}
                >
                  No wishlist records found
                </TableCell>
              </TableRow>
            ) : (
              table.visibleRows.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selected.includes(item.id)}
                      onChange={() => table.toggleOne(item.id)}
                      sx={{ "&.Mui-checked": { color: BROWN } }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {(table.serverPage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>#{item.id}</TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    <Typography sx={{ fontSize: 13 }}>
                      {item.customer || "Guest"}
                    </Typography>
                    {item.email && (
                      <Typography sx={{ fontSize: 12, color: theme.muted }}>
                        {item.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {item.productName || "Unknown product"}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {formatDate(item.addedAt)}
                  </TableCell>
                  <TableCell sx={{ color: theme.text, fontWeight: 600 }}>
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell sx={{ color: theme.text }}>
                    {item.productId ?? "—"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      title="View"
                      onClick={() => table.openAction(item, "view")}
                      sx={{ color: BROWN }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      title="Delete"
                      onClick={() => table.openAction(item, "delete")}
                      sx={{ color: RED }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          disabled={table.loading || table.serverPage <= 1}
          onClick={() => setPage(Math.max(1, table.serverPage - 1))}
          sx={{ color: theme.text, borderColor: theme.border }}
        >
          Previous
        </Button>
        <Typography sx={{ color: theme.muted, fontSize: 12 }}>
          Showing {from}-{to} of {table.total} items
        </Typography>
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={
            table.loading || table.serverPage >= table.totalPages
          }
          onClick={() =>
            setPage(Math.min(table.totalPages, table.serverPage + 1))
          }
          sx={{ color: theme.text, borderColor: theme.border }}
        >
          Next
        </Button>
      </Box>

      <Dialog
        open={Boolean(table.action)}
        onClose={table.closeAction}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {table.action === "view"
            ? "Wishlist Details"
            : "Delete Wishlist Item"}
        </DialogTitle>
        <DialogContent dividers>
          {table.selectedWishlist &&
            (table.action === "view" ? (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Typography>
                  Wishlist ID: #{table.selectedWishlist.id}
                </Typography>
                <Typography>
                  Customer: {table.selectedWishlist.customer || "Guest"}
                </Typography>
                <Typography>
                  Email: {table.selectedWishlist.email || "—"}
                </Typography>
                <Typography>
                  Product:{" "}
                  {table.selectedWishlist.productName || "Unknown product"}
                </Typography>
                <Typography>
                  Product ID: {table.selectedWishlist.productId ?? "—"}
                </Typography>
                <Typography>
                  Added Date: {formatDate(table.selectedWishlist.addedAt)}
                </Typography>
                <Typography>
                  Price: {formatPrice(table.selectedWishlist.price)}
                </Typography>
              </Box>
            ) : (
              <Typography>
                Delete wishlist item #{table.selectedWishlist.id}? This action
                cannot be undone.
              </Typography>
            ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={table.closeAction}
            disabled={table.deleting}
            sx={{ color: theme.muted }}
          >
            Cancel
          </Button>
          {table.action === "delete" && (
            <Button
              variant="contained"
              onClick={table.removeWishlist}
              disabled={table.deleting}
              sx={{ bgcolor: RED, "&:hover": { bgcolor: "#c9363b" } }}
            >
              {table.deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
