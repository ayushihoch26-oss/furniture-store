import { useState, useEffect, lazy, Suspense } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  MenuItem,
  Menu,
  Alert,
  CircularProgress,
} from "@mui/material";

import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  DownloadOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const OrderTable = lazy(() => import("../components/orderTable"));

// ---------- API ----------
const API_BASE_URL = "http://localhost:5000/api/orders";

// ---------- Colors (same as Dashboard) ----------
const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

// Statistics will be calculated from the real orders fetched by OrderTable.
function Card({ children, sx, darkMode = false }) {
  return (
    <Box
      sx={{
        bgcolor: darkMode ? "#292421" : "#FFFFFF",
        color: darkMode ? "#F5F0EB" : "#222222",
        border: `1px solid ${darkMode ? "#403832" : "transparent"}`,
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

function MenuButton({ darkMode = false }) {
  return (
    <IconButton
      size="small"
      aria-label="More"
      sx={{
        mt: -0.5,
        mr: -0.5,
        color: darkMode ? "#B8AAA0" : "#777",
      }}
    >
      <MoreVert fontSize="small" />
    </IconButton>
  );
}

// ---------- Top stat card ----------
function OrderStatCard({ title, value, change, up, darkMode = false }) {
  const color = up === false ? RED : GREEN;

  return (
    <Card
      darkMode={darkMode}
      sx={{
        borderRadius: "12px",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 25px rgba(15,23,42,.15)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 700,
            color: darkMode ? "#F5F0EB" : "#0F172A",
          }}
        >
          {title}
        </Typography>
        <MenuButton darkMode={darkMode} />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 1,
          mt: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.2,
            color: darkMode ? "#D8B89A" : BROWN,
          }}
        >
          {value}
        </Typography>

        {change && (
          <Typography
            sx={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 12,
              color,
            }}
          >
            {up === true && <ArrowUpward sx={{ fontSize: 14 }} />}
            {up === false && <ArrowDownward sx={{ fontSize: 14 }} />}
            {change}
          </Typography>
        )}
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color: darkMode ? "#B8AAA0" : "#777",
          mt: 1,
        }}
      >
        Last 7 days
      </Typography>
    </Card>
  );
}

