import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CategoryTable, {
  getStatus,
  categoryCode,
} from "../components/categoryTable";
import categoryService from "../service/category.service";
import productService from "../service/product.service"; // reused for image upload

// ---------- Colors (same as Contact page) ----------
const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BG = "#F7F7F7";
const RED = "#E5484D";

const PAGE_SIZE = 8;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

const errorText = (e) =>
  e.response?.data?.message || e.message || "Something went wrong.";

const normalize = (c = {}) => ({
  ...EMPTY_FORM,
  ...c,
  description: c.description ?? "",
  image: c.image ?? "",
  isActive: c.isActive ?? true,
});

// ---------- Reusable Card ----------
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

// ---------- Statistics Card ----------
function CategoryStatCard({ title, value, caption, darkMode = false }) {
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
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color: darkMode ? "#B8AAA0" : "#777",
          mt: 1,
        }}
      >
        {caption}
      </Typography>
    </Card>
  );
}

// ---------- Admin Categories Page ----------
export default function AdminCategories() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);

  // Data from server
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Filters
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("latest");
  const [selected, setSelected] = useState([]);

  // Dialogs
  const [mode, setMode] = useState(""); // "add" | "edit" | "view" | ""
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ ids: [], name: "" });
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ---------- Theme ----------
  const theme = {
    page: darkMode ? "#1C1917" : BG,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : "#F3ECE5",
    pageActive: darkMode ? "#403832" : "#F3ECE5",
  };

  const notify = (message, severity = "success") =>
    setNotice({ open: true, message, severity });

  const reload = () => setRefresh((n) => n + 1);

  // ---------- Save Dark Mode ----------
  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  // Wait 400 ms after typing stops, then search (one request, not one per key)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Free the temporary image preview URL
  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // ---------- Load data ----------
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories({
        search,
        status,
        sort,
        page,
        limit: PAGE_SIZE,
      });

      const lastPage = Math.max(Number(data.totalPages) || 1, 1);

      // Page no longer exists (e.g. after deleting) -> go to the last one
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setCategories((data.categories || []).map(normalize));
      setTotalCategories(Number(data.total) || 0);
      setTotalPages(lastPage);
      setSelected([]);
    } catch (e) {
      setCategories([]);
      notify(errorText(e), "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

  const loadStats = useCallback(async () => {
    try {
      const data = await categoryService.getStats();
      setStats({
        total: Number(data.total) || 0,
        active: Number(data.active) || 0,
        inactive: Number(data.inactive) || 0,
      });
    } catch (e) {
      notify(errorText(e), "error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    loadCategories();
  }, [loadCategories, refresh]);

  useEffect(() => {
    // eslint-disable-next-line
    loadStats();
  }, [loadStats, refresh]);

  const clearFilters = () => {
    setSearchText("");
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  // ---------- Statistics Cards ----------
  const statCards = [
    {
      title: "Total Categories",
      value: String(stats.total),
      caption: "All categories",
    },
    {
      title: "Active Categories",
      value: String(stats.active),
      caption: "Visible in the shop",
    },
    {
      title: "Inactive Categories",
      value: String(stats.inactive),
      caption: "Hidden from the shop",
    },
  ];

  // ---------- Form ----------
  const openDialog = (nextMode, category = EMPTY_FORM) => {
    setForm(normalize(category));
    setImageFile(null);
    setImagePreview("");
    setMode(nextMode);
  };

  const closeDialog = () => {
    if (!saving) setMode("");
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type))
      return notify("Please select a PNG, JPG or WEBP image.", "error");
    if (file.size > MAX_IMAGE_SIZE)
      return notify("Image must be 2 MB or less.", "error");

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const nameTooLong = form.name.trim().length > 60;
  const formInvalid = !form.name.trim() || nameTooLong;

  const saveCategory = async () => {
    if (formInvalid || saving) return;
    setSaving(true);

    try {
      let image = form.image.trim() || null;
      if (imageFile) image = await productService.uploadImage(imageFile);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image,
        isActive: form.isActive,
      };

      if (mode === "add") {
        await categoryService.createCategory(payload);
        notify("Category created successfully");
        setSort("latest"); // so the new category shows on page 1
        setPage(1);
      } else {
        await categoryService.updateCategory(form.id, payload);
        notify(
          form.productCount > 0 && payload.name !== form.originalName
            ? "Category updated. Products were moved to the new name."
            : "Category updated successfully",
        );
      }

      setMode("");
      reload();
    } catch (e) {
      notify(errorText(e), "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Delete ----------
  const openDelete = (ids, name = "") => {
    setDeleteTarget({ ids: Array.isArray(ids) ? ids : [ids], name });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const { ids } = deleteTarget;

    if (!ids.length || saving) {
      setDeleteOpen(false);
      return;
    }

    setSaving(true);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => categoryService.deleteCategory(id)),
      );

      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length === 0) {
        notify(ids.length > 1 ? "Categories deleted" : "Category deleted");
      } else {
        notify(errorText(failed[0].reason), "error");
      }
    } finally {
      setDeleteOpen(false);
      setSaving(false);
      reload(); // loadCategories moves back a page if this one became empty
    }
  };

  // ---------- Export CSV ----------
  const exportCsv = () => {
    const rows = selected.length
      ? categories.filter((c) => selected.includes(c.id))
      : categories;

    if (!rows.length) return notify("No categories to export", "warning");

    const header = ["ID", "Name", "Description", "Products", "Status"];
    const lines = rows.map((c) => [
      categoryCode(c),
      c.name,
      c.description,
      c.productCount,
      getStatus(c.isActive).label,
    ]);

    const csv = [header, ...lines]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download =
      selected.length > 0 ? "selected-categories.csv" : "all-categories.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const viewRows = [
    ["Category ID", form.id ? categoryCode(form) : "-"],
    ["Name", form.name],
    ["Products", form.productCount ?? 0],
    ["Status", getStatus(form.isActive).label],
    ["Description", form.description || "-"],
  ];

  const fieldSx = {
    mb: 2,
    "& .MuiInputBase-root": { color: theme.text },
    "& .MuiInputLabel-root": { color: theme.muted },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
  };

  const previewSrc = imagePreview || form.image;

  const dialogPaperSx = {
    bgcolor: darkMode ? "#292421" : "#FFFFFF",
    color: theme.text,
    backgroundImage: "none",
    border: `1px solid ${theme.border}`,
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
        onToggle={() => setCollapsed((c) => !c)}
        darkMode={darkMode}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar
          title="Categories"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((d) => !d)}
        />

        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 2 },
            display: "grid",
            gap: 2.5,
          }}
        >
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
            <Typography
              sx={{ fontSize: 22, fontWeight: 700, color: theme.text }}
            >
              Category List
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddCircleOutlinedIcon />}
                onClick={() => openDialog("add")}
                sx={{
                  height: 40,
                  px: 2.5,
                  textTransform: "none",
                  bgcolor: BROWN,
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Add Category
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
                  "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
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
                    border: `1px solid ${theme.border}`,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    exportCsv();
                  }}
                >
                  <DownloadOutlined sx={{ mr: 1.5, fontSize: 20 }} />
                  Export Categories
                </MenuItem>

                <MenuItem
                  disabled={selected.length === 0}
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

          {/* ===== STATISTICS ===== */}
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
              <CategoryStatCard
                key={stat.title}
                {...stat}
                darkMode={darkMode}
              />
            ))}
          </Box>

          {/* ===== CATEGORY TABLE ===== */}
          <CategoryTable
            categories={categories}
            loading={loading}
            theme={theme}
            selected={selected}
            setSelected={setSelected}
            page={page}
            setPage={setPage}
            pageSize={PAGE_SIZE}
            totalPages={totalPages}
            totalCategories={totalCategories}
            search={searchText}
            setSearch={setSearchText}
            status={status}
            setStatus={setStatus}
            sort={sort}
            setSort={setSort}
            onClear={clearFilters}
            onView={(c) => openDialog("view", c)}
            onEdit={(c) => openDialog("edit", { ...c, originalName: c.name })}
            onDelete={(c) => openDelete([c.id], c.name)}
          />
        </Box>
      </Box>

      {/* ===== DIALOG: ADD / EDIT / VIEW ===== */}
      <Dialog
        open={Boolean(mode)}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle>
          {mode === "add"
            ? "Add New Category"
            : mode === "edit"
              ? "Edit Category"
              : "Category Details"}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: theme.border }}>
          {mode === "view" ? (
            <Box sx={{ display: "grid", gap: 2 }}>
              {previewSrc && (
                <Box
                  component="img"
                  src={previewSrc}
                  alt=""
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                    mx: "auto",
                  }}
                />
              )}

              {viewRows.map(([label, value]) => (
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
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              {/* Image */}
              <Box
                sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
              >
                {previewSrc && (
                  <Box
                    component="img"
                    src={previewSrc}
                    alt=""
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 2,
                    }}
                  />
                )}

                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Image URL (optional)"
                    value={form.image}
                    onChange={(e) => {
                      setField("image", e.target.value);
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    sx={{ ...fieldSx, mb: 1 }}
                  />
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      color: BROWN,
                      borderColor: BROWN,
                    }}
                  >
                    Upload Image
                    <input
                      hidden
                      type="file"
                      accept={IMAGE_TYPES.join(",")}
                      onChange={pickImage}
                    />
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                required
                label="Category Name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                error={nameTooLong}
                helperText={
                  nameTooLong
                    ? "Name must be 60 characters or less."
                    : mode === "edit" && form.productCount > 0
                      ? `Renaming also updates ${form.productCount} product(s).`
                      : ""
                }
                sx={fieldSx}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                sx={fieldSx}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: BROWN },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        { bgcolor: BROWN },
                    }}
                  />
                }
                label={form.isActive ? "Active" : "Inactive"}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{ color: theme.muted, textTransform: "none" }}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>

          {mode === "view" && (
            <Button
              variant="outlined"
              startIcon={<EditOutlined />}
              onClick={() => {
                setForm((f) => ({ ...f, originalName: f.name }));
                setMode("edit");
              }}
              sx={{
                color: BROWN,
                borderColor: BROWN,
                textTransform: "none",
              }}
            >
              Edit Category
            </Button>
          )}

          {mode !== "view" && (
            <Button
              variant="contained"
              onClick={saveCategory}
              disabled={formInvalid || saving}
              sx={{
                bgcolor: BROWN,
                textTransform: "none",
                "&:hover": { bgcolor: BROWN_DARK },
              }}
            >
              {saving ? (
                <CircularProgress size={22} color="inherit" />
              ) : mode === "add" ? (
                "Create Category"
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ===== DELETE CONFIRMATION POPUP ===== */}
      <Dialog
        open={deleteOpen}
        onClose={() => !saving && setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              ...dialogPaperSx,
              borderRadius: 3,
              p: 3,
              textAlign: "center",
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
            bgcolor: "#FDECEC",
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
            color: darkMode ? "#F5F0EB" : "#0F172A",
          }}
        >
          {deleteTarget.ids.length > 1
            ? "Delete categories?"
            : "Delete category?"}
        </Typography>

        <Typography sx={{ fontSize: 14, color: theme.muted, mt: 1 }}>
          {deleteTarget.ids.length > 1 ? (
            <>
              Are you sure you want to delete{" "}
              <b>{deleteTarget.ids.length} selected categories</b>? This action
              cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <b>{deleteTarget.name || "this category"}</b>? This action cannot
              be undone.
            </>
          )}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button
            fullWidth
            autoFocus
            variant="outlined"
            disabled={saving}
            onClick={() => setDeleteOpen(false)}
            sx={{
              height: 42,
              color: theme.text,
              borderColor: theme.border,
              textTransform: "none",
              "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
            }}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            variant="contained"
            disableElevation
            disabled={saving}
            onClick={confirmDelete}
            sx={{
              height: 42,
              bgcolor: RED,
              textTransform: "none",
              "&:hover": { bgcolor: "#C93C41" },
            }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "Delete"}
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={notice.open}
        autoHideDuration={4000}
        onClose={() => setNotice((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={notice.severity}
          variant="filled"
          onClose={() => setNotice((n) => ({ ...n, open: false }))}
        >
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
