import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  TextField,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  DeleteOutlined,
  DownloadOutlined,
  DeleteOutlineOutlined,
  LockOutlined,
} from "@mui/icons-material";

import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import AuthorityTable, { ROLES } from "../components/authorityTable";
import authorityService, {
  getErrorMessage,
} from "../service/authority.service";

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

const MODULES = [
  "Dashboard",
  "Order Management",
  "Customers",
  "Coupon Code",
  "Categories",
  "Transaction",
  "Brand",
  "Products",
  "Product Reviews",
  "Contact Us",
  "Control Authority",
];

// Shown only until the real permissions arrive from the backend
const INITIAL_PERMISSIONS = {
  "Super Admin": [...MODULES],
  Manager: MODULES.filter((item) => item !== "Control Authority"),
  Editor: ["Dashboard", "Categories", "Brand", "Products", "Product Reviews"],
  Support: ["Dashboard", "Order Management", "Customers", "Contact Us"],
};

const clonePermissions = (permissions) =>
  Object.fromEntries(
    Object.entries(permissions).map(([role, modules]) => [role, [...modules]]),
  );

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  id: "",
  name: "",
  email: "",
  role: "Support",
  status: "Active",
  lastActive: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Theme ----------
const getTheme = (darkMode) => ({
  page: darkMode ? "#1C1917" : BG,
  card: darkMode ? "#292421" : "#FFFFFF",
  text: darkMode ? "#F5F0EB" : "#222222",
  heading: darkMode ? "#F5F0EB" : "#0F172A",
  muted: darkMode ? "#B8AAA0" : "#777777",
  border: darkMode ? "#403832" : "#E8EDF3",
  soft: darkMode ? "#332D28" : BG,
  header: darkMode ? "#332D28" : BROWN_LIGHT,
});

// ---------- Reusable Card ----------
function Card({ children, sx, darkMode = false }) {
  const theme = getTheme(darkMode);

  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,.25)"
          : "0 1px 4px rgba(0,0,0,.06)",
        transition: "background-color .25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// ---------- Statistics Card ----------
function AuthorityStatCard({ title, value, change, up, darkMode = false }) {
  const theme = getTheme(darkMode);
  const changeColor = up === false ? RED : GREEN;

  return (
    <Card
      darkMode={darkMode}
      sx={{
        borderRadius: "12px",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,.3)"
            : "0 10px 25px rgba(15,23,42,.15)",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: theme.heading,
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
            color: changeColor,
          }}
        >
          {up === true && <ArrowUpward sx={{ fontSize: 14 }} />}
          {up === false && <ArrowDownward sx={{ fontSize: 14 }} />}
          {change}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 12, color: theme.muted, mt: 1 }}>
        Last 7 days
      </Typography>
    </Card>
  );
}

