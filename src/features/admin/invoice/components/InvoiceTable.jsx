import { useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  FilterList,
  SwapVert,
  Search,
  VisibilityOutlined,
  FileDownloadOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";

import {
  BROWN,
  DESC_FIRST_FIELDS,
  PAGE_SIZE_OPTIONS,
  PAYMENT,
  SORT_OPTIONS,
  TABLE_COLUMNS,
  TABS,
} from "../constants/invoice.constants";
import useDebouncedSearch from "../hooks/useDebouncedSearch";
import useFilterPopover from "../hooks/useFilterPopover";
import { buildVisiblePages, formatMoneyFixed } from "../utils/invoice.utils";
import { getFieldSx, getPaperSx, getTableTheme } from "../utils/invoice.theme";
import TableCard from "./TableCard";
import SquareIconButton from "./SquareIconButton";
import SortHead from "./SortHead";
import InvoiceFilterPopover from "./InvoiceFilterPopover";

const SORTABLE_HEADS = [
  { label: "Invoice", field: "id" },
  { label: "Customer", field: "name" },
  null, // Order (not sortable)
  { label: "Date", field: "date" },
  { label: "Payment", field: "payment" },
  { label: "Total", field: "total" },
];

/**
 * Controlled table: the parent owns `filters` and calls the API.
 * filters = { page, limit, search, paymentMethod, fromDate, toDate,
 *             minTotal, maxTotal, sortBy, sortOrder }
 * onFiltersChange(patch) merges the patch (parent resets page to 1 unless patch has page).
 */
export default function InvoiceTable({
  invoices = [],
  counts = {},
  filters,
  onFiltersChange,
  totalItems = 0,
  totalPages = 1,
  loading = false,
  downloadingId = null,
  onView,
  onDownload,
  darkMode = false,
}) {
  const {
    page,
    limit,
    paymentMethod,
    fromDate,
    toDate,
    minTotal,
    maxTotal,
    sortBy,
    sortOrder,
  } = filters;

  const { searchText, setSearchText } = useDebouncedSearch(
    filters.search,
    onFiltersChange,
  );
  const popover = useFilterPopover({ minTotal, maxTotal, onFiltersChange });

  const theme = getTableTheme(darkMode);
  const paperSx = getPaperSx(darkMode, theme);
  const fieldSx = getFieldSx(theme);

  const hasFilter = Boolean(fromDate || toDate || minTotal || maxTotal);
  const visiblePages = useMemo(
    () => buildVisiblePages(page, totalPages),
    [page, totalPages],
  );

  const from = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalItems);

  const handleSort = (field) => {
    if (sortBy === field) {
      onFiltersChange({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      onFiltersChange({
        sortBy: field,
        sortOrder: DESC_FIRST_FIELDS.includes(field) ? "desc" : "asc",
      });
    }
  };

  const outlinedNavSx = {
    height: 36,
    color: theme.text,
    borderColor: theme.border,
    textTransform: "none",
    "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
  };

  return (
    <TableCard theme={theme}>
      {/* Tabs + search + filter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            bgcolor: theme.soft,
            p: 0.5,
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => {
            const active = paymentMethod === tab.value;
            return (
              <Button
                key={tab.label}
                onClick={() => onFiltersChange({ paymentMethod: tab.value })}
                disableElevation
                sx={{
                  minWidth: 0,
                  height: 34,
                  px: 2,
                  fontSize: 13,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  borderRadius: 1.5,
                  bgcolor: active ? BROWN : "transparent",
                  color: active ? "#fff" : theme.tabText,
                  "&:hover": { bgcolor: active ? BROWN : theme.tabHover },
                }}
              >
                {tab.label}
                <Box component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                  ({counts[tab.count] ?? 0})
                </Box>
              </Button>
            );
          })}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: theme.soft,
              borderRadius: 2,
              px: 1.5,
              height: 40,
              width: { xs: 170, sm: 270 },
            }}
          >
            <InputBase
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search invoice, customer, email..."
              inputProps={{ "aria-label": "Search invoices" }}
              sx={{
                flex: 1,
                fontSize: 13,
                color: theme.text,
                "& input::placeholder": { color: theme.muted, opacity: 1 },
              }}
            />
            <Search sx={{ fontSize: 20, color: theme.muted }} />
          </Box>

          <SquareIconButton
            label="Filter invoices"
            theme={theme}
            active={hasFilter}
            onClick={popover.open}
          >
            <FilterList fontSize="small" />
          </SquareIconButton>

          <InvoiceFilterPopover
            popover={popover}
            fromDate={fromDate}
            toDate={toDate}
            onFiltersChange={onFiltersChange}
            theme={theme}
            paperSx={paperSx}
            fieldSx={fieldSx}
          />

          <TextField
            select
            size="small"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split(":");
              onFiltersChange({ sortBy: by, sortOrder: order });
            }}
            slotProps={{
              select: {
                IconComponent: SwapVert,
                MenuProps: { slotProps: { paper: { sx: paperSx } } },
              },
            }}
            aria-label="Sort invoices"
            sx={{
              width: 200,
              ...fieldSx,
              "& .MuiInputBase-root": {
                color: theme.text,
                fontSize: 13,
                height: 40,
                bgcolor: theme.soft,
              },
              "& .MuiOutlinedInput-notchedOutline": { border: 0 },
            }}
          >
            {SORT_OPTIONS.map(([value, label]) => (
              <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Table */}
      <Box
        sx={{
          overflowX: "auto",
          opacity: loading ? 0.6 : 1,
          transition: "opacity .2s",
        }}
      >
        <Box sx={{ minWidth: 960 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: TABLE_COLUMNS,
              gap: 1,
              alignItems: "center",
              p: 1.5,
              bgcolor: theme.header,
              borderRadius: 2,
              fontSize: 13,
              fontWeight: 600,
              color: theme.headText,
            }}
          >
            <span>No.</span>
            {SORTABLE_HEADS.map((head, index) =>
              head ? (
                <SortHead
                  key={head.field}
                  label={head.label}
                  field={head.field}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              ) : (
                <span key={`static-${index}`}>Order</span>
              ),
            )}
            <span>Actions</span>
          </Box>

          {invoices.map((item, index) => {
            const pay = PAYMENT[item.paymentMethod] || PAYMENT.card;
            const PayIcon = pay.Icon;

            return (
              <Box
                key={item.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: TABLE_COLUMNS,
                  gap: 1,
                  alignItems: "center",
                  px: 1.5,
                  py: 1.25,
                  fontSize: 13,
                  borderBottom: `1px solid ${theme.rowDivider}`,
                  color: theme.text,
                }}
              >
                <span>{(page - 1) * limit + index + 1}</span>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 600 }}
                >
                  <ReceiptLongOutlined sx={{ fontSize: 18, color: BROWN }} />
                  {item.invoiceNumber}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, color: theme.text }} noWrap>
                    {item.customerName}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: theme.muted }} noWrap>
                    {item.email}
                  </Typography>
                </Box>

                <span>{item.orderNumber}</span>
                <span>{item.date}</span>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 0.75, color: theme.muted }}
                >
                  <PayIcon sx={{ fontSize: 18, color: BROWN }} />
                  <Box component="span" sx={{ color: theme.text }}>
                    {item.paymentMethod === "card" && item.cardLast4
                      ? `•••• ${item.cardLast4}`
                      : pay.label}
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.text }}>
                    {formatMoneyFixed(item.total)}
                  </Typography>
                  {item.discount > 0 && (
                    <Typography sx={{ fontSize: 11, color: theme.muted }} noWrap>
                      {item.couponCode ? `${item.couponCode}: ` : "Discount: "}-
                      {formatMoneyFixed(item.discount)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    title="View invoice"
                    aria-label="View invoice"
                    onClick={() => onView?.(item)}
                    sx={{ color: BROWN }}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Download PDF"
                    aria-label="Download PDF"
                    disabled={downloadingId === item.id}
                    onClick={() => onDownload?.(item)}
                    sx={{ color: BROWN }}
                  >
                    {downloadingId === item.id ? (
                      <CircularProgress size={18} sx={{ color: BROWN }} />
                    ) : (
                      <FileDownloadOutlined fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          {invoices.length === 0 && (
            <Typography
              sx={{ py: 4, textAlign: "center", fontSize: 13, color: theme.muted }}
            >
              {loading ? "Loading..." : "No invoices found"}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          disabled={page <= 1}
          onClick={() => onFiltersChange({ page: page - 1 })}
          sx={outlinedNavSx}
        >
          Previous
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {visiblePages.map((number, index) => (
              <Button
                key={`${number}-${index}`}
                disabled={number === "..."}
                onClick={() =>
                  typeof number === "number" && onFiltersChange({ page: number })
                }
                sx={{
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: page === number ? theme.pageActive : theme.border,
                  bgcolor: page === number ? theme.pageActive : "transparent",
                  color: page === number ? BROWN : theme.text,
                  fontWeight: page === number ? 700 : 400,
                }}
              >
                {number}
              </Button>
            ))}
          </Box>

          <Typography sx={{ fontSize: 12, color: theme.muted }}>
            {from}-{to} of {totalItems}
          </Typography>

          <TextField
            select
            size="small"
            value={limit}
            onChange={(e) => onFiltersChange({ limit: Number(e.target.value) })}
            slotProps={{
              select: { MenuProps: { slotProps: { paper: { sx: paperSx } } } },
            }}
            sx={{
              width: 100,
              ...fieldSx,
              "& .MuiInputBase-root": { color: theme.text, fontSize: 13, height: 36 },
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>
                {n} / page
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={page >= totalPages}
          onClick={() => onFiltersChange({ page: page + 1 })}
          sx={outlinedNavSx}
        >
          Next
        </Button>
      </Box>
    </TableCard>
  );
}
