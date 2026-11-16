import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Dialog,
} from "@mui/material";

import {
  FilterList,
  SwapVert,
  Search,
  DownloadOutlined,
  DeleteOutlined,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";

import customerService, {
  PAGE_LIMIT,
  getErrorMessage,
} from "../service/customer.service";

// Lazy-loaded components
const Navbar = lazy(() => import("../components/Navbar"));
const Sidebar = lazy(() => import("../components/Sidebar"));
const CustomerDrawer = lazy(() => import("../components/customerDrawer"));
const CustomerTable = lazy(() => import("../components/customerTable"));

const LineChart = lazy(() =>
  import("@mui/x-charts/LineChart").then((module) => ({
    default: module.LineChart,
  })),
);

// Colors
const BROWN = "#947458";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SEARCH_DEBOUNCE_MS = 400;

// Format numbers
const formatCount = (value) => Number(value || 0).toLocaleString("en-US");

// Pagination numbers
const getPages = (page, totalPages) => {
  if (totalPages <= 0) return [];

  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, "...", totalPages];

  if (page >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

// Convert spend values into numbers for sorting
const getSpend = (spend) => Number(String(spend || "0").replace(/,/g, "")) || 0;

// Filter and sort customers in one reusable function
const sortCustomers = (
  customers,
  statusFilter,
  minOrders,
  sortBy,
  sortOrder,
) => {
  const filteredCustomers = customers.filter((customer) => {
    const orders = Number(customer.orders) || 0;

    const matchesStatus =
      statusFilter === "All" || customer.status === statusFilter;

    const matchesOrders = minOrders === "" || orders >= Number(minOrders);

    return matchesStatus && matchesOrders;
  });

  return filteredCustomers.sort((a, b) => {
    let firstValue;
    let secondValue;

    if (sortBy === "name") {
      firstValue = String(a.name || "").toLowerCase();
      secondValue = String(b.name || "").toLowerCase();
    } else if (sortBy === "orders") {
      firstValue = Number(a.orders) || 0;
      secondValue = Number(b.orders) || 0;
    } else {
      firstValue = getSpend(a.spend);
      secondValue = getSpend(b.spend);
    }

    if (firstValue === secondValue) return 0;

    if (sortOrder === "asc") {
      return firstValue < secondValue ? -1 : 1;
    }

    return firstValue > secondValue ? -1 : 1;
  });
};

// Reusable icon button
function SquareIconButton({ children, label, onClick, darkMode = false }) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        border: `1px solid ${darkMode ? "#403832" : "#E8EDF3"}`,
        borderRadius: 2,
        color: darkMode ? "#F5F0EB" : "#444",
        "&:hover": {
          bgcolor: darkMode ? "#39312B" : BG,
        },
      }}
    >
      {children}
    </IconButton>
  );
}

