// pages/AdminOrdersPage.jsx
// The page only CONNECTS things: hooks (data) + components (screen).
import { lazy, Suspense, useState } from "react";
import { Alert, Box, Button, CircularProgress, Menu, MenuItem, Typography } from "@mui/material";
import { DeleteOutlineOutlined, DownloadOutlined, MoreVert } from "@mui/icons-material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";

import { COLORS, getTheme } from "../constants/orderConstants";
import { downloadOrdersCsv } from "../utils/orderHelpers";
import useDarkMode from "../hooks/useDarkMode";
import useOrders from "../hooks/useOrders";
import useOrderStats from "../hooks/useOrderStats";
import useOrderActions from "../hooks/useOrderActions";
import StatCard from "../components/StatCard";

const OrderTable = lazy(() => import("../components/OrderTable"));

export default function AdminOrdersPage() {
  // --- UI state ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);

  // --- hooks ---
  const { darkMode, toggleDarkMode } = useDarkMode();
  const theme = getTheme(darkMode);
  const orders = useOrders();
  const stats = useOrderStats();
  const actions = useOrderActions(async () => {
    // after any edit/delete: refresh list and stat cards
    await Promise.all([orders.reload(), stats.reloadStats()]);
  });

  // --- export CSV (selected rows, or the whole current page) ---
  const exportOrders = () => {
    const list = actions.selected.length
      ? orders.orders.filter((o) => actions.isSelected(o.id))
      : orders.orders;
    if (list.length === 0) return window.alert("No orders to export.");
    downloadOrdersCsv(list, actions.selected.length ? "selected-orders.csv" : "current-page-orders.csv");
  };

  const show = (n) => (stats.loading ? "…" : n.toLocaleString());
  const statCards = [
    { title: "Total Orders", value: show(stats.stats.totalOrders) },
    { title: "New Orders", value: show(stats.stats.newOrders) },
    { title: "Completed Orders", value: show(stats.stats.completedOrders) },
    { title: "Canceled Orders", value: show(stats.stats.canceledOrders) },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: theme.page, color: theme.text }}>
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        darkMode={darkMode}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar title="Order Management" onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} onThemeToggle={toggleDarkMode} />

        <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
          {stats.error && <Alert severity="error">{stats.error}</Alert>}

          {/* Title + buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>Order List</Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button variant="contained" disableElevation startIcon={<AddCircleOutlinedIcon />}
                onClick={() => window.alert("Order creation is not available: the backend has no create endpoint.")}
                sx={{ height: 40, bgcolor: COLORS.brown, textTransform: "none", "&:hover": { bgcolor: COLORS.brownDark } }}>
                Add Order
              </Button>

              <Button variant="outlined" endIcon={<MoreVert />} onClick={(e) => setMoreAnchor(e.currentTarget)}
                sx={{ height: 40, color: theme.text, borderColor: theme.border, textTransform: "none" }}>
                More Action
              </Button>

              <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
                <MenuItem onClick={() => { setMoreAnchor(null); exportOrders(); }}>
                  <DownloadOutlined sx={{ mr: 1.5, fontSize: 20 }} /> Export Orders
                </MenuItem>
                <MenuItem disabled={actions.selected.length === 0}
                  onClick={() => { setMoreAnchor(null); actions.removeSelected(); }}>
                  <DeleteOutlineOutlined sx={{ mr: 1.5, fontSize: 20 }} /> Delete Selected
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* 4 stat cards */}
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}>
            {statCards.map((c) => <StatCard key={c.title} {...c} theme={theme} darkMode={darkMode} />)}
          </Box>

          {/* Table (lazy loaded) */}
          <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", minHeight: 200, alignItems: "center" }}><CircularProgress sx={{ color: COLORS.brown }} /></Box>}>
            <OrderTable orders={orders} actions={actions} theme={theme} />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
