import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";
import DashboardOrdersProductsSection from "../components/DashboardOrdersProductsSection";
import { StatCard } from "../components/DashboardPrimitives";
import DashboardThemeContext from "../components/DashboardThemeContext";
import DashboardSalesSection from "../components/DashboardSalesSection";
import DashboardSummarySection from "../components/DashboardSummarySection";
import useAdminDashboard from "../hooks/useAdminDashboard";
import { BROWN } from "../features/dashboardHelpers";

export default function AdminDashboard() {
  const dashboard = useAdminDashboard();
  const {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
    search,
    setSearch,
    week,
    setWeek,
    data,
    errors,
    loading,
    lastUpdated,
    darkMode,
    setDarkMode,
    theme,
    load,
    derived,
    customerTotal,
    customerNew,
    msgTotal,
    msgNew,
    catTotal,
    overviewBars,
    overviewMax,
    statCards,
    report,
    chartDays,
    visibleProducts,
    statusRows,
    statusMax,
  } = dashboard;

  return (
    <DashboardThemeContext.Provider value={theme}>
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
            title="Dashboard"
            onMenuClick={() => setSidebarOpen(true)}
            darkMode={darkMode}
            onThemeToggle={() => setDarkMode((previous) => !previous)}
          />

          <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 12, color: theme.muted }}>
                {lastUpdated
                  ? `Last updated ${lastUpdated.toLocaleTimeString()}`
                  : "Loading…"}
              </Typography>
              <Button
                onClick={load}
                disabled={loading}
                disableElevation
                variant="outlined"
                startIcon={
                  loading ? (
                    <CircularProgress size={14} sx={{ color: BROWN }} />
                  ) : (
                    <Refresh />
                  )
                }
                sx={{
                  height: 32,
                  textTransform: "none",
                  color: BROWN,
                  borderColor: BROWN,
                  "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
                }}
              >
                Refresh
              </Button>
            </Box>

            {Object.keys(errors).length > 0 && (
              <Alert severity="warning">
                Some sections could not be loaded:{" "}
                {Object.entries(errors)
                  .map(([key, message]) => `${key} (${message})`)
                  .join(", ")}
              </Alert>
            )}

            {derived.truncated && (
              <Alert severity="info">
                More than 100 orders were placed in the last 14 days, so sales
                figures and best sellers are based on the 100 most recent ones.
              </Alert>
            )}

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {statCards.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </Box>

            <DashboardSalesSection
              report={report}
              week={week}
              setWeek={setWeek}
              chartDays={chartDays}
              darkMode={darkMode}
              loading={loading}
              errors={errors}
              customerTotal={customerTotal}
              customerNew={customerNew}
              overviewBars={overviewBars}
              overviewMax={overviewMax}
              statusRows={statusRows}
              statusMax={statusMax}
            />
            <DashboardOrdersProductsSection
              data={data}
              loading={loading}
              errors={errors}
              search={search}
              setSearch={setSearch}
              visibleProducts={visibleProducts}
            />
            <DashboardSummarySection
              data={data}
              loading={loading}
              errors={errors}
              derived={derived}
              catTotal={catTotal}
              msgTotal={msgTotal}
              msgNew={msgNew}
            />
          </Box>
        </Box>
      </Box>
    </DashboardThemeContext.Provider>
  );
}