// Reusable card
function Card({ children, sx = {}, darkMode = false }) {
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

// Three-dot menu icon
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

// Statistics card
function CustomerStatCard({ title, value, change, up, darkMode = false }) {
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

        <Typography
          sx={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 12,
            color: up ? GREEN : RED,
          }}
        >
          {up ? (
            <ArrowUpward sx={{ fontSize: 14 }} />
          ) : (
            <ArrowDownward sx={{ fontSize: 14 }} />
          )}
          {change}
        </Typography>
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

export default function AdminCustomers() {
  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Selected customers
  const [selected, setSelected] = useState([]);

  // Filters and sorting
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [minOrders, setMinOrders] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Chart
  const [week, setWeek] = useState("this");

  const overview = {
    thisWeek: [4, 6, 3, 8, 5, 9, 7],
    lastWeek: [2, 5, 4, 6, 3, 7, 5],
  };

  // Customer data and pagination
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Customer details drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCustomer, setDrawerCustomer] = useState(null);

  // Saved theme
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  // Wait briefly before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchTerm = search.trim();

      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setPage(1);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  // Load customers from the backend
  useEffect(() => {
    let cancelled = false;

    const loadCustomers = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await customerService.list({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch,
        });

        if (cancelled) return;

        setCustomers(result.customers || []);
        setTotal(Number(result.total) || 0);
        setTotalPages(Number(result.totalPages) || 0);

        setStats({
          total: Number(result.stats?.total) || Number(result.total) || 0,
          newThisMonth: Number(result.stats?.newThisMonth) || 0,
        });
      } catch (err) {
        if (cancelled) return;

        console.error("Could not load customers:", err);

        setCustomers([]);
        setTotal(0);
        setTotalPages(0);
        setStats({ total: 0, newThisMonth: 0 });

        setError(getErrorMessage(err, "Could not load customers"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, reloadKey]);

  // Move back if the current page no longer exists
  useEffect(() => {
    if (!loading && !error && totalPages > 0 && page > totalPages) {
      // eslint-disable-next-line
      setPage(totalPages);
    }
  }, [loading, error, totalPages, page]);

  // Reload customer data after deleting
  const reload = () => {
    setReloadKey((previous) => previous + 1);
  };

  // Colors for light and dark themes
  const theme = {
    page: darkMode ? "#1C1917" : BG,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : BROWN_LIGHT,
    headText: darkMode ? "#F5F0EB" : "#333",
    divider: darkMode ? "#403832" : "#EEEEEE",
    tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
    searchIcon: darkMode ? "#B8AAA0" : "#666",
    dialogTitle: darkMode ? "#F5F0EB" : "#0F172A",
    dialogText: darkMode ? "#B8AAA0" : "#64748B",
    dangerBg: darkMode ? "rgba(229,72,77,.15)" : "#FDECEC",
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
    slotProps: {
      paper: { sx: paperSx },
    },
  };

  // Statistics cards
  const statCards = [
    {
      title: "Total Customers",
      value: formatCount(stats.total || total),
      change: "14.4%",
      up: true,
    },
    {
      title: "New Customers",
      value: formatCount(stats.newThisMonth),
      change: "20%",
      up: true,
    },
    {
      title: "Visitor",
      value: "250k",
      change: "20%",
      up: true,
    },
  ];

  // Menu actions
  const openFilter = (event) => setFilterAnchor(event.currentTarget);
  const closeFilter = () => setFilterAnchor(null);
  const openMore = (event) => setMoreAnchor(event.currentTarget);
  const closeMore = () => setMoreAnchor(null);

  // Select or unselect one customer
  const toggleSelected = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Filter and sort customers
  const sortedCustomers = useMemo(() => {
    return sortCustomers(customers, statusFilter, minOrders, sortBy, sortOrder);
  }, [customers, statusFilter, minOrders, sortBy, sortOrder]);

  // Select or unselect all visible customers
  const toggleAll = () => {
    const visibleIds = sortedCustomers.map((customer) => customer.id);

    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

    if (allSelected) {
      setSelected(selected.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelected([...new Set([...selected, ...visibleIds])]);
    }
  };

  // Delete one customer
  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerService.remove(customerToDelete.id);

      setSelected(selected.filter((id) => id !== customerToDelete.id));

      setDeleteOpen(false);
      setCustomerToDelete(null);
      reload();
    } catch (err) {
      setDeleteOpen(false);
      alert(getErrorMessage(err, "Could not delete customer"));
    }
  };

  // Delete selected customers
  const deleteSelectedCustomers = async () => {
    if (selected.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selected.length} selected customer(s)?`,
    );

    if (!confirmed) return;

    const results = await Promise.allSettled(
      selected.map((id) => customerService.remove(id)),
    );

    const failed = results.filter(
      (result) => result.status === "rejected",
    ).length;

    if (failed > 0) {
      alert(`${failed} customer(s) could not be deleted`);
    }

    setSelected([]);
    setPage(1);
    reload();
  };

  // Export customers to CSV
  const exportCustomers = async () => {
    // eslint-disable-next-line
    let exportData = [];

    try {
      const allCustomers = await customerService.getAll({
        search: debouncedSearch,
      });

      exportData = sortCustomers(
        allCustomers,
        statusFilter,
        minOrders,
        sortBy,
        sortOrder,
      );

      // Export only selected customers when any are selected
      if (selected.length > 0) {
        exportData = exportData.filter((customer) =>
          selected.includes(customer.id),
        );
      }
    } catch (err) {
      alert(getErrorMessage(err, "Could not export customers"));
      return;
    }

    if (exportData.length === 0) {
      alert("No customers to export");
      return;
    }

    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Order Count",
      "Total Spend",
      "Status",
    ];

    const rows = exportData.map((customer) => [
      customer.code,
      customer.name,
      customer.phone,
      customer.orders,
      customer.spend,
      customer.status,
    ]);

    // Escape commas and quotation marks for CSV
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      selected.length > 0 ? "selected-customers.csv" : "customers.csv";

    link.click();
    URL.revokeObjectURL(url);
  };

  const tableMessage = loading
    ? "Loading customers..."
    : error || "No customers found";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.page,
        color: theme.muted,
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      {/* Sidebar */}
      <Suspense fallback={null}>
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          darkMode={darkMode}
        />
      </Suspense>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        {/* Navbar */}
        <Suspense fallback={null}>
          <Navbar
            title="Customers"
            onMenuClick={() => setSidebarOpen(true)}
            darkMode={darkMode}
            onThemeToggle={() => setDarkMode(!darkMode)}
          />
        </Suspense>

        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 2 },
            display: "grid",
            gap: 2.5,
          }}
        >
          {/* Page heading */}
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
              Customer List
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
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
                slotProps={{ paper: { sx: paperSx } }}
              >
                <MenuItem
                  onClick={() => {
                    closeMore();
                    exportCustomers();
                  }}
                >
                  <DownloadOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Export Orders
                </MenuItem>

                <MenuItem
                  disabled={selected.length === 0}
                  onClick={() => {
                    closeMore();
                    deleteSelectedCustomers();
                  }}
                >
                  <DeleteOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Delete Selected
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Statistics and chart */}
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1fr) minmax(0, 3fr)",
              },
            }}
          >
            <Box sx={{ display: "grid", gap: 2, alignContent: "start" }}>
              {statCards.map((stat) => (
                <CustomerStatCard
                  key={stat.title}
                  {...stat}
                  darkMode={darkMode}
                />
              ))}
            </Box>

            <Card darkMode={darkMode}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                  Customer Overview
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: theme.soft,
                      p: 0.5,
                      borderRadius: 2,
                    }}
                  >
                    {[
                      ["this", "This week"],
                      ["last", "Last week"],
                    ].map(([key, label]) => (
                      <Button
                        key={key}
                        onClick={() => setWeek(key)}
                        disableElevation
                        sx={{
                          minWidth: 0,
                          height: 28,
                          px: 1.5,
                          lineHeight: 1,
                          fontSize: 12,
                          textTransform: "none",
                          borderRadius: 1.5,
                          bgcolor: week === key ? BROWN : "transparent",
                          color: week === key ? "#fff" : theme.muted,
                          "&:hover": {
                            bgcolor: week === key ? BROWN : theme.tabHover,
                          },
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>

                  <MenuButton darkMode={darkMode} />
                </Box>
              </Box>

              <Box sx={{ mt: 2, width: "100%", minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: theme.text,
                    mb: 0.5,
                  }}
                >
                  New Customers
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: theme.muted,
                    mb: 2,
                  }}
                >
                  {week === "this" ? "This week" : "Last week"} — Daily
                  registrations
                </Typography>

                <Suspense
                  fallback={<Box sx={{ height: 280, width: "100%" }} />}
                >
                  <LineChart
                    height={280}
                    margin={{
                      left: 55,
                      right: 20,
                      top: 20,
                      bottom: 30,
                    }}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: DAYS,
                        tickLabelStyle: {
                          fill: darkMode ? "#B8AAA0" : "#777777",
                          fontSize: 12,
                        },
                      },
                    ]}
                    yAxis={[
                      {
                        min: 0,
                        tickLabelStyle: {
                          fill: darkMode ? "#B8AAA0" : "#777777",
                          fontSize: 12,
                        },
                      },
                    ]}
                    series={[
                      {
                        id: "new-customers",
                        label: "New Customers",
                        data:
                          week === "this"
                            ? overview.thisWeek
                            : overview.lastWeek,
                        color: BROWN,
                        area: true,
                        showMark: true,
                        curve: "monotoneX",
                      },
                    ]}
                    grid={{ horizontal: true }}
                    sx={{
                      width: "100%",
                      "& .MuiLineElement-root": {
                        strokeWidth: 2.5,
                      },
                      "& .MuiAreaElement-root": {
                        fillOpacity: 0.15,
                      },
                      "& .MuiChartsAxis-line": {
                        stroke: darkMode ? "#554940" : "#E5E7EB",
                      },
                      "& .MuiChartsAxis-tick": {
                        stroke: darkMode ? "#554940" : "#E5E7EB",
                      },
                      "& .MuiChartsGrid-line": {
                        stroke: darkMode ? "#403832" : "#EEEEEE",
                      },
                    }}
                  />
                </Suspense>
              </Box>
            </Card>
          </Box>

          {/* Customer table */}
          <Card darkMode={darkMode}>
            {/* Table toolbar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                Customer List
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: 1,
                  ml: "auto",
                }}
              >
                {/* Search */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: theme.soft,
                    borderRadius: 2,
                    px: 1.5,
                    height: 40,
                    width: { xs: "100%", sm: 220 },
                  }}
                >
                  <InputBase
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search customers..."
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

                {/* Filters */}
                <SquareIconButton
                  label="Filter customers"
                  onClick={openFilter}
                  darkMode={darkMode}
                >
                  <FilterList fontSize="small" />
                </SquareIconButton>

                <Popover
                  open={Boolean(filterAnchor)}
                  anchorEl={filterAnchor}
                  onClose={closeFilter}
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
                        width: 280,
                        borderRadius: 3,
                        mt: 1,
                        ...paperSx,
                      },
                    },
                  }}
                >
                  <Typography fontWeight={700} sx={{ mb: 2 }}>
                    Filter Customers
                  </Typography>

                  <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
                    Customer Status
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    slotProps={{
                      select: { MenuProps: menuProps },
                    }}
                    sx={{ mb: 2, ...fieldSx }}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
                  </TextField>

                  <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
                    Minimum Orders
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={minOrders}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                    onChange={(event) => setMinOrders(event.target.value)}
                    sx={fieldSx}
                  />

                  <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setStatusFilter("All");
                        setMinOrders("");
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
                        "&:hover": { bgcolor: "#7d6149" },
                      }}
                    >
                      Done
                    </Button>
                  </Box>
                </Popover>

                {/* Sort direction */}
                <SquareIconButton
                  label="Change sorting"
                  darkMode={darkMode}
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  <SwapVert fontSize="small" />
                </SquareIconButton>
              </Box>

              {/* Sort field */}
              <TextField
                select
                size="small"
                label="Sort by"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                slotProps={{
                  select: { MenuProps: menuProps },
                }}
                sx={{ width: 145, ...fieldSx }}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="orders">Order Count</MenuItem>
                <MenuItem value="spend">Total Spend</MenuItem>
              </TextField>
            </Box>

            {/* Lazy-loaded customer table */}
            <Suspense
              fallback={
                <Box sx={{ minHeight: 150, py: 4, textAlign: "center" }}>
                  <Typography sx={{ color: theme.muted }}>
                    Loading customers...
                  </Typography>
                </Box>
              }
            >
              <CustomerTable
                customers={sortedCustomers}
                selected={selected}
                message={tableMessage}
                theme={theme}
                darkMode={darkMode}
                onToggle={toggleSelected}
                onToggleAll={toggleAll}
                onView={(customer) => {
                  setDrawerCustomer(customer);
                  setDrawerOpen(true);
                }}
                onDelete={(customer) => {
                  setCustomerToDelete(customer);
                  setDeleteOpen(true);
                }}
              />
            </Suspense>

            {/* Pagination */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                sx={{
                  height: 36,
                  color: theme.text,
                  borderColor: theme.border,
                  "&:hover": {
                    borderColor: BROWN,
                    bgcolor: theme.soft,
                  },
                  textTransform: "none",
                }}
              >
                Previous
              </Button>

              <Box sx={{ display: "flex", gap: 1 }}>
                {getPages(page, totalPages).map((number, index) => (
                  <Button
                    key={`${number}-${index}`}
                    disabled={number === "..."}
                    onClick={() => {
                      if (typeof number === "number") {
                        setPage(number);
                      }
                    }}
                    sx={{
                      minWidth: 0,
                      width: 36,
                      height: 36,
                      fontSize: 13,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: page === number ? BROWN : theme.border,
                      bgcolor: page === number ? theme.header : "transparent",
                      color:
                        page === number
                          ? darkMode
                            ? "#D8B89A"
                            : BROWN
                          : theme.text,
                      fontWeight: page === number ? 700 : 400,
                      "&.Mui-disabled": { color: theme.text },
                    }}
                  >
                    {number}
                  </Button>
                ))}
              </Box>

              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                disabled={page >= totalPages || totalPages === 0}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                sx={{
                  height: 36,
                  color: theme.text,
                  borderColor: theme.border,
                  "&:hover": {
                    borderColor: BROWN,
                    bgcolor: theme.soft,
                  },
                  textTransform: "none",
                }}
              >
                Next
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Customer details drawer */}
      <Suspense fallback={null}>
        <CustomerDrawer
          open={drawerOpen}
          customer={drawerCustomer}
          onClose={() => setDrawerOpen(false)}
          darkMode={darkMode}
        />
      </Suspense>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              bgcolor: theme.card,
              color: theme.text,
              backgroundImage: "none",
              border: `1px solid ${theme.border}`,
            },
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            bgcolor: theme.dangerBg,
            color: RED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DeleteOutlined sx={{ fontSize: 28 }} />
        </Box>

        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: theme.dialogTitle,
          }}
        >
          Delete customer?
        </Typography>

        <Typography sx={{ fontSize: 14, color: theme.dialogText, mt: 1 }}>
          Are you sure you want to delete <b>{customerToDelete?.name}</b> (
          {customerToDelete?.code})? This action cannot be undone.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button
            fullWidth
            autoFocus
            variant="outlined"
            onClick={() => setDeleteOpen(false)}
            sx={{
              height: 42,
              color: theme.text,
              borderColor: theme.border,
              "&:hover": {
                borderColor: BROWN,
                bgcolor: theme.soft,
              },
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={confirmDelete}
            sx={{
              height: 42,
              bgcolor: RED,
              textTransform: "none",
              "&:hover": { bgcolor: "#C93C41" },
            }}
          >
            Delete
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
