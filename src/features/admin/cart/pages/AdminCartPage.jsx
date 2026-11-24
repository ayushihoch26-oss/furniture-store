import { lazy, Suspense } from "react";

import {
  Box,
  Typography,
  Button,
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
  AddCircleOutlined,
} from "@mui/icons-material";

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";
import useAdminCart from "../hooks/useAdminCart";

// Lazy load CartTable
const CartTable = lazy(() => import("../components/CartTable"));

const BROWN = "#947458";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

// Reusable card
function Card({ children, sx, darkMode = false }) {
  return (
    <Box
      sx={{
        bgcolor: darkMode ? "#292421" : "#FFFFFF",
        color: darkMode ? "#F5F0EB" : "#222222",
        border: `1px solid ${darkMode ? "#403832" : "#EEEEEE"}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,.25)"
          : "0 1px 4px rgba(0,0,0,.06)",
        transition: "background-color 0.25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// Statistics card
function CartStatCard({ title, value, change, up, darkMode = false }) {
  const color = up === false ? RED : GREEN;

  return (
    <Card
      darkMode={darkMode}
      sx={{
        borderRadius: "12px",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,.35)"
            : "0 10px 25px rgba(15,23,42,.15)",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: darkMode ? "#F5F0EB" : "#0F172A",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ mt: 1.5 }}>
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
          color: darkMode ? "#B8AAA0" : "#777777",
          mt: 1,
        }}
      >
        All time
      </Typography>
    </Card>
  );
}

export default function AdminCart() {
  const {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
    page,
    setPage,
    selected,
    setSelected,
    carts,
    setCarts,
    selectedCart,
    setSelectedCart,
    action,
    setAction,
    darkMode,
    setDarkMode,
    moreAnchor,
    setMoreAnchor,
    bulkBusy,
    statsError,
    setStatsError,
    stats,
    exportCarts,
    deleteSelectedCarts,
  } = useAdminCart();

  // Theme colors
  const theme = {
    page: darkMode ? "#1C1917" : BG,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
  };

  const closeMore = () => {
    setMoreAnchor(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.page,
        color: theme.text,
        transition: "background-color 0.25s ease",
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
          title="Cart"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((previous) => !previous)}
        />

        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 2 },
            display: "grid",
            gap: 2.5,
          }}
        >
          {/* Page heading and action buttons */}
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
              Cart List
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddCircleOutlined />}
                onClick={() =>
                  window.alert(
                    "Cart creation is not available because the backend has no admin create-cart endpoint.",
                  )
                }
                sx={{
                  height: 40,
                  px: 2.5,
                  bgcolor: theme.card,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: BROWN,
                    bgcolor: theme.soft,
                  },
                }}
              >
                Add Cart
              </Button>

              <Button
                variant="outlined"
                endIcon={<MoreVert />}
                onClick={(event) => setMoreAnchor(event.currentTarget)}
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
                PaperProps={{
                  sx: {
                    bgcolor: theme.card,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    closeMore();
                    exportCarts();
                  }}
                >
                  <DownloadOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Export Carts
                </MenuItem>

                <MenuItem
                  disabled={!selected.length || bulkBusy}
                  onClick={() => {
                    closeMore();
                    deleteSelectedCarts();
                  }}
                >
                  <DeleteOutlineOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  {bulkBusy ? "Deleting..." : "Delete Selected"}
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Statistics error */}
          {statsError && (
            <Alert severity="error" onClose={() => setStatsError("")}>
              {statsError}
            </Alert>
          )}

          {/* Statistics cards */}
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
            <CartStatCard
              title="Total Carts"
              value={String(stats.total)}
              change=""
              darkMode={darkMode}
            />

            <CartStatCard
              title="Active Carts"
              value={String(stats.active)}
              change=""
              darkMode={darkMode}
            />

            <CartStatCard
              title="Abandoned Carts"
              value={String(stats.abandoned)}
              change=""
              darkMode={darkMode}
            />

            <CartStatCard
              title="Converted Carts"
              value={String(stats.converted)}
              change=""
              darkMode={darkMode}
            />
          </Box>

          {/* Lazy-loaded cart table */}
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
            <CartTable
              carts={carts}
              setCarts={setCarts}
              selected={selected}
              setSelected={setSelected}
              selectedCart={selectedCart}
              setSelectedCart={setSelectedCart}
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
