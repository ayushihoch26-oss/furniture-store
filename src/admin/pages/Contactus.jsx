import {
  lazy,
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  DeleteOutlined,
  DownloadOutlined,
  DeleteOutlineOutlined,
  DraftsOutlined,
  ReplyOutlined,
} from "@mui/icons-material";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  getContactMessages,
  getContactStats,
  getContactById,
  updateStatus,
  deleteContactMessage,
} from "../service/contact.service";

const ContactTable = lazy(() => import("../components/contactTable"));

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

const getPayload = (response) =>
  response?.data?.data ?? response?.data ?? response;

function Card({ children, darkMode }) {
  return (
    <Box
      sx={{
        bgcolor: darkMode ? "#292421" : "#FFFFFF",
        color: darkMode ? "#F5F0EB" : "#222222",
        border: `1px solid ${darkMode ? "#403832" : "#EEEEEE"}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
      }}
    >
      {children}
    </Box>
  );
}

function ContactStatCard({ title, value, change, up, darkMode }) {
  const color = up === false ? RED : GREEN;

  return (
    <Card darkMode={darkMode}>
      <Typography fontSize={16} fontWeight={700}>
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1.5,
          fontSize: 28,
          fontWeight: 800,
          color: darkMode ? "#D8B89A" : BROWN,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          display: "flex",
          alignItems: "center",
          fontSize: 12,
          color,
        }}
      >
        {up === true && <ArrowUpward sx={{ fontSize: 14 }} />}
        {up === false && <ArrowDownward sx={{ fontSize: 14 }} />}
        {change}
      </Typography>

      <Typography fontSize={12} color={darkMode ? "#B8AAA0" : "#777"} mt={1}>
        Last 7 days
      </Typography>
    </Card>
  );
}

export default function AdminContact() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  const [moreAnchor, setMoreAnchor] = useState(null);

  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState([]);

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    subject: "",
    fromDate: "",
    toDate: "",
    sortOrder: "desc",
  });

  const [viewed, setViewed] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({
    ids: [],
    name: "",
  });

  const latestRequest = useRef(0);

  // Dark mode
  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const theme = useMemo(
    () => ({
      page: darkMode ? "#1C1917" : BG,
      card: darkMode ? "#292421" : "#FFFFFF",
      text: darkMode ? "#F5F0EB" : "#222222",
      muted: darkMode ? "#B8AAA0" : "#777777",
      border: darkMode ? "#403832" : "#E8EDF3",
      soft: darkMode ? "#332D28" : BG,
    }),
    [darkMode],
  );

  // Fetch contact messages
  const loadMessages = useCallback(async (query = {}) => {
    const requestId = ++latestRequest.current;

    const params = {
      page: Math.max(1, Number(query.page) || 1),
      limit: Math.min(100, Math.max(1, Number(query.limit) || 10)),
      search: String(query.search || "").trim(),
      status: query.status || "",
      subject: query.subject || "",
      fromDate: query.fromDate || "",
      toDate: query.toDate || "",
      sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
    };

    try {
      setLoading(true);

      const response = await getContactMessages(params);

      if (requestId !== latestRequest.current) return;

      const payload = getPayload(response);

      const rows = Array.isArray(payload)
        ? payload
        : payload?.rows ||
          payload?.messages ||
          payload?.contacts ||
          payload?.items ||
          [];

      const total = Number(
        payload?.total ?? payload?.totalItems ?? payload?.count ?? rows.length,
      );

      const calculatedPages = Math.ceil(total / params.limit);

      setMessages(
        rows.map((item) => ({
          ...item,
          dbId: item.dbId ?? item.id,
          id: item.messageId || item.id,
          date:
            item.date ||
            (item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-GB")
              : ""),
          name: item.name || "",
          email: item.email || "",
          phone: item.phone || "",
          subject: item.subject || "General Question",
          status: item.status || "New",
          message: item.message || "",
        })),
      );

      setTotalItems(Number.isFinite(total) ? total : rows.length);

      setTotalPages(
        Math.max(1, Number(payload?.totalPages) || calculatedPages || 1),
      );
    } catch (error) {
      if (requestId !== latestRequest.current) return;

      console.error(
        "Contact messages fetch failed:",
        error.response?.data || error.message,
      );

      setMessages([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await getContactStats();
      const result = getPayload(response);

      setCounts({
        total: Number(result?.total ?? 0),
        new: Number(result?.new ?? 0),
        read: Number(result?.read ?? 0),
        replied: Number(result?.replied ?? 0),
      });
    } catch (error) {
      console.error("Statistics error:", error.message);
    }
  }, []);

  // Fetch on filter/page changes
  useEffect(
    () => {
      // eslint-disable-next-line
      loadMessages({
        ...filters,
        page,
      });
    },
    // eslint-disable-next-line
    [
      page,
      filters.limit,
      filters.search,
      filters.status,
      filters.subject,
      filters.fromDate,
      filters.toDate,
      filters.sortOrder,
      loadMessages,
    ],
  );

  useEffect(() => {
    // eslint-disable-next-line
    loadStats();
  }, [loadStats]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([loadMessages({ ...filters, page }), loadStats()]);
  }, [filters, page, loadMessages, loadStats]);

  // Search, sorting, filters and pagination
  const handleQueryChange = useCallback(
    (query) => {
      setFilters((previous) => {
        const next = {
          ...previous,
          ...query,
          search: String(query.search ?? previous.search).trim(),
          status: query.status ?? previous.status,
          subject: query.subject ?? previous.subject,
          fromDate: query.fromDate ?? previous.fromDate,
          toDate: query.toDate ?? previous.toDate,
          sortOrder:
            (query.sortOrder ?? previous.sortOrder) === "asc" ? "asc" : "desc",
          limit: Math.max(1, Number(query.limit ?? previous.limit) || 10),
        };

        const changed =
          next.search !== previous.search ||
          next.status !== previous.status ||
          next.subject !== previous.subject ||
          next.fromDate !== previous.fromDate ||
          next.toDate !== previous.toDate ||
          next.sortOrder !== previous.sortOrder ||
          next.limit !== previous.limit;

        const nextPage = changed
          ? 1
          : Math.max(1, Number(query.page ?? page) || 1);

        setPage(nextPage);

        return { ...next, page: nextPage };
      });
    },
    [page],
  );

  // Statistics cards
  const stats = useMemo(
    () => [
      {
        title: "Total Messages",
        value: counts.total,
        change: "14.4%",
        up: true,
      },
      {
        title: "New Messages",
        value: counts.new,
        change: "20%",
        up: true,
      },
      {
        title: "Read Messages",
        value: counts.read,
        change: "5%",
        up: false,
      },
      {
        title: "Replied Messages",
        value: counts.replied,
        change: "85%",
        up: true,
      },
    ],
    [counts],
  );

  // View message and mark as read
  const handleView = useCallback(
    async (item) => {
      try {
        const response = await getContactById(item.dbId ?? item.id);
        const data = getPayload(response);

        const message = data?.data ?? data?.message ?? data;

        setViewed(message);

        if (message.status === "New") {
          await updateStatus(message.id ?? item.dbId, "Read");

          setViewed((previous) =>
            previous ? { ...previous, status: "Read" } : null,
          );

          await refreshData();
        }
      } catch (error) {
        console.error("View message error:", error.message);
        setViewed(item);
      }
    },
    [refreshData],
  );

  // Mark as replied
  const markReplied = useCallback(async () => {
    if (!viewed?.id && !viewed?.dbId) return;

    try {
      await updateStatus(viewed.dbId ?? viewed.id, "Replied");

      setViewed((previous) =>
        previous ? { ...previous, status: "Replied" } : null,
      );

      await refreshData();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }, [viewed, refreshData]);

  // Mark selected messages as read
  const markSelectedRead = useCallback(async () => {
    if (!selected.length) return;

    try {
      await Promise.all(selected.map((id) => updateStatus(id, "Read")));

      setSelected([]);
      await refreshData();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }, [selected, refreshData]);

  // Open delete dialog
  const openDelete = useCallback((ids, name = "") => {
    setDeleteTarget({
      ids: Array.isArray(ids) ? ids : [ids],
      name,
    });

    setDeleteOpen(true);
  }, []);

  // Delete messages
  const confirmDelete = useCallback(async () => {
    const ids = deleteTarget.ids;

    if (!ids.length) return;

    try {
      await Promise.all(ids.map((id) => deleteContactMessage(id)));

      setSelected((previous) =>
        previous.filter(
          (id) => !ids.some((deletedId) => String(deletedId) === String(id)),
        ),
      );

      setDeleteOpen(false);

      const remaining = Math.max(0, totalItems - ids.length);
      const lastPage = Math.max(1, Math.ceil(remaining / filters.limit));

      const nextPage = Math.min(page, lastPage);

      setPage(nextPage);

      await Promise.all([
        loadMessages({ ...filters, page: nextPage }),
        loadStats(),
      ]);
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }, [deleteTarget, totalItems, filters, page, loadMessages, loadStats]);

  // Export CSV
  const exportMessages = useCallback(() => {
    const data =
      selected.length > 0
        ? messages.filter((item) =>
            selected.some((id) => String(id) === String(item.dbId ?? item.id)),
          )
        : messages;

    if (!data.length) {
      alert("No messages to export");
      return;
    }

    const headers = [
      "Message ID",
      "Name",
      "Email",
      "Phone",
      "Subject",
      "Date",
      "Status",
      "Message",
    ];

    const csvRows = data.map((item) => [
      item.messageId ?? item.id,
      item.name,
      item.email,
      item.phone,
      item.subject,
      item.date,
      item.status,
      item.message,
    ]);

    const csv = [headers, ...csvRows]
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
      selected.length > 0 ? "selected-messages.csv" : "all-messages.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }, [selected, messages]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.page,
        color: theme.text,
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
          title="Contact Us"
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
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography fontSize={22} fontWeight={700}>
              Contact Messages
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                endIcon={<MoreVert />}
                onClick={(event) => setMoreAnchor(event.currentTarget)}
                sx={{
                  height: 40,
                  bgcolor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                  textTransform: "none",
                }}
              >
                More Action
              </Button>

              <Menu
                anchorEl={moreAnchor}
                open={Boolean(moreAnchor)}
                onClose={() => setMoreAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: theme.card,
                    color: theme.text,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    exportMessages();
                  }}
                >
                  <DownloadOutlined sx={{ mr: 1.5 }} />
                  Export Messages
                </MenuItem>

                <MenuItem
                  disabled={!selected.length}
                  onClick={() => {
                    setMoreAnchor(null);
                    markSelectedRead();
                  }}
                >
                  <DraftsOutlined sx={{ mr: 1.5 }} />
                  Mark Selected as Read
                </MenuItem>

                <MenuItem
                  disabled={!selected.length}
                  onClick={() => {
                    setMoreAnchor(null);
                    openDelete(selected.map((id) => id));
                  }}
                >
                  <DeleteOutlineOutlined sx={{ mr: 1.5 }} />
                  Delete Selected
                </MenuItem>
              </Menu>
            </Box>
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
              <ContactStatCard key={stat.title} {...stat} darkMode={darkMode} />
            ))}
          </Box>

          {/* Contact Table */}
          <Suspense fallback={<CircularProgress />}>
            <ContactTable
              messages={messages}
              selected={selected}
              setSelected={setSelected}
              page={page}
              setPage={setPage}
              totalItems={totalItems}
              totalMessages={totalItems}
              totalPages={totalPages}
              onQueryChange={handleQueryChange}
              onView={handleView}
              onDelete={(item) => openDelete([item.dbId ?? item.id], item.name)}
              darkMode={darkMode}
              loading={loading}
            />
          </Suspense>
        </Box>
      </Box>

      {/* View Message Dialog */}
      <Dialog
        open={Boolean(viewed)}
        onClose={() => setViewed(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: theme.card,
            color: theme.text,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle>Message Details</DialogTitle>

        <DialogContent dividers>
          {viewed && (
            <Box sx={{ display: "grid", gap: 2 }}>
              {[
                ["Message ID", viewed.messageId ?? viewed.id],
                ["Name", viewed.name],
                ["Email", viewed.email],
                ["Phone", viewed.phone || "-"],
                ["Subject", viewed.subject],
                ["Date", viewed.date ?? viewed.createdAt ?? "-"],
                ["Status", viewed.status],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    borderBottom: `1px solid ${theme.border}`,
                    pb: 1.5,
                  }}
                >
                  <Typography color="text.secondary">{label}</Typography>

                  <Typography
                    fontWeight={600}
                    textAlign="right"
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}

              <Box>
                <Typography mb={1}>Message</Typography>

                <Box
                  sx={{
                    bgcolor: theme.soft,
                    borderRadius: 2,
                    p: 2,
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {viewed.message}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewed(null)} sx={{ color: theme.muted }}>
            Close
          </Button>

          {viewed && (
            <>
              <Button
                variant="outlined"
                component="a"
                href={`mailto:${viewed.email}?subject=${encodeURIComponent(
                  `Re: ${viewed.subject}`,
                )}`}
                startIcon={<ReplyOutlined />}
                sx={{
                  color: BROWN,
                  borderColor: BROWN,
                  textTransform: "none",
                }}
              >
                Reply by Email
              </Button>

              <Button
                variant="contained"
                disabled={viewed.status === "Replied"}
                onClick={markReplied}
                sx={{
                  bgcolor: BROWN,
                  "&:hover": { bgcolor: BROWN_DARK },
                  textTransform: "none",
                }}
              >
                Mark as Replied
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            bgcolor: theme.card,
            color: theme.text,
            backgroundImage: "none",
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
            bgcolor: "#FDECEC",
            color: RED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DeleteOutlined sx={{ fontSize: 28 }} />
        </Box>

        <Typography fontSize={18} fontWeight={700}>
          {deleteTarget.ids.length > 1 ? "Delete messages?" : "Delete message?"}
        </Typography>

        <Typography fontSize={14} color={theme.muted} mt={1}>
          Are you sure you want to delete{" "}
          {deleteTarget.ids.length > 1
            ? `${deleteTarget.ids.length} selected messages`
            : deleteTarget.name || "this contact"}
          ? This action cannot be undone.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setDeleteOpen(false)}
            sx={{
              height: 42,
              color: theme.text,
              borderColor: theme.border,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
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
