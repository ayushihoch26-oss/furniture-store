import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  MenuItem,
  TextField,
  Popover,
  CircularProgress,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
  ChevronLeft,
  ChevronRight,
  FilterList,
  SwapVert,
  Search,
  VisibilityOutlined,
  FileDownloadOutlined,
  ReceiptLongOutlined,
  CreditCardOutlined,
  LocalShippingOutlined,
} from "@mui/icons-material";

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";

const TABS = [
  { label: "All invoices", value: "", count: "total" },
  { label: "Card", value: "card", count: "card" },
  { label: "Cash on delivery", value: "cod", count: "cod" },
];

const PAYMENT = {
  card: { label: "Card", Icon: CreditCardOutlined },
  cod: { label: "Cash on delivery", Icon: LocalShippingOutlined },
};

// "sortBy:sortOrder" -> label (same values the column headers use)
const SORT_OPTIONS = [
  ["date:desc", "Newest first"],
  ["date:asc", "Oldest first"],
  ["total:desc", "Total: high to low"],
  ["total:asc", "Total: low to high"],
  ["name:asc", "Customer: A to Z"],
  ["name:desc", "Customer: Z to A"],
  ["id:desc", "Invoice no: high to low"],
  ["id:asc", "Invoice no: low to high"],
  ["payment:asc", "Payment: A to Z"],
  ["payment:desc", "Payment: Z to A"],
];

const COLUMNS = "60px 120px minmax(200px, 2fr) 110px 110px 1.3fr 110px 100px";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n) => String(n).padStart(2, "0");
const makeIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const showDate = (value) => {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
};
const money = (value) => `$${(Number(value) || 0).toFixed(2)}`;

function Card({ children, theme }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      }}
    >
      {children}
    </Box>
  );
}

function SquareIconButton({ children, label, onClick, theme, active }) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        border: `1px solid ${active ? BROWN : theme.border}`,
        color: active ? BROWN : theme.iconButton,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      {children}
    </IconButton>
  );
}

// Clickable column title with an arrow for the active sort
function SortHead({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  const Arrow = sortOrder === "asc" ? ArrowUpward : ArrowDownward;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        p: 0,
        border: 0,
        bgcolor: "transparent",
        color: "inherit",
        font: "inherit",
        cursor: "pointer",
        "&:hover": { color: BROWN },
      }}
    >
      {label}
      <Arrow sx={{ fontSize: 14, opacity: active ? 1 : 0.25 }} />
    </Box>
  );
}