// ---------- Page ----------
export default function AdminOrderManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [action, setAction] = useState("");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  const [moreAnchor, setMoreAnchor] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const theme = {
    page: darkMode ? "#1C1917" : BG,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
  };

  const getAuthHeaders = () => {
    // Change "token" if your application stores the JWT under a different key.
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setPageError("");

    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to load order statistics.");
      }

      // Adapt common response shapes without changing the backend.
      const data = result.data || result.stats || result;
      setStats({
        totalOrders: Number(
          data.totalOrders ?? data.total ?? data.ordersCount ?? 0,
        ),
        newOrders: Number(
          data.newOrders ?? data.pendingOrders ?? data.new ?? 0,
        ),
        completedOrders: Number(
          data.completedOrders ?? data.deliveredOrders ?? data.completed ?? 0,
        ),
        canceledOrders: Number(
          data.canceledOrders ?? data.cancelledOrders ?? data.cancelled ?? 0,
        ),
      });
    } catch (error) {
      setPageError(error.message || "Unable to load order statistics.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchStats();
  }, []); // eslint-disable-line

  const openMore = (event) => setMoreAnchor(event.currentTarget);
  const closeMore = () => setMoreAnchor(null);

  const exportOrders = () => {
    // `orders` contains the currently fetched page from the list endpoint.
    // Export selected visible orders, or the current page when none are selected.
    const ordersToExport =
      selected.length > 0
        ? orders.filter((order) =>
            selected.some((id) => String(id) === String(order.id)),
          )
        : orders;

    if (ordersToExport.length === 0) {
      window.alert(
        selected.length > 0
          ? "None of the selected orders are on the currently loaded page."
          : "No orders to export.",
      );
      return;
    }

    const headers = [
      "Database ID",
      "Order ID",
      "Product",
      "Date",
      "Price",
      "Payment",
      "Status",
    ];

    const csvRows = [
      headers,
      ...ordersToExport.map((order) => [
        order.id ?? "",
        order.orderId ?? "",
        order.productSummary ??
          (Array.isArray(order.items)
            ? order.items
                .map((item) => item.productName || item.name || "Product")
                .join(", ")
            : ""),
        order.createdAt ?? "",
        order.total ?? "",
        order.paymentStatus ?? "",
        order.status ?? "",
      ]),
    ];

    const csvContent = csvRows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      selected.length > 0 ? "selected-orders.csv" : "current-page-orders.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const deleteSelectedOrders = async () => {
    if (selected.length === 0) {
      window.alert("Please select at least one order.");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete ${selected.length} selected order(s)? This cannot be undone.`,
    );
    if (!confirmDelete) return;

    setPageError("");

    try {
      // Existing backend route is POST /api/orders/delete/:id.
      // Delete one selected order at a time; no backend changes needed.
      const results = await Promise.allSettled(
        selected.map(async (id) => {
          const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
            method: "POST",
            headers: getAuthHeaders(),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || result.success === false) {
            throw new Error(result.message || `Could not delete order ${id}`);
          }
          return id;
        }),
      );

      const failed = results.filter((result) => result.status === "rejected");
      const succeededIds = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => String(result.value));

      if (failed.length > 0) {
        setPageError(
          `${succeededIds.length} order(s) deleted; ${failed.length} failed. ${
            failed[0].reason?.message || ""
          }`,
        );
      }

      setSelected((previous) =>
        previous.filter((id) => !succeededIds.includes(String(id))),
      );
      setPage(1);

      // Refresh statistics after bulk delete.
      await fetchStats();

      // Let the table refresh its current list via its existing API call.
      // Changing the page triggers its fetch; on page 1 it may already be 1.
      window.dispatchEvent(new CustomEvent("orders:refresh"));
    } catch (error) {
      setPageError(error.message || "Unable to delete selected orders.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.page,
        color: theme.text,
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((previous) => !previous)}
        darkMode={darkMode}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar
          title="Order Management"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((previous) => !previous)}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
          {pageError && (
            <Alert severity="error" onClose={() => setPageError("")}>
              {pageError}
            </Alert>
          )}

          {/* ===== PAGE TITLE + ACTIONS ===== */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              Order List
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddCircleOutlinedIcon />}
                onClick={() => {
                  window.alert(
                    "Order creation is not available because the existing backend does not provide an order-create endpoint.",
                  );
                }}
                sx={{
                  height: 40,
                  px: 2.5,
                  bgcolor: BROWN,
                  textTransform: "none",
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Add Order
              </Button>

              <Button
                variant="outlined"
                endIcon={<MoreVert />}
                onClick={openMore}
                sx={{
                  height: 40,
                  px: 2.5,
                  bgcolor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: BROWN,
                    bgcolor: theme.soft,
                  },
                }}
              >
                More Action
              </Button>

              <Menu
                anchorEl={moreAnchor}
                open={Boolean(moreAnchor)}
                onClose={closeMore}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: theme.card,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    closeMore();
                    exportOrders();
                  }}
                >
                  <DownloadOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Export Orders
                </MenuItem>

                <MenuItem
                  disabled={selected.length === 0}
                  onClick={() => {
                    closeMore();
                    deleteSelectedOrders();
                  }}
                >
                  <DeleteOutlineOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Delete Selected
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* ===== STATISTICS ===== */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {[
              {
                title: "Total Orders",
                value: statsLoading ? "…" : stats.totalOrders.toLocaleString(),
                change: "",
              },
              {
                title: "New Orders",
                value: statsLoading ? "…" : stats.newOrders.toLocaleString(),
                change: "",
              },
              {
                title: "Completed Orders",
                value: statsLoading
                  ? "…"
                  : stats.completedOrders.toLocaleString(),
                change: "",
              },
              {
                title: "Canceled Orders",
                value: statsLoading
                  ? "…"
                  : stats.canceledOrders.toLocaleString(),
                change: "",
                up: false,
              },
            ].map((stat) => (
              <OrderStatCard key={stat.title} {...stat} darkMode={darkMode} />
            ))}
          </Box>

          {/* ===== ORDER TABLE ===== */}
          {/* suspense use for lazy loading */}
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <CircularProgress sx={{ color: BROWN }} />
              </Box>
            }
          >
            <OrderTable
              orders={orders}
              setOrders={setOrders}
              selected={selected}
              setSelected={setSelected}
              selectedOrder={selectedOrder}
              setSelectedOrder={setSelectedOrder}
              action={action}
              setAction={setAction}
              page={page}
              setPage={setPage}
              darkMode={darkMode}
            />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
