import { lazy, Suspense, useState, useMemo } from "react";

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

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";

import useContactMessages from "../hooks/useContactMessages";
import useContactFilters from "../hooks/useContactFilters";
import useAdminDarkMode from "../hooks/useAdminDarkMode";

const ContactTable = lazy(() => import("../components/ContactTable"));

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

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
        sx={{ display: "flex", alignItems: "center", fontSize: 12, color }}
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
  const [moreAnchor, setMoreAnchor] = useState(null);

  const { darkMode, toggleDarkMode } = useAdminDarkMode();

  const filters = useContactFilters();

  const {
    messages,
    stats,
    counts,
    loading,
    totalItems,
    totalPages,
    selected,
    setSelected,
    viewed,
    handleView,
    closeView,
    markReplied,
    markSelectedRead,
    exportMessages,
    deleteOpen,
    deleteTarget,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useContactMessages({
    query: filters.query,
    setPage: filters.setPage,
  });

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
          onThemeToggle={toggleDarkMode}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
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
                  sx: { bgcolor: theme.card, color: theme.text },
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
                    openDelete(selected);
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
              filters={filters}
              page={filters.page}
              setPage={filters.setPage}
              totalItems={totalItems}
              totalMessages={counts.total}
              totalPages={totalPages}
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
        onClose={closeView}
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
          <Button onClick={closeView} sx={{ color: theme.muted }}>
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
        onClose={closeDelete}
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
            onClick={closeDelete}
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