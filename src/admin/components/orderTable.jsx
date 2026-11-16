import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  FilterList,
  SwapVert,
  Search,
  Inventory2Outlined,
  LocalShippingOutlined,
  PendingActionsOutlined,
  CancelOutlined,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";

// Keep this URL aligned with the backend server port.
const API_BASE_URL = "http://localhost:5000/api/orders";
const PAGE_SIZE = 10;

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const BlUE = "#394CB8";
const RED = "#E5484D";
const YELLOW = "#F5B301";
const GREEN = "#2E9E5B";

const TABS = ["All order", "Completed", "Pending", "Canceled"];
const TAB_STATUS = {
  Completed: "Delivered",
  Pending: "Pending",
  Canceled: "Cancelled",
};

const STATUS = {
  Delivered: { color: BlUE, Icon: LocalShippingOutlined },
  Pending: { color: YELLOW, Icon: PendingActionsOutlined },
  Shipped: { color: "#275E23", Icon: LocalShippingOutlined },
  Cancelled: { color: RED, Icon: CancelOutlined },
};

const COLUMNS = "52px 120px minmax(180px, 2.5fr) 1.2fr 100px 1fr 1.3fr 120px";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  return result;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
}

function formatMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function getOrderNumber(order) {
  return order.orderId || `#ORD${String(order.id ?? "").padStart(4, "0")}`;
}

function getProductSummary(order) {
  const customerName = [order.firstName, order.lastName]
    .filter(Boolean)
    .join(" ");

  let itemsText = "—";
  if (Array.isArray(order.items) && order.items.length) {
    itemsText = order.items
      .map((item) => {
        const name = item.name || item.productName || "Product";
        const color = item.color ? `(${item.color})` : "";
        const quantity = Number(item.quantity || 1);
        return `${name} ${color} × ${quantity}`;
      })
      .join(", ");
  }

  if (customerName) {
    return `${customerName} — ${itemsText}`;
  }
  return itemsText;
}

function normalizePaymentStatus(value) {
  if (!value) return "Unpaid";
  const normalized = String(value).toLowerCase();
  if (["paid", "completed", "success", "succeeded"].includes(normalized)) {
    return "Paid";
  }
  if (
    ["unpaid", "pending", "failed", "cancelled", "canceled"].includes(
      normalized,
    )
  ) {
    return "Unpaid";
  }
  return value;
}

function Card({ children, sx = {}, theme }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        border: `1px solid ${theme.border}`,
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

function IconBox({ children, theme, size = 36 }) {
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
        color: theme.text,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      {children}
    </IconButton>
  );
}

