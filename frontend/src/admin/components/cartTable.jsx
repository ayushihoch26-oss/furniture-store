import { useState, useEffect, useMemo, useCallback } from "react";

import {
  Alert,
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Popover,
  CircularProgress,
  Snackbar,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  FilterList,
  SwapVert,
  Search,
  ShoppingCartOutlined,
  RemoveShoppingCartOutlined,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  Refresh,
  CheckCircleOutlined,
  PersonOutlined,
} from "@mui/icons-material";

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";
const YELLOW = "#F5B301";

const API_BASE = "http://localhost:5000/api";
const PAGE_SIZE = 10;

const TABS = [
  { label: "All cart", value: "all" },
  { label: "Active", value: "active" },
  { label: "Abandoned", value: "abandoned" },
  { label: "Converted", value: "converted" },
];

const STATUS = {
  active: { color: YELLOW, icon: ShoppingCartOutlined },
  abandoned: { color: RED, icon: RemoveShoppingCartOutlined },
  converted: { color: GREEN, icon: CheckCircleOutlined },
};

const COLUMNS = "70px 110px minmax(180px, 2.5fr) 0.8fr 1.2fr 90px 1.3fr 120px";

// API helper
async function apiRequest(path, options = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`,
    );
  }

  return data;
}

// Reusable card
function Card({ children, sx, theme }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.cardText,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// Reusable icon background
function IconBox({ size = 44, children, theme }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: theme.soft,
        color: BROWN,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Box>
  );
}

// Reusable square button
function SquareIconButton({ children, label, onClick, theme }) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        border: `1px solid ${theme.border}`,
        color: theme.iconButton,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      {children}
    </IconButton>
  );
}

// Format price
function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

// Format date
function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB");
}

// Format status
function titleStatus(status = "") {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function CartTable({
  carts = [],
  setCarts,
  selected = [],
  setSelected,
  selectedCart,
  setSelectedCart,
  action,
  setAction,
  page,
  setPage,
  darkMode = false,
}) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const [filterAnchor, setFilterAnchor] = useState(null);
  const [minItems, setMinItems] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [rows, setRows] = useState(Array.isArray(carts) ? carts : []);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const currentPage = Math.max(Number(page) || 1, 1);

  // Theme colors
  const theme = {
    card: darkMode ? "#292421" : "#fff",
    cardText: darkMode ? "#F5F0EB" : undefined,
    text: darkMode ? "#F5F0EB" : "#222",
    headText: darkMode ? "#F5F0EB" : "#333",
    muted: darkMode ? "#B8AAA0" : "#777",
    searchIcon: darkMode ? "#B8AAA0" : "#666",
    iconButton: darkMode ? "#F5F0EB" : "#444",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : BROWN_LIGHT,
    tabsBg: darkMode ? "#332D28" : BG,
    tabText: darkMode ? "#B8AAA0" : "#555",
    tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
    rowDivider: darkMode ? "#403832" : "#eee",
    dialogDivider: darkMode ? "#403832" : "rgba(0, 0, 0, 0.12)",
    cancel: darkMode ? "#B8AAA0" : "#666",
  };

  const paperSx = darkMode
    ? {
        bgcolor: theme.card,
        color: theme.text,
        backgroundImage: "none",
      }
    : {};

  const fieldSx = darkMode
    ? {
        "& .MuiInputBase-root": { color: theme.text },
        "& .MuiInputBase-input": { colorScheme: "dark" },
        "& .MuiInputLabel-root": { color: theme.muted },
        "& .MuiInputLabel-root.Mui-focused": { color: BROWN },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.border,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.muted,
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: BROWN,
        },
        "& .MuiSvgIcon-root": { color: theme.muted },
      }
    : {};

  const menuProps = {
    slotProps: { paper: { sx: paperSx } },
  };

  // Fetch carts from the backend
  const fetchCarts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
        status: tab,
      });

      const result = await apiRequest(`/cart/admin/list?${params.toString()}`, {
        method: "POST",
      });

      const data = result.data || result;

      const list = Array.isArray(data.carts)
        ? data.carts
        : Array.isArray(data.rows)
          ? data.rows
          : Array.isArray(data.data)
            ? data.data
            : [];

      const count = Number(data.total ?? list.length);
      const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));

      setRows(list);
      setTotal(count);
      setTotalPages(pages);

      if (typeof setCarts === "function") {
        setCarts(list);
      }

      // Keep the current page within the available pages
      if (currentPage > pages) {
        setPage(pages);
      }

      // Remove selections for carts that are no longer available
      if (typeof setSelected === "function") {
        setSelected((previous) =>
          previous.filter((id) => list.some((cart) => cart.id === id)),
        );
      }
    } catch (err) {
      setError(err.message || "Unable to load carts.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, tab, setCarts, setPage, setSelected]);

  // Fetch on page or tab changes
  useEffect(() => {
    //eslint-disable-next-line
    fetchCarts();
  }, [fetchCarts]);

  // Refresh when another component changes carts
  useEffect(() => {
    window.addEventListener("carts:refresh", fetchCarts);

    return () => {
      window.removeEventListener("carts:refresh", fetchCarts);
    };
  }, [fetchCarts]);

  // Search, filter and sort loaded rows
  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rows
      .filter((cart) => {
        const customer = cart.customer || "";
        const cartId = `${cart.cartCode || ""} ${cart.id ?? ""}`;

        const matchesSearch = `${cartId} ${customer}`
          .toLowerCase()
          .includes(keyword);

        const itemCount = Number(cart.itemCount ?? cart.items?.length ?? 0);

        const matchesItems = minItems === "" || itemCount >= Number(minItems);

        const date = cart.createdAt ? new Date(cart.createdAt) : null;

        const dateValue =
          date && !Number.isNaN(date.getTime())
            ? [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0"),
              ].join("-")
            : "";

        const matchesFromDate =
          !fromDate || (dateValue && dateValue >= fromDate);

        const matchesToDate = !toDate || (dateValue && dateValue <= toDate);

        return (
          matchesSearch && matchesItems && matchesFromDate && matchesToDate
        );
      })
      .sort((a, b) => {
        const first = Number(a.subtotal || 0);
        const second = Number(b.subtotal || 0);

        return sortOrder === "asc" ? first - second : second - first;
      });
  }, [rows, search, minItems, fromDate, toDate, sortOrder]);

  // Open a cart dialog
  const openAction = (cart, type) => {
    setSelectedCart({ ...cart });
    setAction(type);
  };

  // Close a cart dialog
  const closeAction = () => {
    setSelectedCart(null);
    setAction("");
  };

  // Select or deselect one cart
  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  // Select or deselect all carts on this page
  const selectAllOnPage = (checked) => {
    setSelected((previous) => {
      const otherPages = previous.filter(
        (id) => !rows.some((cart) => cart.id === id),
      );

      return checked
        ? [...otherPages, ...rows.map((cart) => cart.id)]
        : otherPages;
    });
  };

  const allOnPageSelected =
    rows.length > 0 && rows.every((cart) => selected.includes(cart.id));

  // Update cart status
  const saveCartStatus = async () => {
    if (!selectedCart?.id || !selectedCart?.status) return;

    setSaving(true);

    try {
      await apiRequest(`/cart/admin/status/${selectedCart.id}`, {
        method: "POST",
        body: JSON.stringify({
          status: selectedCart.status,
        }),
      });

      closeAction();
      setNotice("Cart status updated successfully.");

      window.dispatchEvent(new Event("carts:refresh"));
    } catch (err) {
      setError(err.message || "Unable to update cart status.");
    } finally {
      setSaving(false);
    }
  };

  // Delete one cart
  const deleteCart = async () => {
    if (!selectedCart?.id) return;

    setSaving(true);

    try {
      await apiRequest(`/cart/admin/delete/${selectedCart.id}`, {
        method: "POST",
      });

      const deletedId = selectedCart.id;

      setSelected((previous) => previous.filter((id) => id !== deletedId));

      closeAction();
      setNotice("Cart deleted successfully.");

      if (rows.length === 1 && currentPage > 1) {
        setPage(currentPage - 1);
      } else {
        window.dispatchEvent(new Event("carts:refresh"));
      }
    } catch (err) {
      setError(err.message || "Unable to delete cart.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card theme={theme}>
      {/* Tabs and toolbar */}
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
            bgcolor: theme.tabsBg,
            p: 0.5,
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          {TABS.map(({ label, value }) => (
            <Button
              key={value}
              onClick={() => {
                setTab(value);
                setPage(1);
              }}
              disableElevation
              sx={{
                minWidth: 0,
                height: 34,
                px: 2,
                fontSize: 13,
                textTransform: "none",
                whiteSpace: "nowrap",
                borderRadius: 1.5,
                bgcolor: tab === value ? BROWN : "transparent",
                color: tab === value ? "#fff" : theme.tabText,
                "&:hover": {
                  bgcolor: tab === value ? BROWN : theme.tabHover,
                },
              }}
            >
              {label}
              {value === "all" && (
                <Box component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                  ({total})
                </Box>
              )}
            </Button>
          ))}
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
              width: { xs: 160, sm: 240 },
            }}
          >
            <InputBase
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search cart report"
              sx={{
                flex: 1,
                fontSize: 13,
                ...(darkMode && {
                  color: theme.text,
                  "& input::placeholder": {
                    color: theme.muted,
                    opacity: 1,
                  },
                }),
              }}
            />

            <Search sx={{ fontSize: 20, color: theme.searchIcon }} />
          </Box>

          <SquareIconButton
            label="Filter"
            onClick={(event) => setFilterAnchor(event.currentTarget)}
            theme={theme}
          >
            <FilterList fontSize="small" />
          </SquareIconButton>

          {/* Filters */}
          <Popover
            open={Boolean(filterAnchor)}
            anchorEl={filterAnchor}
            onClose={() => setFilterAnchor(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  p: 2.5,
                  width: 290,
                  borderRadius: 3,
                  mt: 1,
                  ...paperSx,
                },
              },
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              Filter Carts
            </Typography>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Minimum Items
            </Typography>

            <TextField
              type="number"
              fullWidth
              size="small"
              value={minItems}
              slotProps={{ htmlInput: { min: 0 } }}
              onChange={(event) => setMinItems(event.target.value)}
              sx={{ mb: 2.5, ...fieldSx }}
            />

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              From Date
            </Typography>

            <TextField
              type="date"
              fullWidth
              size="small"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              sx={{ mb: 2, ...fieldSx }}
            />

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              To Date
            </Typography>

            <TextField
              type="date"
              fullWidth
              size="small"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              sx={fieldSx}
            />

            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setMinItems("");
                  setFromDate("");
                  setToDate("");
                }}
                sx={{
                  color: BROWN,
                  borderColor: BROWN,
                  textTransform: "none",
                }}
              >
                Clear
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterAnchor(null)}
                sx={{
                  bgcolor: BROWN,
                  textTransform: "none",
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Done
              </Button>
            </Box>
          </Popover>

          <SquareIconButton
            label="Sort by total"
            theme={theme}
            onClick={() =>
              setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"))
            }
          >
            <SwapVert fontSize="small" />
          </SquareIconButton>

          <SquareIconButton
            label="Refresh carts"
            theme={theme}
            onClick={fetchCarts}
          >
            <Refresh fontSize="small" />
          </SquareIconButton>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Cart table */}
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 900 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Checkbox
                size="small"
                checked={allOnPageSelected}
                indeterminate={
                  selected.some((id) => rows.some((cart) => cart.id === id)) &&
                  !allOnPageSelected
                }
                onChange={(event) => selectAllOnPage(event.target.checked)}
                sx={{
                  p: 0.25,
                  "&.Mui-checked": { color: BROWN },
                }}
              />
              No.
            </Box>

            <span>Cart Id</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Date</span>
            <span>Total</span>
            <span>Status</span>
            <span>Actions</span>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 6,
              }}
            >
              <CircularProgress sx={{ color: BROWN }} />
            </Box>
          ) : (
            visibleRows.map((cart, index) => {
              const status = String(cart.status || "active").toLowerCase();

              const statusInfo = STATUS[status] || STATUS.active;
              const StatusIcon = statusInfo.icon;

              return (
                <Box
                  key={cart.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: COLUMNS,
                    gap: 1,
                    alignItems: "center",
                    px: 1,
                    py: 1.25,
                    fontSize: 13,
                    borderBottom: `1px solid ${theme.rowDivider}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      size="small"
                      checked={selected.includes(cart.id)}
                      onChange={() => toggleSelected(cart.id)}
                      sx={{
                        p: 0.5,
                        mr: 1,
                        color: theme.muted,
                        "&.Mui-checked": { color: BROWN },
                      }}
                    />

                    <span>{(currentPage - 1) * PAGE_SIZE + index + 1}</span>
                  </Box>

                  <span>{cart.cartCode || `#${cart.id}`}</span>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    <IconBox size={36} theme={theme}>
                      <PersonOutlined sx={{ fontSize: 20 }} />
                    </IconBox>

                    <Typography
                      sx={{
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cart.customer || "Guest"}
                    </Typography>
                  </Box>

                  <span>{cart.itemCount ?? cart.items?.length ?? 0}</span>

                  <span>{formatDate(cart.createdAt)}</span>
                  <span>{money(cart.subtotal)}</span>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      color: statusInfo.color,
                    }}
                  >
                    <StatusIcon sx={{ fontSize: 20 }} />
                    <span>{titleStatus(status)}</span>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      title="View"
                      onClick={() => openAction(cart, "view")}
                      sx={{ color: BROWN }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      title="Edit status"
                      onClick={() => openAction(cart, "edit")}
                      sx={{ color: GREEN }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      title="Delete"
                      onClick={() => openAction(cart, "delete")}
                      sx={{ color: RED }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })
          )}

          {!loading && visibleRows.length === 0 && (
            <Typography
              sx={{
                py: 4,
                textAlign: "center",
                fontSize: 13,
                color: theme.muted,
              }}
            >
              {rows.length ? "No carts match your filters" : "No carts found"}
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
        <Typography sx={{ color: theme.muted, fontSize: 13 }}>
          Page {currentPage} of {totalPages} · {total} carts
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            disabled={currentPage <= 1 || loading}
            onClick={() => setPage(currentPage - 1)}
            sx={{
              height: 36,
              color: theme.text,
              borderColor: theme.border,
              textTransform: "none",
              "&:hover": {
                borderColor: BROWN,
                bgcolor: theme.soft,
              },
            }}
          >
            Previous
          </Button>

          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            disabled={currentPage >= totalPages || loading}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            sx={{
              height: 36,
              color: theme.text,
              borderColor: theme.border,
              textTransform: "none",
              "&:hover": {
                borderColor: BROWN,
                bgcolor: theme.soft,
              },
            }}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* View, edit and delete dialogs */}
      <Dialog
        open={Boolean(action)}
        onClose={closeAction}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: paperSx } }}
      >
        <DialogTitle>
          {action === "view"
            ? "Cart Details"
            : action === "edit"
              ? "Update Cart Status"
              : action === "delete"
                ? "Delete Cart"
                : "Cart"}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: theme.dialogDivider }}>
          {selectedCart && action === "delete" && (
            <Typography>
              Are you sure you want to delete cart{" "}
              {selectedCart.cartCode || `#${selectedCart.id}`}?
            </Typography>
          )}

          {selectedCart && action === "view" && (
            <Box sx={{ display: "grid", gap: 2 }}>
              {[
                ["Cart ID", selectedCart.cartCode || `#${selectedCart.id}`],
                ["Customer", selectedCart.customer || "Guest"],
                [
                  "Items",
                  selectedCart.itemCount ?? selectedCart.items?.length ?? 0,
                ],
                ["Date", formatDate(selectedCart.createdAt)],
                ["Subtotal", money(selectedCart.subtotal)],
                ["Status", titleStatus(selectedCart.status)],
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
                  <Typography color={darkMode ? theme.muted : "text.secondary"}>
                    {label}
                  </Typography>

                  <Typography fontWeight={600} textAlign="right">
                    {value}
                  </Typography>
                </Box>
              ))}

              <Typography fontWeight={700}>Products</Typography>

              {(selectedCart.items || []).length > 0 ? (
                selectedCart.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      borderBottom: `1px solid ${theme.rowDivider}`,
                      pb: 1,
                    }}
                  >
                    <Typography>
                      {item.name || `Product #${item.productId}`} ×{" "}
                      {item.quantity}
                    </Typography>

                    <Typography>
                      {money(
                        item.total ??
                          Number(item.price) * Number(item.quantity),
                      )}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color={theme.muted}>
                  No products in this cart.
                </Typography>
              )}
            </Box>
          )}

          {selectedCart && action === "edit" && (
            <TextField
              fullWidth
              select
              label="Cart Status"
              margin="normal"
              value={String(selectedCart.status || "active").toLowerCase()}
              onChange={(event) =>
                setSelectedCart((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
              slotProps={{ select: { MenuProps: menuProps } }}
              sx={fieldSx}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="abandoned">Abandoned</MenuItem>
              <MenuItem value="converted">Converted</MenuItem>
            </TextField>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeAction} sx={{ color: theme.cancel }}>
            Cancel
          </Button>

          {action === "edit" && (
            <Button
              variant="contained"
              onClick={saveCartStatus}
              disabled={saving}
              sx={{
                bgcolor: BROWN,
                "&:hover": { bgcolor: BROWN_DARK },
              }}
            >
              {saving ? "Saving…" : "Save Status"}
            </Button>
          )}

          {action === "delete" && (
            <Button
              variant="contained"
              onClick={deleteCart}
              disabled={saving}
              sx={{
                bgcolor: RED,
                "&:hover": { bgcolor: "#c9353b" },
              }}
            >
              {saving ? "Deleting…" : "Delete"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Success message */}
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
        message={notice}
      />
    </Card>
  );
}
