import { lazy, Suspense, useMemo, useState } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { DownloadOutlined } from "@mui/icons-material";

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";
import InvoiceStatCard from "../components/InvoiceStatCard";
import { BROWN, TOAST_DURATION_MS } from "../constants/invoice.constants";
import useDarkMode from "../hooks/useDarkMode";
import useToast from "../hooks/useToast";
import useInvoices from "../hooks/useInvoices";
import useInvoiceStats from "../hooks/useInvoiceStats";
import useInvoiceActions from "../hooks/useInvoiceActions";
import useInvoiceExport from "../hooks/useInvoiceExport";
import { getPageTheme } from "../utils/invoice.theme";

const InvoiceTable = lazy(() => import("../components/InvoiceTable"));
// Popup that loads one invoice and offers the PDF download (already in your project)
const InvoiceDialog = lazy(() => import("../../../invoice/components/InvoiceDialog"));

export default function AdminInvoice() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { darkMode, toggleDarkMode } = useDarkMode();
  const { toast, showToast, clearToast } = useToast();

  const {
    filters,
    updateFilters,
    invoices,
    totalItems,
    totalPages,
    loading,
  } = useInvoices({ onError: showToast });
  const { counts, stats } = useInvoiceStats();
  const { viewOrder, handleView, closeView, downloadingId, handleDownload } =
    useInvoiceActions({ onError: showToast });
  const { exporting, exportCsv } = useInvoiceExport({
    filters,
    onError: showToast,
  });

  const theme = useMemo(() => getPageTheme(darkMode), [darkMode]);

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
          title="Invoices"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={toggleDarkMode}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
          {/* Title + actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: theme.text }}>
              Invoices
            </Typography>

            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              disabled={exporting}
              onClick={exportCsv}
              sx={{
                height: 40,
                px: 2.5,
                bgcolor: theme.card,
                color: theme.text,
                borderColor: theme.border,
                textTransform: "none",
                "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
              }}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          </Box>

          {/* Statistics */}
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
            {stats.map((stat) => (
              <InvoiceStatCard key={stat.title} {...stat} darkMode={darkMode} />
            ))}
          </Box>

          {/* Table */}
          <Suspense fallback={null}>
            <InvoiceTable
              invoices={invoices}
              counts={counts}
              filters={filters}
              onFiltersChange={updateFilters}
              totalItems={totalItems}
              totalPages={totalPages}
              loading={loading}
              downloadingId={downloadingId}
              onView={handleView}
              onDownload={handleDownload}
              darkMode={darkMode}
            />
          </Suspense>
        </Box>
      </Box>

      {viewOrder && (
        <Suspense fallback={null}>
          <InvoiceDialog open={Boolean(viewOrder)} order={viewOrder} onClose={closeView} />
        </Suspense>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={TOAST_DURATION_MS}
        onClose={clearToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={clearToast}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
