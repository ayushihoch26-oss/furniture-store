import {
  lazy,
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  DownloadOutlined,
} from "@mui/icons-material";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { downloadInvoice } from "../../page/invoice";
import {
  getInvoiceByOrder,
  getInvoiceError,
} from "../../service/invoice.service";
import { getInvoices, getInvoiceStats } from "../service/invoice.service";

const InvoiceTable = lazy(() => import("../components/invoiceTable"));
// Popup that loads one invoice and offers the PDF download (already in your project)
const InvoiceDialog = lazy(() => import("../../page/invoicedemo"));

const BROWN = "#947458";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  search: "",
  paymentMethod: "",
  fromDate: "",
  toDate: "",
  minTotal: "",
  maxTotal: "",
  sortBy: "date",
  sortOrder: "desc",
};

// API: { success, data: {...} }
const getPayload = (response) =>
  response?.data?.data ?? response?.data ?? response;

const errorText = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "";

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

function InvoiceStatCard({ title, value, change, darkMode = false }) {
  const up = change > 0 ? true : change < 0 ? false : undefined;
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
          {Math.abs(change || 0)}%
        </Typography>
      </Box>

      <Typography
        sx={{ fontSize: 12, color: darkMode ? "#B8AAA0" : "#777", mt: 1 }}
      >
        vs previous 7 days
      </Typography>
    </Card>
  );
}

export default function AdminInvoice() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  // One source of truth for page / search / filter / sort
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [invoices, setInvoices] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState({
    total: 0,
    revenue: 0,
    card: 0,
    cod: 0,
    changes: { total: 0, revenue: 0, card: 0, cod: 0 },
  });

  const [viewOrder, setViewOrder] = useState(null); // opens the invoice popup
  const [downloadingId, setDownloadingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");

  const latestRequest = useRef(0);

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const theme = useMemo(
    () => ({
      page: darkMode ? "#1C1917" : BG,
      card: darkMode ? "#292421" : "#FFFFFF",
      text: darkMode ? "#F5F0EB" : "#222222",
      border: darkMode ? "#403832" : "#E8EDF3",
      soft: darkMode ? "#332D28" : BG,
    }),
    [darkMode],
  );

  // Table calls this with a patch. Any change except page resets to page 1.
  const updateFilters = useCallback((patch) => {
    setFilters((previous) => ({
      ...previous,
      ...(patch.page === undefined ? { page: 1 } : {}),
      ...patch,
    }));
  }, []);

  // ---------- Load invoices whenever filters change ----------
  useEffect(() => {
    const requestId = ++latestRequest.current;

    const run = async () => {
      setLoading(true);
      try {
        const payload = getPayload(await getInvoices(filters));
        if (requestId !== latestRequest.current) return; // outdated response

        const pages = Math.max(1, Number(payload.totalPages) || 1);

        if (filters.page > pages) {
          setFilters((previous) => ({ ...previous, page: pages }));
          return;
        }

        setInvoices(
          (payload.rows || []).map((item) => ({
            ...item,
            date: formatDate(item.issuedAt),
          })),
        );
        setTotalItems(Number(payload.totalItems) || 0);
        setTotalPages(pages);
      } catch (error) {
        if (requestId === latestRequest.current) {
          setToast(errorText(error, "Failed to load invoices"));
        }
      } finally {
        if (requestId === latestRequest.current) setLoading(false);
      }
    };

    run();
  }, [filters]);

  // ---------- Stats ----------
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = getPayload(await getInvoiceStats());
        if (!active) return;
        setCounts({
          total: Number(result?.total ?? 0),
          revenue: Number(result?.revenue ?? 0),
          card: Number(result?.card ?? 0),
          cod: Number(result?.cod ?? 0),
          changes: result?.changes ?? { total: 0, revenue: 0, card: 0, cod: 0 },
        });
      } catch (error) {
        console.error(
          "Failed to load invoice statistics:",
          errorText(error, "Unknown error"),
        );
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Invoices",
        value: counts.total,
        change: counts.changes.total,
      },
      {
        title: "Total Revenue",
        value: money(counts.revenue),
        change: counts.changes.revenue,
      },
      {
        title: "Card Payments",
        value: counts.card,
        change: counts.changes.card,
      },
      {
        title: "Cash on Delivery",
        value: counts.cod,
        change: counts.changes.cod,
      },
    ],
    [counts],
  );

  // ---------- Actions ----------
  const handleView = useCallback(
    (item) => setViewOrder({ id: item.orderId }),
    [],
  );

  const handleDownload = useCallback(async (item) => {
    setDownloadingId(item.id);
    try {
      const invoice = await getInvoiceByOrder(item.orderId);
      downloadInvoice(invoice);
    } catch (error) {
      setToast(getInvoiceError(error));
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // Export ALL invoices that match the current search/filter (not just this page)
  const exportCsv = useCallback(async () => {
    setExporting(true);
    try {
      let rows = [];
      let current = 1;
      let pages = 1;

      do {
        const payload = getPayload(
          await getInvoices({ ...filters, page: current, limit: 100 }),
        );
        rows = rows.concat(payload.rows || []);
        pages = Number(payload.totalPages) || 1;
        current += 1;
      } while (current <= pages);

      if (rows.length === 0) {
        setToast("No invoices to export");
        return;
      }

      const headers = [
        "Invoice",
        "Order",
        "Customer",
        "Email",
        "Phone",
        "Date",
        "Payment",
        "Items total",
        "Discount",
        "Coupon",
        "Shipping",
        "Tax",
        "Total",
      ];
      const body = rows.map((r) => [
        r.invoiceNumber,
        r.orderNumber,
        r.customerName,
        r.email,
        r.phone,
        formatDate(r.issuedAt),
        r.paymentMethod === "cod"
          ? "Cash on delivery"
          : `Card ${r.cardLast4}`.trim(),
        r.itemsTotal,
        r.discount,
        r.couponCode,
        r.shippingCost,
        r.tax,
        r.total,
      ]);

      const csv = [headers, ...body]
        .map((row) =>
          row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "invoices.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setToast(errorText(error, "Failed to export invoices"));
    } finally {
      setExporting(false);
    }
  }, [filters]);

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
          onThemeToggle={() => setDarkMode((previous) => !previous)}
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
            <Typography
              sx={{ fontSize: 22, fontWeight: 700, color: theme.text }}
            >
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
          <InvoiceDialog
            open={Boolean(viewOrder)}
            order={viewOrder}
            onClose={() => setViewOrder(null)}
          />
        </Suspense>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setToast("")}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