// ---------- Main Page ----------
export default function AdminAuthority() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Theme toggle state, following AdminContact.jsx
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);
  const theme = getTheme(darkMode);

  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  // Server-side list state
  const [query, setQuery] = useState({
    search: "",
    status: "",
    role: "",
    sortOrder: "desc",
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [memberStats, setMemberStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const [permissions, setPermissions] = useState(
    clonePermissions(INITIAL_PERMISSIONS),
  );
  // Last permissions saved in the database (used by "Reset")
  const [savedPermissions, setSavedPermissions] = useState(
    clonePermissions(INITIAL_PERMISSIONS),
  );
  const [permissionsChanged, setPermissionsChanged] = useState(false);

  const [moreAnchor, setMoreAnchor] = useState(null);
  const [action, setAction] = useState("");
  const [form, setForm] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    ids: [],
    name: "",
  });

  const [toast, setToast] = useState({ message: "", severity: "success" });

  const showToast = useCallback((message, severity = "success") => {
    setToast({ message, severity });
  }, []);

  // ---------- Load data from the backend ----------
  const loadMembers = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);

    try {
      const result = await authorityService.getMembers({
        ...query,
        page,
        limit: PAGE_SIZE,
      });

      // ignore answers of older requests
      if (id !== requestId.current) return;

      setMembers(result.members);
      setTotalMembers(result.total);
      setTotalPages(result.totalPages);
      setMemberStats(result.stats);

      // e.g. the last row of the last page was deleted
      if (result.totalPages > 0 && page > result.totalPages) {
        setPage(result.totalPages);
      }
    } catch (err) {
      if (id !== requestId.current) return;
      showToast(getErrorMessage(err, "Could not load members"), "error");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [query, page, showToast]);

  // Called by the table when search / tab / role filter / sort change
  const handleQueryChange = useCallback((next) => {
    setQuery((previous) =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
    );
    setPage(1);
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const data = await authorityService.getPermissions();
      setPermissions(clonePermissions(data));
      setSavedPermissions(clonePermissions(data));
      setPermissionsChanged(false);
    } catch (err) {
      showToast(getErrorMessage(err, "Could not load permissions"), "error");
    }
  }, [showToast]);

  // Reload the list whenever the page or the filters change
  useEffect(() => {
    const updateMembers = async () => {
      await loadMembers();
    };

    updateMembers();
  }, [loadMembers]);

  useEffect(() => {
    const loadPermissionsCallback = async () => {
      await loadPermissions();
    };

    loadPermissionsCallback();
  }, [loadPermissions]);

  // ---------- Statistics ----------
  const stats = [
    {
      title: "Total Members",
      value: String(memberStats.total),
      change: "14.4%",
      up: true,
    },
    {
      title: "Active Members",
      value: String(memberStats.active),
      change: "20%",
      up: true,
    },
    {
      title: "Inactive Members",
      value: String(memberStats.inactive),
      change: "5%",
      up: false,
    },
    {
      title: "Total Roles",
      value: String(ROLES.length),
      change: "0%",
    },
  ];

  // ---------- Add / View / Edit ----------
  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      id: "Auto generated",
      lastActive: new Date().toLocaleDateString("en-GB").replaceAll("/", "-"),
    });

    setAction("add");
  };

  const openView = (item) => {
    setForm({ ...item });
    setAction("view");
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setAction("edit");
  };

  const closeAction = () => setAction("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const emailTaken = members.some(
    (item) =>
      item.email.toLowerCase() === (form?.email || "").trim().toLowerCase() &&
      item.id !== form?.id,
  );

  const formInvalid =
    !form?.name?.trim() || !EMAIL_PATTERN.test(form?.email || "") || emailTaken;

  const saveMember = async () => {
    if (formInvalid || saving) return;

    const member = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    };

    setSaving(true);

    try {
      if (action === "add") {
        await authorityService.createMember(member);
        setPage(1);
        showToast("Member added");
      } else {
        await authorityService.updateMember(member.id, member);
        showToast("Member updated");
      }

      await loadMembers();
      await loadPermissions(); // a role change can change the member's access
      closeAction();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save member"), "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete ----------
  const openDelete = (ids, name = "") => {
    if (!ids.length) return;

    const includesSuperAdmin = members.some(
      (item) => ids.includes(item.id) && item.role === "Super Admin",
    );

    if (includesSuperAdmin) {
      showToast("Super Admin cannot be deleted", "warning");
      return;
    }

    setDeleteTarget({ ids, name });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const { ids } = deleteTarget;

    try {
      await authorityService.removeMembers(ids);

      setSelected((previous) => previous.filter((id) => !ids.includes(id)));
      setPage(1);
      setDeleteOpen(false);
      showToast(ids.length > 1 ? "Members deleted" : "Member deleted");

      await loadMembers();
    } catch (err) {
      setDeleteOpen(false);
      showToast(getErrorMessage(err, "Could not delete"), "error");
    }
  };

  // ---------- Permissions ----------
  const togglePermission = (role, module) => {
    if (role === "Super Admin") return;

    setPermissions((previous) => ({
      ...previous,
      [role]: previous[role].includes(module)
        ? previous[role].filter((item) => item !== module)
        : [...previous[role], module],
    }));

    setPermissionsChanged(true);
  };

  const savePermissions = async () => {
    try {
      const data = await authorityService.savePermissions(permissions);

      setPermissions(clonePermissions(data));
      setSavedPermissions(clonePermissions(data));
      setPermissionsChanged(false);
      showToast("Permissions saved");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save permissions"), "error");
    }
  };

  const resetPermissions = () => {
    setPermissions(clonePermissions(savedPermissions));
    setPermissionsChanged(false);
  };

  // ---------- Export CSV ----------
  const exportMembers = async () => {
    let data = []; //eslint-disable-line

    try {
      // Selected members can be on other pages, so load from the server
      const all = await authorityService.getAllMembers(
        selected.length ? {} : query,
      );
      data = selected.length
        ? all.filter((item) => selected.includes(item.id))
        : all;
    } catch (err) {
      showToast(getErrorMessage(err, "Could not export members"), "error");
      return;
    }

    if (!data.length) {
      showToast("No members to export", "warning");
      return;
    }

    const headers = [
      "Member ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Last Active",
    ];

    const rows = data.map((item) => [
      item.id,
      item.name,
      item.email,
      item.role,
      item.status,
      item.lastActive,
    ]);

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
    link.download = selected.length
      ? "selected-members.csv"
      : "all-members.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ---------- Shared Styles ----------
  const dialogPaperSx = {
    bgcolor: theme.card,
    color: theme.text,
    backgroundImage: "none",
    border: `1px solid ${theme.border}`,
  };

  const fieldSx = {
    "& .MuiInputBase-root": {
      color: theme.text,
    },
    "& .MuiInputLabel-root": {
      color: theme.muted,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: BROWN,
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: BROWN,
    },
    "& .MuiSvgIcon-root": {
      color: theme.muted,
    },
  };

  const menuProps = {
    PaperProps: {
      sx: dialogPaperSx,
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.page,
        color: theme.text,
        transition: "background-color .25s ease, color .25s ease",
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
        {/* Same theme-toggle props as AdminContact */}
        <Navbar
          title="Control Authority"
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
          {/* ---------- Page Title and Actions ---------- */}
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
              sx={{
                fontSize: 22,
                fontWeight: 700,
                color: theme.heading,
              }}
            >
              Control Authority
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddCircleOutlinedIcon />}
                onClick={openAdd}
                sx={{
                  height: 40,
                  px: 2.5,
                  bgcolor: BROWN,
                  textTransform: "none",
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Add Member
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
                onClose={() => setMoreAnchor(null)}
                PaperProps={{
                  sx: {
                    ...dialogPaperSx,
                    minWidth: 190,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    exportMembers();
                  }}
                >
                  <DownloadOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Export Members
                </MenuItem>

                <MenuItem
                  disabled={
                    selected.length === 0 ||
                    selected.some((id) =>
                      members.some(
                        (item) => item.id === id && item.role === "Super Admin",
                      ),
                    )
                  }
                  onClick={() => {
                    setMoreAnchor(null);
                    openDelete(selected);
                  }}
                >
                  <DeleteOutlineOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Delete Selected
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* ---------- Statistics ---------- */}
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
              <AuthorityStatCard
                key={stat.title}
                {...stat}
                darkMode={darkMode}
              />
            ))}
          </Box>

          {/* ---------- Members Table ---------- */}
          <AuthorityTable
            members={members}
            selected={selected}
            setSelected={setSelected}
            page={page}
            setPage={setPage}
            pageSize={PAGE_SIZE}
            total={totalMembers}
            totalPages={totalPages}
            memberTotal={memberStats.total}
            loading={loading}
            onQueryChange={handleQueryChange}
            onView={openView}
            onEdit={openEdit}
            onDelete={(item) => openDelete([item.id], item.name)}
            darkMode={darkMode}
          />

          {/* ---------- Role Permissions ---------- */}
          <Card darkMode={darkMode}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: theme.heading,
                  }}
                >
                  Role Permissions
                </Typography>

                <Typography sx={{ fontSize: 13, color: theme.muted }}>
                  Choose which pages each role can open.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  disabled={!permissionsChanged}
                  onClick={resetPermissions}
                  sx={{
                    height: 36,
                    color: theme.text,
                    borderColor: theme.border,
                    textTransform: "none",
                  }}
                >
                  Reset
                </Button>

                <Button
                  variant="contained"
                  disableElevation
                  disabled={!permissionsChanged}
                  onClick={savePermissions}
                  sx={{
                    height: 36,
                    bgcolor: BROWN,
                    textTransform: "none",
                    "&:hover": { bgcolor: BROWN_DARK },
                  }}
                >
                  Save Permissions
                </Button>
              </Box>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ minWidth: 620 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `minmax(180px, 2fr) repeat(${ROLES.length}, 1fr)`,
                    gap: 1,
                    alignItems: "center",
                    p: 1.5,
                    bgcolor: theme.header,
                    borderRadius: 2,
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme.heading,
                  }}
                >
                  <span>Page</span>

                  {ROLES.map((role) => (
                    <Box key={role} sx={{ textAlign: "center" }}>
                      {role}
                    </Box>
                  ))}
                </Box>

                {MODULES.map((module) => (
                  <Box
                    key={module}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `minmax(180px, 2fr) repeat(${ROLES.length}, 1fr)`,
                      gap: 1,
                      alignItems: "center",
                      px: 1.5,
                      py: 0.5,
                      fontSize: 13,
                      color: theme.text,
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <span>{module}</span>

                    {ROLES.map((role) => (
                      <Box key={role} sx={{ textAlign: "center" }}>
                        <Checkbox
                          size="small"
                          checked={(permissions[role] || []).includes(module)}
                          disabled={role === "Super Admin"}
                          onChange={() => togglePermission(role, module)}
                          sx={{
                            color: theme.muted,
                            "&.Mui-checked": { color: BROWN },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>

            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                fontSize: 12,
                color: theme.muted,
                mt: 2,
              }}
            >
              <LockOutlined sx={{ fontSize: 16 }} />
              Super Admin always has access to every page and cannot be changed.
            </Typography>
          </Card>
        </Box>
      </Box>

      {/* ---------- Add / View / Edit Dialog ---------- */}
      <Dialog
        open={Boolean(action)}
        onClose={closeAction}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ color: theme.heading }}>
          {action === "add" && "Add New Member"}
          {action === "view" && "Member Details"}
          {action === "edit" && "Edit Member"}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: theme.border }}>
          {form && action === "view" && (
            <Box sx={{ display: "grid", gap: 2 }}>
              {[
                ["Member ID", form.id],
                ["Name", form.name],
                ["Email", form.email],
                ["Role", form.role],
                ["Status", form.status],
                ["Last Active", form.lastActive],
                ["Access", permissions[form.role]?.join(", ") || "-"],
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
                  <Typography sx={{ color: theme.muted }}>{label}</Typography>

                  <Typography
                    fontWeight={600}
                    textAlign="right"
                    fontSize={14}
                    sx={{ color: theme.text }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {form && (action === "add" || action === "edit") && (
            <>
              <TextField
                fullWidth
                label="Member ID"
                margin="normal"
                value={form.id}
                disabled
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Full Name"
                margin="normal"
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                error={
                  Boolean(form.email) &&
                  (!EMAIL_PATTERN.test(form.email) || emailTaken)
                }
                helperText={
                  emailTaken
                    ? "This email is already used"
                    : form.email && !EMAIL_PATTERN.test(form.email)
                      ? "Enter a valid email"
                      : ""
                }
                sx={fieldSx}
              />

              <TextField
                fullWidth
                select
                label="Role"
                margin="normal"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                sx={fieldSx}
                SelectProps={{ MenuProps: menuProps }}
              >
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Status"
                margin="normal"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                sx={fieldSx}
                SelectProps={{ MenuProps: menuProps }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeAction} sx={{ color: theme.muted }}>
            {action === "view" ? "Close" : "Cancel"}
          </Button>

          {(action === "add" || action === "edit") && (
            <Button
              variant="contained"
              onClick={saveMember}
              disabled={formInvalid || saving}
              sx={{
                bgcolor: BROWN,
                "&:hover": { bgcolor: BROWN_DARK },
              }}
            >
              {action === "add" ? "Add Member" : "Save Changes"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ---------- Delete Confirmation ---------- */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            ...dialogPaperSx,
            borderRadius: 3,
            p: 3,
            textAlign: "center",
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
            bgcolor: darkMode ? "#482B29" : "#FDECEC",
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
            color: theme.heading,
          }}
        >
          {deleteTarget.ids.length > 1 ? "Delete members?" : "Delete member?"}
        </Typography>

        <Typography sx={{ fontSize: 14, color: theme.muted, mt: 1 }}>
          {deleteTarget.ids.length > 1 ? (
            <>
              Are you sure you want to delete{" "}
              <b>{deleteTarget.ids.length} selected members</b>? This action
              cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to delete <b>{deleteTarget.name}</b> (
              {deleteTarget.ids[0]})? This action cannot be undone.
            </>
          )}
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

      {/* ---------- Notification ---------- */}
      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={3000}
        onClose={() => setToast((previous) => ({ ...previous, message: "" }))}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((previous) => ({ ...previous, message: "" }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