export default function OrderTable({
  orders = [],
  setOrders,
  selected = [],
  setSelected,
  selectedOrder,
  setSelectedOrder,
  action,
  setAction,
  page = 1,
  setPage,
  darkMode = false,
}) {
  const [tab, setTab] = useState("All order");
  const [search, setSearch] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const theme = {
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : "#F7F7F7",
    header: darkMode ? "#332D28" : "#F3ECE5",
    tabsBg: darkMode ? "#332D28" : BG,
    tabText: darkMode ? "#B8AAA0" : "#555555",
    tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
    pageActive: darkMode ? "#403832" : BROWN_LIGHT,
    rowDivider: darkMode ? "#403832" : "#EEEEEE",
    dialogDivider: darkMode ? "#403832" : "rgba(0, 0, 0, 0.12)",
    cancel: darkMode ? "#B8AAA0" : "#666666",
  };

  const paperSx = darkMode
    ? { bgcolor: theme.card, color: theme.text, backgroundImage: "none" }
    : {};

  const fieldSx = {
    "& .MuiInputBase-input": {
      color: theme.text,
      WebkitTextFillColor: theme.text,
    },
    "& .MuiSelect-select": {
      color: theme.text,
      WebkitTextFillColor: theme.text,
    },
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
    ...(darkMode
      ? {
          "& .MuiInputBase-input": {
            colorScheme: "dark",
            color: theme.text,
            WebkitTextFillColor: theme.text,
          },
          "& .MuiSelect-select": {
            color: theme.text,
            WebkitTextFillColor: theme.text,
          },
        }
      : {}),
  };

  const menuProps = {
    slotProps: {
      paper: {
        sx: {
          bgcolor: theme.card,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          backgroundImage: "none",
        },
      },
    },
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const body = {
        page: Number(page) || 1,
        limit: PAGE_SIZE,
        search: search.trim(),
        status: TAB_STATUS[tab] || "",
        paymentStatus: paymentFilter === "All" ? "" : paymentFilter,
        startDate: fromDate || "",
        endDate: toDate || "",
      };

      const result = await apiRequest(`${API_BASE_URL}/list`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const payload = result.data || {};
      const fetchedOrders = Array.isArray(payload.orders) ? payload.orders : [];

      if (typeof setOrders === "function") {
        setOrders(fetchedOrders);
      }
      setTotalOrders(Number(payload.total ?? fetchedOrders.length));
      setTotalPages(Math.max(1, Number(payload.totalPages) || 1));
    } catch (err) {
      setError(
        err.message ||
          "Unable to load orders. Check your API URL and authentication token.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, tab, paymentFilter, fromDate, toDate, setOrders]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchOrders();
  }, [fetchOrders]);

  const rows = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return [...safeOrders].sort((a, b) => {
      const priceA = Number(a.total ?? a.price ?? 0);
      const priceB = Number(b.total ?? b.price ?? 0);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });
  }, [orders, sortOrder]);

  const openFilter = (event) => setFilterAnchor(event.currentTarget);
  const closeFilter = () => setFilterAnchor(null);

  const resetToFirstPage = (setter) => {
    setter();
    if (typeof setPage === "function") setPage(1);
  };

  const openAction = (order, type) => {
    if (typeof setSelectedOrder === "function") {
      setSelectedOrder({ ...order });
    }
    if (typeof setAction === "function") setAction(type);
    setError("");
    setSuccess("");
  };

  const closeAction = () => {
    if (typeof setSelectedOrder === "function") setSelectedOrder(null);
    if (typeof setAction === "function") setAction("");
  };

  const updateSelectedField = (field, value) => {
    if (typeof setSelectedOrder === "function") {
      setSelectedOrder((previous) =>
        previous ? { ...previous, [field]: value } : previous,
      );
    }
  };

  const saveOrder = async () => {
    if (!selectedOrder?.id) {
      setError("The selected order does not have a database ID.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`${API_BASE_URL}/update/${selectedOrder.id}`, {
        method: "POST",
        body: JSON.stringify({
          status: selectedOrder.status,
          paymentStatus: selectedOrder.paymentStatus,
        }),
      });

      closeAction();
      setSuccess("Order updated successfully.");
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Could not update the order.");
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async () => {
    if (!selectedOrder?.id) {
      setError("The selected order does not have a database ID.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`${API_BASE_URL}/delete/${selectedOrder.id}`, {
        method: "POST",
      });

      if (typeof setSelected === "function") {
        setSelected((previous) =>
          Array.isArray(previous)
            ? previous.filter((id) => String(id) !== String(selectedOrder.id))
            : [],
        );
      }
      closeAction();
      setSuccess("Order deleted successfully.");
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Could not delete the order.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelected = (id) => {
    if (typeof setSelected !== "function") return;
    setSelected((previous) => {
      const current = Array.isArray(previous) ? previous : [];
      return current.some((item) => String(item) === String(id))
        ? current.filter((item) => String(item) !== String(id))
        : [...current, id];
    });
  };

  const currentPage = Math.max(1, Number(page) || 1);

  return (
    <Card theme={theme}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Toolbar */}
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
          {TABS.map((name) => (
            <Button
              key={name}
              onClick={() => {
                resetToFirstPage(() => setTab(name));
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
                bgcolor: tab === name ? BROWN : "transparent",
                color: tab === name ? "#FFFFFF" : theme.tabText,
                "&:hover": {
                  bgcolor: tab === name ? BROWN : theme.tabHover,
                },
              }}
            >
              {name}
              {name === "All order" && (
                <Box component="span" sx={{ ml: 0.75, opacity: 0.8 }}>
                  ({totalOrders})
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
              onChange={(event) =>
                resetToFirstPage(() => setSearch(event.target.value))
              }
              placeholder="Search order report"
              inputProps={{ "aria-label": "Search orders" }}
              sx={{
                flex: 1,
                fontSize: 13,
                color: theme.text,
                "& input::placeholder": {
                  color: theme.muted,
                  opacity: 1,
                },
              }}
            />
            <Search sx={{ fontSize: 20, color: theme.muted }} />
          </Box>

          <SquareIconButton label="Filter" onClick={openFilter} theme={theme}>
            <FilterList fontSize="small" />
          </SquareIconButton>

          <Popover
            open={Boolean(filterAnchor)}
            anchorEl={filterAnchor}
            onClose={closeFilter}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
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
              Filter Orders
            </Typography>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Payment Status
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={paymentFilter}
              onChange={(event) =>
                resetToFirstPage(() => setPaymentFilter(event.target.value))
              }
              slotProps={{ select: menuProps }}
              sx={{ mb: 2.5, ...fieldSx }}
            >
              <MenuItem value="All">All Payments</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </TextField>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              From Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              size="small"
              value={fromDate}
              onChange={(event) =>
                resetToFirstPage(() => setFromDate(event.target.value))
              }
              slotProps={{ inputLabel: { shrink: true } }}
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
              onChange={(event) =>
                resetToFirstPage(() => setToDate(event.target.value))
              }
              slotProps={{ inputLabel: { shrink: true } }}
              sx={fieldSx}
            />

            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setPaymentFilter("All");
                  setFromDate("");
                  setToDate("");
                  if (typeof setPage === "function") setPage(1);
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
                onClick={closeFilter}
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
            label="Sort by price"
            theme={theme}
            onClick={() =>
              setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"))
            }
          >
            <SwapVert fontSize="small" />
          </SquareIconButton>
        </Box>
      </Box>

      {/* Table */}
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
              border: `1px solid ${theme.border}`,
              color: theme.text,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>Select</span>
            <span>Order ID</span>
            <span>Product</span>
            <span>Date</span>
            <span>Price</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Actions</span>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5,
                py: 5,
                color: theme.muted,
              }}
            >
              <CircularProgress size={22} sx={{ color: BROWN }} />
              <Typography fontSize={13}>Loading orders…</Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Typography
              sx={{
                py: 4,
                textAlign: "center",
                fontSize: 13,
                color: theme.muted,
              }}
            >
              No orders found
            </Typography>
          ) : (
            rows.map((order, index) => {
              const status = order.status || "Pending";
              const statusInfo = STATUS[status] || STATUS.Pending;
              const StatusIcon = statusInfo.Icon;
              const payment = normalizePaymentStatus(order.paymentStatus);
              const product = getProductSummary(order);
              const price = formatMoney(order.total ?? order.price);
              const orderNumber = getOrderNumber(order);

              return (
                <Box
                  key={order.id ?? orderNumber}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: COLUMNS,
                    gap: 1,
                    alignItems: "center",
                    px: 1,
                    py: 1.25,
                    fontSize: 13,
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.text,
                    "&:hover": { bgcolor: theme.soft },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      size="small"
                      checked={(Array.isArray(selected) ? selected : []).some(
                        (item) => String(item) === String(order.id),
                      )}
                      onChange={() => toggleSelected(order.id)}
                      sx={{
                        p: 0.5,
                        "&.Mui-checked": { color: BROWN },
                        ...(darkMode && { color: theme.muted }),
                      }}
                    />
                    <span>{(currentPage - 1) * PAGE_SIZE + index + 1}</span>
                  </Box>

                  <span>{orderNumber}</span>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    <IconBox theme={theme}>
                      <Inventory2Outlined sx={{ fontSize: 20 }} />
                    </IconBox>

                    <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: BROWN,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {[order.firstName, order.lastName]
                          .filter(Boolean)
                          .join(" ") || "Guest Customer"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={product}
                      >
                        {product}
                      </Typography>
                    </Box>
                  </Box>

                  <span>{formatDate(order.createdAt || order.date)}</span>
                  <span>{price}</span>

                  <span style={{ color: payment === "Paid" ? GREEN : RED }}>
                    ● <span style={{ color: theme.text }}>{payment}</span>
                  </span>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      color: statusInfo.color,
                    }}
                  >
                    <StatusIcon sx={{ fontSize: 20 }} />
                    <span>{status}</span>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      title="View"
                      onClick={() => openAction(order, "view")}
                      sx={{ color: BROWN }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Edit"
                      onClick={() => openAction(order, "edit")}
                      sx={{ color: GREEN }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Delete"
                      onClick={() => openAction(order, "delete")}
                      sx={{ color: RED }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })
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
          disabled={loading || currentPage <= 1}
          onClick={() =>
            setPage?.((previous) => Math.max(1, Number(previous) - 1))
          }
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (number) =>
                number === 1 ||
                number === totalPages ||
                Math.abs(number - currentPage) <= 1,
            )
            .reduce((items, number, index, list) => {
              if (index > 0 && number - list[index - 1] > 1) {
                items.push("ellipsis-" + number);
              }
              items.push(number);
              return items;
            }, [])
            .map((number) =>
              typeof number === "string" ? (
                <Typography key={number} sx={{ color: theme.muted }}>
                  …
                </Typography>
              ) : (
                <Button
                  key={number}
                  disabled={loading}
                  onClick={() => setPage?.(number)}
                  sx={{
                    minWidth: 0,
                    width: 36,
                    height: 36,
                    fontSize: 13,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor:
                      currentPage === number ? theme.pageActive : theme.border,
                    bgcolor:
                      currentPage === number ? theme.pageActive : "transparent",
                    color: currentPage === number ? BROWN : theme.text,
                    fontWeight: currentPage === number ? 700 : 400,
                  }}
                >
                  {number}
                </Button>
              ),
            )}
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={loading || currentPage >= totalPages}
          onClick={() =>
            setPage?.((previous) => Math.min(totalPages, Number(previous) + 1))
          }
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

      {/* View / Edit / Delete dialog */}
      <Dialog
        open={Boolean(action)}
        onClose={closeAction}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: paperSx } }}
      >
        <DialogTitle sx={{ color: theme.text }}>
          {action === "view" && "Order Details"}
          {action === "edit" && "Edit Order"}
          {action === "delete" && "Delete Order"}
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            borderColor: theme.dialogDivider,
            overflowY: "hidden",
            bgcolor: theme.card,
            color: theme.text,
          }}
        >
          {selectedOrder && (
            <>
              {action === "delete" ? (
                <Typography sx={{ color: theme.text, py: 1 }}>
                  Are you sure you want to delete order{" "}
                  {getOrderNumber(selectedOrder)}? This action cannot be undone.
                </Typography>
              ) : action === "view" ? (
                <Box sx={{ display: "grid", gap: 1.25 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: BROWN }}
                  >
                    Order Information
                  </Typography>
                  {[
                    ["Order ID", getOrderNumber(selectedOrder)],
                    ["Database ID", selectedOrder.id ?? "—"],
                    [
                      "Customer Name",
                      [selectedOrder.firstName, selectedOrder.lastName]
                        .filter(Boolean)
                        .join(" ") || "—",
                    ],
                    ["Email", selectedOrder.email || "—"],
                    ["Phone", selectedOrder.phone || "—"],
                    [
                      "Shipping Address",
                      [
                        selectedOrder.street,
                        selectedOrder.city,
                        selectedOrder.state,
                        selectedOrder.zip,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—",
                    ],
                    ["Date", formatDate(selectedOrder.createdAt)],
                    ["Total", formatMoney(selectedOrder.total)],
                    [
                      "Payment",
                      normalizePaymentStatus(selectedOrder.paymentStatus),
                    ],
                    ["Status", selectedOrder.status || "Pending"],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        borderBottom: `1px solid ${theme.rowDivider}`,
                        pb: 0.75,
                      }}
                    >
                      <Typography sx={{ color: theme.muted, fontSize: 12 }}>
                        {label}
                      </Typography>
                      <Typography
                        fontWeight={600}
                        textAlign="right"
                        sx={{
                          overflowWrap: "anywhere",
                          fontSize: 12,
                          color: theme.text,
                        }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  ))}

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: BROWN, mt: 1 }}
                  >
                    Ordered Items ({selectedOrder.items?.length || 0})
                  </Typography>

                  {Array.isArray(selectedOrder.items) &&
                  selectedOrder.items.length > 0 ? (
                    <Box sx={{ display: "grid", gap: 1 }}>
                      {selectedOrder.items.map((item, idx) => (
                        <Box
                          key={item.id || idx}
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: theme.soft,
                            border: `1px solid ${theme.border}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              fontWeight={600}
                              fontSize={12}
                              sx={{ color: theme.text }}
                            >
                              {item.name || item.productName || "Product"}
                            </Typography>
                            <Typography
                              fontSize={11}
                              sx={{ color: theme.muted }}
                            >
                              Color: {item.color || "Default"} | Qty:{" "}
                              {item.quantity || 1}
                            </Typography>
                          </Box>
                          <Typography
                            fontWeight={700}
                            fontSize={12}
                            sx={{ color: theme.text }}
                          >
                            {formatMoney(
                              (item.price || 0) * (item.quantity || 1),
                            )}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography fontSize={12} sx={{ color: theme.muted }}>
                      No items found for this order.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: "grid", gap: 1.5, py: 1 }}>
                  <TextField
                    fullWidth
                    label="Order ID"
                    size="small"
                    value={getOrderNumber(selectedOrder)}
                    disabled
                    sx={fieldSx}
                  />

                  <TextField
                    fullWidth
                    label="Payment Status"
                    select
                    size="small"
                    value={normalizePaymentStatus(selectedOrder.paymentStatus)}
                    onChange={(event) =>
                      updateSelectedField("paymentStatus", event.target.value)
                    }
                    slotProps={{ select: menuProps }}
                    sx={fieldSx}
                  >
                    <MenuItem value="Paid" sx={{ color: theme.text }}>
                      Paid
                    </MenuItem>
                    <MenuItem value="Unpaid" sx={{ color: theme.text }}>
                      Unpaid
                    </MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    label="Order Status"
                    select
                    size="small"
                    value={selectedOrder.status || "Pending"}
                    onChange={(event) =>
                      updateSelectedField("status", event.target.value)
                    }
                    slotProps={{ select: menuProps }}
                    sx={fieldSx}
                  >
                    <MenuItem value="Pending" sx={{ color: theme.text }}>
                      Pending
                    </MenuItem>
                    <MenuItem value="Shipped" sx={{ color: theme.text }}>
                      Shipped
                    </MenuItem>
                    <MenuItem value="Delivered" sx={{ color: theme.text }}>
                      Delivered
                    </MenuItem>
                    <MenuItem value="Cancelled" sx={{ color: theme.text }}>
                      Cancelled
                    </MenuItem>
                  </TextField>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      color: theme.muted,
                      fontSize: 11,
                    }}
                  >
                    This form updates only payment status and order status,
                    because those are the fields supported by your existing
                    backend update endpoint.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            bgcolor: theme.card,
            borderTop: `1px solid ${theme.dialogDivider}`,
          }}
        >
          <Button
            onClick={closeAction}
            disabled={saving}
            sx={{ color: theme.cancel }}
          >
            Close
          </Button>

          {action === "edit" && (
            <Button
              variant="contained"
              onClick={saveOrder}
              disabled={saving || !selectedOrder?.id}
              sx={{
                bgcolor: BROWN,
                "&:hover": { bgcolor: BROWN_DARK },
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          )}

          {action === "delete" && (
            <Button
              variant="contained"
              onClick={deleteOrder}
              disabled={saving || !selectedOrder?.id}
              sx={{ bgcolor: RED, "&:hover": { bgcolor: "#c9363b" } }}
            >
              {saving ? "Deleting…" : "Delete"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
}