function RangeCalendar({ from, to, onChange, theme }) {
  const [view, setView] = useState(() => {
    const date = from ? new Date(`${from}T00:00:00`) : new Date();
    return { year: date.getFullYear(), month: date.getMonth() };
  });
  const [hover, setHover] = useState("");

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (step) =>
    setView((prev) => {
      const date = new Date(prev.year, prev.month + step, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  const pickDay = (value) => {
    if (!from || to) onChange(value, "");
    else if (value < from) onChange(value, from);
    else onChange(from, value);
  };

  const previewEnd = to || (from && hover > from ? hover : from);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          bgcolor: theme.soft,
          borderRadius: 2,
          py: 1,
          mb: 1.5,
          fontSize: 13,
          fontWeight: 600,
          color: from ? theme.text : theme.muted,
        }}
      >
        <span>{from ? showDate(from) : "Start date"}</span>
        <span>→</span>
        <span>{to ? showDate(to) : "End date"}</span>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <IconButton
          size="small"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
          sx={{ color: theme.text }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Typography fontSize={14} fontWeight={700}>
          {MONTHS[view.month]} {view.year}
        </Typography>
        <IconButton
          size="small"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
          sx={{ color: theme.text }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}
      >
        {WEEKDAYS.map((day) => (
          <Typography
            key={day}
            sx={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: theme.muted,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          rowGap: 0.25,
        }}
        onMouseLeave={() => setHover("")}
      >
        {cells.map((day, index) => {
          if (!day) return <Box key={`empty-${index}`} />;

          const value = makeIso(view.year, view.month, day);
          const isEdge = value === from || value === to;
          const inRange =
            Boolean(from && previewEnd) && value >= from && value <= previewEnd;

          return (
            <Box
              key={value}
              sx={{
                bgcolor: inRange && !isEdge ? theme.rangeBg : "transparent",
                borderRadius: 2,
              }}
            >
              <Button
                onClick={() => pickDay(value)}
                onMouseEnter={() => setHover(value)}
                disableElevation
                sx={{
                  minWidth: 0,
                  width: "100%",
                  height: 34,
                  p: 0,
                  fontSize: 13,
                  borderRadius: "50%",
                  fontWeight: isEdge ? 700 : 400,
                  bgcolor: isEdge ? BROWN : "transparent",
                  color: isEdge ? "#fff" : theme.text,
                  "&:hover": { bgcolor: isEdge ? BROWN_DARK : theme.dayHover },
                }}
              >
                {day}
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

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

  const [searchText, setSearchText] = useState(filters.search);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [minText, setMinText] = useState(minTotal);
  const [maxText, setMaxText] = useState(maxTotal);

  // Debounce typing: call the API 400ms after the user stops typing

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const search = searchText.trim();

      if (search !== filters.search) {
        onFiltersChange({ search });
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchText, filters.search, onFiltersChange]);

  const theme = {
    card: darkMode ? "#292421" : "#fff",
    text: darkMode ? "#F5F0EB" : "#222",
    headText: darkMode ? "#F5F0EB" : "#333",
    muted: darkMode ? "#B8AAA0" : "#777",
    iconButton: darkMode ? "#F5F0EB" : "#444",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : BROWN_LIGHT,
    tabText: darkMode ? "#B8AAA0" : "#555",
    tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
    pageActive: darkMode ? "#403832" : BROWN_LIGHT,
    rangeBg: darkMode ? "#403832" : BROWN_LIGHT,
    dayHover: darkMode ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)",
    rowDivider: darkMode ? "#403832" : "#eee",
  };

  const paperSx = darkMode
    ? { bgcolor: theme.card, color: theme.text, backgroundImage: "none" }
    : {};

  const fieldSx = {
    "& .MuiInputBase-root": { color: theme.text },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
    "& .MuiSvgIcon-root": { color: theme.muted },
  };

  const hasFilter = Boolean(fromDate || toDate || minTotal || maxTotal);

  const handleSort = (field) => {
    if (sortBy === field) {
      onFiltersChange({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      onFiltersChange({
        sortBy: field,
        sortOrder: field === "date" || field === "total" ? "desc" : "asc",
      });
    }
  };

  // Page buttons: 1 ... 4 5 [6] 7 8 ... 20
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2);
  const visiblePages = pageNumbers.reduce((result, n, i) => {
    if (i > 0 && n - pageNumbers[i - 1] > 1) result.push("...");
    result.push(n);
    return result;
  }, []);

  const from = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalItems);

  return (
    <Card theme={theme}>
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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
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
            onClick={(e) => {
              setMinText(minTotal);
              setMaxText(maxTotal);
              setFilterAnchor(e.currentTarget);
            }}
          >
            <FilterList fontSize="small" />
          </SquareIconButton>

          <Popover
            open={Boolean(filterAnchor)}
            anchorEl={filterAnchor}
            onClose={() => setFilterAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  p: 2.5,
                  width: 320,
                  maxWidth: "calc(100vw - 24px)",
                  borderRadius: 3,
                  mt: 1,
                  ...paperSx,
                },
              },
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              Filter Invoices
            </Typography>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Total amount ($)
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
              <TextField
                size="small"
                placeholder="Min"
                value={minText}
                onChange={(e) =>
                  setMinText(e.target.value.replace(/[^\d.]/g, ""))
                }
                inputProps={{ inputMode: "decimal" }}
                sx={fieldSx}
              />
              <TextField
                size="small"
                placeholder="Max"
                value={maxText}
                onChange={(e) =>
                  setMaxText(e.target.value.replace(/[^\d.]/g, ""))
                }
                inputProps={{ inputMode: "decimal" }}
                sx={fieldSx}
              />
            </Box>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Date Range
            </Typography>
            {filterAnchor && (
              <RangeCalendar
                from={fromDate}
                to={toDate}
                theme={theme}
                onChange={(start, end) =>
                  onFiltersChange({ fromDate: start, toDate: end })
                }
              />
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMinText("");
                  setMaxText("");
                  onFiltersChange({
                    fromDate: "",
                    toDate: "",
                    minTotal: "",
                    maxTotal: "",
                  });
                }}
                sx={{ color: BROWN, borderColor: BROWN, textTransform: "none" }}
              >
                Clear
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  onFiltersChange({ minTotal: minText, maxTotal: maxText });
                  setFilterAnchor(null);
                }}
                sx={{
                  bgcolor: BROWN,
                  textTransform: "none",
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Apply
              </Button>
            </Box>
          </Popover>

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
              gridTemplateColumns: COLUMNS,
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
            <SortHead
              label="Invoice"
              field="id"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortHead
              label="Customer"
              field="name"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <span>Order</span>
            <SortHead
              label="Date"
              field="date"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortHead
              label="Payment"
              field="payment"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <SortHead
              label="Total"
              field="total"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
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
                  gridTemplateColumns: COLUMNS,
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontWeight: 600,
                  }}
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: theme.muted,
                  }}
                >
                  <PayIcon sx={{ fontSize: 18, color: BROWN }} />
                  <Box component="span" sx={{ color: theme.text }}>
                    {item.paymentMethod === "card" && item.cardLast4
                      ? `•••• ${item.cardLast4}`
                      : pay.label}
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 700, color: theme.text }}
                  >
                    {money(item.total)}
                  </Typography>
                  {item.discount > 0 && (
                    <Typography
                      sx={{ fontSize: 11, color: theme.muted }}
                      noWrap
                    >
                      {item.couponCode ? `${item.couponCode}: ` : "Discount: "}-
                      {money(item.discount)}
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
              sx={{
                py: 4,
                textAlign: "center",
                fontSize: 13,
                color: theme.muted,
              }}
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
          sx={{
            height: 36,
            color: theme.text,
            borderColor: theme.border,
            textTransform: "none",
            "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
          }}
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
                  typeof number === "number" &&
                  onFiltersChange({ page: number })
                }
                sx={{
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor:
                    page === number ? theme.pageActive : theme.border,
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
              "& .MuiInputBase-root": {
                color: theme.text,
                fontSize: 13,
                height: 36,
              },
            }}
          >
            {[10, 20, 50].map((n) => (
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
          sx={{
            height: 36,
            color: theme.text,
            borderColor: theme.border,
            textTransform: "none",
            "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
          }}
        >
          Next
        </Button>
      </Box>
    </Card>
  );
}
