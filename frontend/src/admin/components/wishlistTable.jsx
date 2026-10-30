import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Checkbox,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Search,
  VisibilityOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  Refresh,
} from "@mui/icons-material";

const BROWN = "#947458";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const RED = "#E5484D";
const API_BASE = "http://localhost:5000/api/wishlist";
const PAGE_SIZE = 8;

const SORTS = [
  { label: "Default order", value: "default" },
  { label: "Price: Low to High", value: "asc" },
  { label: "Price: High to Low", value: "desc" },
];

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("adminToken");

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
};

const moneyLabel = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
};

const getErrorMessage = (body, fallback) =>
  body?.message || body?.error || fallback;

// Page buttons, e.g. 1 2 3 4 5 .... 24  (same logic as ProductTable)
const getPageList = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 4) return [1, 2, 3, 4, 5, "start-gap", totalPages];

  if (page >= totalPages - 3) {
    return [
      1,
      "end-gap",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "start-gap", page - 1, page, page + 1, "end-gap", totalPages];
};

function ProductImage({ src, name, theme }) {
  const box = {
    width: 40,
    height: 40,
    borderRadius: 1.5,
    flexShrink: 0,
    border: `1px solid ${theme.border}`,
  };

  if (!src) {
    return (
      <Box
        sx={{
          ...box,
          bgcolor: theme.soft,
          color: BROWN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FavoriteBorderOutlined fontSize="small" />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={name || ""}
      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      sx={{ ...box, objectFit: "cover" }}
    />
  );
}

export default function WishlistTable({
  wishlists = [],
  setWishlists,
  selected = [],
  setSelected,
  page,
  setPage,
  darkMode = false,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [serverPage, setServerPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Server-side filters (applied) and what the user is typing (draft)
  const [filters, setFilters] = useState({ userId: "", productId: "" });
  const [draftFilters, setDraftFilters] = useState({
    userId: "",
    productId: "",
  });

  const theme = {
    card: darkMode ? "#292421" : "#fff",
    text: darkMode ? "#F5F0EB" : "#222",
    muted: darkMode ? "#B8AAA0" : "#777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : BROWN_LIGHT,
    pageActive: darkMode ? "#403832" : BROWN_LIGHT,
    dialogDivider: darkMode ? "#403832" : "rgba(0, 0, 0, 0.12)",
    rowDivider: darkMode ? "#403832" : "#eee",
  };

  const paperSx = darkMode
    ? { bgcolor: theme.card, color: theme.text, backgroundImage: "none" }
    : {};

  const cellSx = { color: theme.text, borderColor: theme.border, fontSize: 13 };
  const headSx = { ...cellSx, fontWeight: 700, bgcolor: theme.header };
  const navButtonSx = {
    height: 36,
    color: theme.text,
    borderColor: theme.border,
    textTransform: "none",
    "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
    "&.Mui-disabled": { color: theme.muted, borderColor: theme.border },
  };
  const inputSx = {
    "& .MuiInputBase-root": { color: theme.text, height: 40 },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
    "& .MuiSvgIcon-root": { color: theme.muted },
    "& .MuiInputLabel-root": { color: theme.muted },
  };

  const requestHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchWishlists = useCallback(
    async (requestedPage = 1) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(requestedPage),
          limit: String(PAGE_SIZE),
        });
        if (filters.userId.trim()) params.set("userId", filters.userId.trim());
        if (filters.productId.trim())
          params.set("productId", filters.productId.trim());

        // The backend controller reads req.query, so pagination and filters belong in the URL.
        const response = await fetch(
          `${API_BASE}/admin/list?${params.toString()}`,
          {
            method: "POST",
            headers: requestHeaders(),
          },
        );
        const body = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(
            getErrorMessage(body, `Request failed (${response.status})`),
          );

        const records = Array.isArray(body)
          ? body
          : Array.isArray(body?.wishlists)
            ? body.wishlists
            : Array.isArray(body?.data?.wishlists)
              ? body.data.wishlists
              : [];

        const responseTotal = Number(
          body?.total ?? body?.data?.total ?? records.length,
        );
        const responsePage =
          Number(body?.page ?? body?.data?.page ?? requestedPage) ||
          requestedPage;

        setWishlists?.(records);
        setTotal(
          Number.isFinite(responseTotal) ? responseTotal : records.length,
        );
        setServerPage(responsePage);
        setPage?.(responsePage);

        // Remove selections that are no longer present on the current page.
        const visibleIds = new Set(records.map((row) => String(row.id)));
        setSelected?.((previous) =>
          (previous || []).filter((id) => visibleIds.has(String(id))),
        );
      } catch (err) {
        setError(err.message || "Unable to load wishlist records.");
        setWishlists?.([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [filters, setWishlists, setPage, setSelected],
  );

  useEffect(() => {
    // eslint-disable-next-line
    fetchWishlists(Number(page) || 1);
  }, [fetchWishlists, page]);

  // Apply typed User ID / Product ID filters after a short pause, back on page 1
  useEffect(() => {
    const next = {
      userId: draftFilters.userId.trim(),
      productId: draftFilters.productId.trim(),
    };
    if (next.userId === filters.userId && next.productId === filters.productId)
      return undefined;

    const timer = setTimeout(() => {
      setFilters(next);
      setPage?.(1);
      setServerPage(1);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftFilters]);

  const rows = Array.isArray(wishlists) ? wishlists : [];

  const sortedRows =
    sort === "default"
      ? rows
      : [...rows].sort((a, b) => {
          const priceA = Number(a.price ?? 0);
          const priceB = Number(b.price ?? 0);
          return sort === "asc" ? priceA - priceB : priceB - priceA;
        });

  const visibleRows = sortedRows.filter((item) => {
    const haystack = [
      item.id,
      item.userId,
      item.customer,
      item.email,
      item.productId,
      item.productName,
      item.price,
      item.addedAt,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Number(serverPage || page || 1), totalPages);

  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  const isSelected = (id) => selected.some((x) => String(x) === String(id));

  const allSelected =
    visibleRows.length > 0 && visibleRows.every((item) => isSelected(item.id));
  const someSelected = visibleRows.some((item) => isSelected(item.id));

  const hasFilters =
    search ||
    sort !== "default" ||
    draftFilters.userId ||
    draftFilters.productId;

  const toggleOne = (id) => {
    setSelected?.((previous) => {
      const current = previous || [];
      return current.some((item) => String(item) === String(id))
        ? current.filter((item) => String(item) !== String(id))
        : [...current, id];
    });
  };

  const toggleAll = () => {
    const visibleIds = visibleRows.map((item) => item.id);
    setSelected?.((previous) => {
      const current = previous || [];
      return allSelected
        ? current.filter(
            (id) =>
              !visibleIds.some((visible) => String(visible) === String(id)),
          )
        : [
            ...new Map(
              [...current, ...visibleIds].map((id) => [String(id), id]),
            ).values(),
          ];
    });
  };

  const openAction = (item, type) => {
    setSelectedWishlist(item);
    setAction(type);
  };

  const closeAction = () => {
    setSelectedWishlist(null);
    setAction("");
  };

  const clearFilters = () => {
    const empty = { userId: "", productId: "" };
    setDraftFilters(empty);
    setFilters(empty);
    setSearch("");
    setSort("default");
    setPage?.(1);
    setServerPage(1);
  };

  const deleteWishlist = async () => {
    if (!selectedWishlist?.id) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/admin/delete/${selectedWishlist.id}`,
        {
          method: "POST",
          headers: requestHeaders(),
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          getErrorMessage(body, "Unable to delete wishlist item."),
        );

      const nextTotal = Math.max(0, total - 1);
      const nextPage =
        rows.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setSelected?.((previous) =>
        (previous || []).filter(
          (id) => String(id) !== String(selectedWishlist.id),
        ),
      );
      closeAction();
      setTotal(nextTotal);
      setPage?.(nextPage);
      setServerPage(nextPage);
      await fetchWishlists(nextPage);
      onRefresh?.();
    } catch (err) {
      setError(err.message || "Unable to delete wishlist item.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        minWidth: 0,
      }}
    >
      {/* Search + filters */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            height: 40,
            borderRadius: 1,
            bgcolor: theme.soft,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search sx={{ color: theme.muted, fontSize: 20 }} />
          <InputBase
            placeholder="Search by customer, product or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: 13, color: theme.text }}
          />
        </Box>

        <TextField
          size="small"
          placeholder="Customer ID"
          value={draftFilters.userId}
          onChange={(e) =>
            setDraftFilters((prev) => ({ ...prev, userId: e.target.value }))
          }
          sx={{ ...inputSx, width: 130 }}
        />

        <TextField
          size="small"
          placeholder="Product ID"
          value={draftFilters.productId}
          onChange={(e) =>
            setDraftFilters((prev) => ({ ...prev, productId: e.target.value }))
          }
          sx={{ ...inputSx, width: 130 }}
        />

        <TextField
          select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          sx={{ ...inputSx, minWidth: 170 }}
        >
          {SORTS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>

        <IconButton
          title="Refresh"
          onClick={() => fetchWishlists(currentPage)}
          sx={{
            width: 40,
            height: 40,
            border: `1px solid ${theme.border}`,
            borderRadius: 1,
            color: BROWN,
          }}
        >
          <Refresh />
        </IconButton>

        {hasFilters && (
          <Button
            onClick={clearFilters}
            sx={{ textTransform: "none", color: BROWN, height: 40 }}
          >
            Clear filters
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={headSx}>
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={toggleAll}
                  sx={{
                    color: theme.muted,
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: BROWN,
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={headSx}>No.</TableCell>
              <TableCell sx={headSx}>Wishlist ID</TableCell>
              <TableCell sx={headSx}>Customer</TableCell>
              <TableCell sx={headSx}>Product</TableCell>
              <TableCell sx={headSx}>Item</TableCell>
              <TableCell sx={headSx}>Added Date</TableCell>
              <TableCell sx={headSx}>Price</TableCell>
              <TableCell sx={headSx}>Product ID</TableCell>
              <TableCell sx={headSx}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={cellSx}>
                  <CircularProgress size={28} sx={{ color: BROWN, my: 3 }} />
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  align="center"
                  sx={{ ...cellSx, py: 4, color: theme.muted }}
                >
                  {error
                    ? "Wishlist records could not be loaded."
                    : "No wishlist records found"}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell padding="checkbox" sx={cellSx}>
                    <Checkbox
                      size="small"
                      checked={isSelected(item.id)}
                      onChange={() => toggleOne(item.id)}
                      sx={{
                        color: theme.muted,
                        "&.Mui-checked": { color: BROWN },
                      }}
                    />
                  </TableCell>

                  <TableCell sx={cellSx}>
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>

                  <TableCell sx={cellSx}>#{item.id}</TableCell>

                  <TableCell sx={cellSx}>
                    <Typography sx={{ fontSize: 13 }}>
                      {item.customer || "Guest"}
                    </Typography>
                    {item.email && (
                      <Typography
                        noWrap
                        sx={{
                          fontSize: 12,
                          color: theme.muted,
                          maxWidth: 200,
                        }}
                      >
                        {item.email}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={cellSx}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <ProductImage
                        src={item.image}
                        name={item.productName}
                        theme={theme}
                      />
                      <Typography noWrap sx={{ fontSize: 13, maxWidth: 220 }}>
                        {item.productName || "Unknown product"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={cellSx}>1</TableCell>

                  <TableCell sx={cellSx}>{dateLabel(item.addedAt)}</TableCell>

                  <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                    {moneyLabel(item.price)}
                  </TableCell>

                  <TableCell sx={cellSx}>{item.productId ?? "—"}</TableCell>

                  <TableCell sx={cellSx}>
                    <IconButton
                      size="small"
                      title="View"
                      onClick={() => openAction(item, "view")}
                      sx={{ color: BROWN }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Delete"
                      onClick={() => openAction(item, "delete")}
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
          disabled={loading || currentPage <= 1}
          onClick={() => setPage?.(Math.max(1, currentPage - 1))}
          sx={navButtonSx}
        >
          Previous
        </Button>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {getPageList(currentPage, totalPages).map((p) => {
            const isGap = typeof p === "string";
            const active = currentPage === p;

            return (
              <Button
                key={p}
                disabled={isGap || loading}
                onClick={() => setPage?.(p)}
                aria-label={isGap ? "More pages" : `Page ${p}`}
                aria-current={active ? "page" : undefined}
                sx={{
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: active ? theme.pageActive : theme.border,
                  bgcolor: active ? theme.pageActive : "transparent",
                  color: active ? BROWN : theme.text,
                  fontWeight: active ? 700 : 400,
                  "&.Mui-disabled": {
                    color: active ? BROWN : theme.text,
                  },
                }}
              >
                {isGap ? "...." : p}
              </Button>
            );
          })}
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={loading || currentPage >= totalPages}
          onClick={() => setPage?.(Math.min(totalPages, currentPage + 1))}
          sx={navButtonSx}
        >
          Next
        </Button>
      </Box>

      <Typography
        sx={{
          mt: 2,
          fontSize: 12,
          color: theme.muted,
          textAlign: "center",
        }}
      >
        Showing {from}–{to} of {total} items · Page {currentPage} of{" "}
        {totalPages}
      </Typography>

      {/* View / Delete dialog */}
      <Dialog
        open={Boolean(action)}
        onClose={closeAction}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: paperSx } }}
      >
        <DialogTitle>
          {action === "view" ? "Wishlist Details" : "Delete Wishlist Item"}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: theme.dialogDivider }}>
          {selectedWishlist &&
            (action === "view" ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                {[
                  ["Wishlist ID", selectedWishlist.id],
                  ["Customer", selectedWishlist.customer || "Guest"],
                  ["Customer Email", selectedWishlist.email || "—"],
                  ["User ID", selectedWishlist.userId ?? "—"],
                  [
                    "Product",
                    selectedWishlist.productName || "Unknown product",
                  ],
                  ["Product ID", selectedWishlist.productId ?? "—"],
                  ["Added Date", dateLabel(selectedWishlist.addedAt)],
                  ["Price", moneyLabel(selectedWishlist.price)],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      borderBottom: `1px solid ${theme.rowDivider}`,
                      pb: 1.5,
                    }}
                  >
                    <Typography
                      color={darkMode ? theme.muted : "text.secondary"}
                    >
                      {label}
                    </Typography>
                    <Typography fontWeight={600} textAlign="right">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography>
                Are you sure you want to delete wishlist item{" "}
                <strong>#{selectedWishlist?.id}</strong>? This action cannot be
                undone.
              </Typography>
            ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeAction}
            sx={{ color: theme.muted }}
            disabled={deleting}
          >
            Cancel
          </Button>
          {action === "delete" && (
            <Button
              variant="contained"
              onClick={deleteWishlist}
              disabled={deleting}
              sx={{ bgcolor: RED, "&:hover": { bgcolor: "#c9363b" } }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
