import { useEffect, useState } from "react";
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

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";
import CategoryTable from "../components/CategoryTable";
import CategoryStatCard from "../features/CategoryStatCard";
import useAdminCategories from "../hooks/useAdminCategories";
import {
  CATEGORY_COLORS,
  CATEGORY_IMAGE_TYPES,
  CATEGORY_PAGE_SIZE,
} from "../constants/categoryConstants";

// ---------- Admin Categories Page ----------
export default function AdminCategories() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const { BROWN, BROWN_DARK, RED } = CATEGORY_COLORS;
  const {
    categories,
    stats,
    totalPages,
    totalCategories,
    loading,
    saving,
    page,
    setPage,
    searchText,
    setSearchText,
    status,
    setStatus,
    sort,
    setSort,
    selected,
    setSelected,
    mode,
    setMode,
    form,
    setForm,
    deleteOpen,
    setDeleteOpen,
    deleteTarget,
    notice,
    setNotice,
    theme,
    clearFilters,
    openDialog,
    closeDialog,
    setField,
    setImageUrl,
    pickImage,
    nameTooLong,
    formInvalid,
    saveCategory,
    openDelete,
    confirmDelete,
    exportCsv,
    viewRows,
    fieldSx,
    previewSrc,
    dialogPaperSx,
  } = useAdminCategories(darkMode);

  // ---------- Save Dark Mode ----------
  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

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
            pageSize={CATEGORY_PAGE_SIZE}
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
                    onChange={(event) => setImageUrl(event.target.value)}
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
                      accept={CATEGORY_IMAGE_TYPES.join(",")}
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
