import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
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
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProductTable, { getStatus } from "../components/productTable";
import productService from "../service/product.service";

import categoryService from "../service/category.service";

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const RED = "#E5484D";

const PAGE_SIZE = 8;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  salePrice: "",
  stock: "",
  image: "",
  description: "",
  material: "",
  size: "",
  shipping: "",
};

// Text fields in the Add/Edit form (add a field here and it appears)
const TEXT_FIELDS = [
  { name: "name", label: "Product Name", required: true },
  { name: "price", label: "Price", type: "number", required: true },
  { name: "salePrice", label: "Sale Price (optional)", type: "number" },
  { name: "stock", label: "Stock", type: "number", required: true },
  { name: "material", label: "Material" },
  { name: "size", label: "Size" },
  { name: "shipping", label: "Shipping" },
  { name: "description", label: "Description", multiline: true },
];

const errorText = (e) =>
  e.response?.data?.message || e.message || "Something went wrong.";

// Backend sends material/size/shipping inside `details`; flatten for the form
const normalize = (p = {}) => ({
  ...EMPTY_FORM,
  ...p,
  material: p.material ?? p.details?.material ?? "",
  size: p.size ?? p.details?.size ?? "",
  shipping: p.shipping ?? p.details?.shipping ?? "",
  salePrice: p.salePrice ?? "",
  image: p.image ?? "",
  description: p.description ?? "",
  stock: p.stock ?? 0,
});

export default function AdminProducts() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [categories, setCategories] = useState([]); // names from the server

  // Data from server
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Filters. "Text" values are what the user types; the others go to the server.
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [minText, setMinText] = useState("");
  const [maxText, setMaxText] = useState("");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [selected, setSelected] = useState([]);

  // Dialogs
  const [mode, setMode] = useState(""); // "add" | "edit" | "view" | ""
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteIds, setDeleteIds] = useState([]);
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = {
    page: darkMode ? "#1C1917" : "#F7F7F7",
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : "#F7F7F7",
    header: darkMode ? "#332D28" : "#F3ECE5",
    pageActive: darkMode ? "#403832" : "#F3ECE5",
  };

  const notify = (message, severity = "success") =>
    setNotice({ open: true, message, severity });

  const reload = () => setRefresh((n) => n + 1);

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  // Wait 400 ms after typing stops, then search/filter (one request, not one per key)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setMinPrice(minText);
      setMaxPrice(maxText);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, minText, maxText]);

  // Free the temporary image preview URL
  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // ---------- Load data ----------
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        search,
        stockStatus,
        category,
        minPrice,
        maxPrice,
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

      setProducts((data.products || []).map(normalize));
      setTotalProducts(Number(data.total) || 0);
      setTotalPages(lastPage);
      setSelected([]);
    } catch (e) {
      setProducts([]);
      notify(errorText(e), "error");
    } finally {
      setLoading(false);
    }
  }, [search, stockStatus, category, minPrice, maxPrice, sort, page]);

  const loadStats = useCallback(async () => {
    try {
      const data = await productService.getStats();
      setStats({
        total: Number(data.total) || 0,
        inStock: Number(data.inStock) || 0,
        lowStock: Number(data.lowStock) || 0,
        outOfStock: Number(data.outOfStock) || 0,
      });
    } catch (e) {
      notify(errorText(e), "error");
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getOptions(); // [{ id, name }]
      setCategories(data.map((c) => c.name));
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
    loadProducts();
  }, [loadProducts, refresh]);

  useEffect(() => {
    // eslint-disable-next-line
    loadStats();
  }, [loadStats, refresh]);

  const clearFilters = () => {
    setSearchText("");
    setMinText("");
    setMaxText("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setStockStatus("all");
    setCategory("All");
    setPage(1);
  };

  // ---------- Form ----------
  const openDialog = (nextMode, product = EMPTY_FORM) => {
    const data = normalize(product);
    if (nextMode === "add" && !data.category) {
      data.category = categories[0] || "";
    }
    setForm(data);
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

  const price = Number(form.price);
  const sale = form.salePrice === "" ? null : Number(form.salePrice);
  const stock = Number(form.stock);

  const saleTooHigh = sale !== null && sale > price;
  const formInvalid =
    !form.name.trim() ||
    !form.category ||
    !form.name.trim() ||
    form.price === "" ||
    !(price >= 0) ||
    form.stock === "" ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    (sale !== null && (!(sale >= 0) || saleTooHigh));

  const saveProduct = async () => {
    if (formInvalid || saving) return;
    setSaving(true);

    try {
      let image = form.image.trim() || null;
      if (imageFile) image = await productService.uploadImage(imageFile);

      const payload = {
        name: form.name.trim(),
        category: form.category,
        price,
        salePrice: sale,
        stock,
        image,
        description: form.description.trim(),
        material: form.material.trim(),
        size: form.size.trim(),
        shipping: form.shipping.trim(),
      };

      if (mode === "add") {
        await productService.createProduct(payload);
        notify("Product created successfully");
        setSort("latest"); // so the new product shows on page 1
        setPage(1);
      } else {
        await productService.updateProduct(form.id, payload);
        notify("Product updated successfully");
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
  const confirmDelete = async () => {
    if (!deleteIds.length || saving) return;
    setSaving(true);

    try {
      await Promise.all(
        deleteIds.map((id) => productService.deleteProduct(id)),
      );
      notify(deleteIds.length > 1 ? "Products deleted" : "Product deleted");
    } catch (e) {
      notify(errorText(e), "error");
    } finally {
      setDeleteIds([]);
      setSaving(false);
      reload(); // loadProducts moves back a page if this one became empty
    }
  };

  // ---------- Export CSV ----------
  const exportCsv = () => {
    const rows = selected.length
      ? products.filter((p) => selected.includes(p.id))
      : products;

    if (!rows.length) return notify("No products to export", "warning");

    const header = [
      "ID",
      "Name",
      "Category",
      "Price",
      "Sale Price",
      "Stock",
      "Status",
    ];
    const lines = rows.map((p) => [
      p.productCode || p.id,
      p.name,
      p.category,
      p.price,
      p.salePrice,
      p.stock,
      getStatus(p.stock).label,
    ]);

    const csv = [header, ...lines]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["﻿" + csv], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { title: "Total Products", value: stats.total },
    { title: "In Stock", value: stats.inStock },
    { title: "Low Stock", value: stats.lowStock },
    { title: "Out of Stock", value: stats.outOfStock },
  ];

  const viewRows = [
    ["Product ID", form.productCode || form.id],
    ["Product", form.name],
    ["Category", form.category],
    ["Price", `$${Number(form.price || 0).toFixed(2)}`],
    [
      "Sale Price",
      form.salePrice === "" ? "-" : `$${Number(form.salePrice).toFixed(2)}`,
    ],
    ["Stock", form.stock],
    ["Status", getStatus(form.stock).label],
    ["Material", form.material || "-"],
    ["Size", form.size || "-"],
    ["Shipping", form.shipping || "-"],
    ["Description", form.description || "-"],
  ];

  const fieldSx = {
    mb: 2,
    "& .MuiInputBase-root": { color: theme.text },
    "& .MuiInputLabel-root": { color: theme.muted },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
    "& .MuiSvgIcon-root": { color: theme.muted },
  };

  const previewSrc = imagePreview || form.image;

  const paperSx = {
    bgcolor: theme.card,
    color: theme.text,
    backgroundImage: "none",
  };

  const formCategories =
    form.category && !categories.includes(form.category)
      ? [form.category, ...categories]
      : categories;

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
        onToggle={() => setCollapsed((c) => !c)}
        darkMode={darkMode}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar
          title="Products"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((d) => !d)}
        />

        <Box sx={{ p: { xs: 2, md: 3 }, display: "grid", gap: 2.5 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              Product List
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<DownloadOutlined />}
                onClick={exportCsv}
                sx={{
                  textTransform: "none",
                  color: theme.text,
                  borderColor: theme.border,
                }}
              >
                Export
              </Button>

              {selected.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteOutlineOutlined />}
                  onClick={() => setDeleteIds(selected)}
                  sx={{ textTransform: "none", color: RED, borderColor: RED }}
                >
                  Delete ({selected.length})
                </Button>
              )}

              <Button
                variant="contained"
                disableElevation
                startIcon={<AddCircleOutlinedIcon />}
                onClick={() => openDialog("add")}
                sx={{
                  textTransform: "none",
                  bgcolor: BROWN,
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
            }}
          >
            {statCards.map((s) => (
              <Box
                key={s.title}
                sx={{
                  bgcolor: theme.card,
                  borderRadius: "12px",
                  p: 2.5,
                  boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{s.title}</Typography>
                <Typography
                  sx={{ fontSize: 28, fontWeight: 800, color: BROWN }}
                >
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Table */}
          <ProductTable
            products={products}
            loading={loading}
            theme={theme}
            categories={categories}
            selected={selected}
            setSelected={setSelected}
            page={page}
            setPage={setPage}
            pageSize={PAGE_SIZE}
            totalPages={totalPages}
            totalProducts={totalProducts}
            search={searchText}
            setSearch={setSearchText}
            minPrice={minText}
            setMinPrice={setMinText}
            maxPrice={maxText}
            setMaxPrice={setMaxText}
            stockStatus={stockStatus}
            setStockStatus={setStockStatus}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            onClear={clearFilters}
            onView={(p) => openDialog("view", p)}
            onEdit={(p) => openDialog("edit", p)}
            onDelete={(p) => setDeleteIds([p.id])}
          />
        </Box>
      </Box>

      {/* Add / Edit / View dialog */}
      <Dialog
        open={Boolean(mode)}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: paperSx } }}
      >
        <DialogTitle>
          {mode === "add"
            ? "Add New Product"
            : mode === "edit"
              ? "Edit Product"
              : "Product Details"}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: theme.border }}>
          {mode === "view" ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>
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
                    pb: 1,
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
                    label="Image URL"
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

              {/* Category */}
              <TextField
                select
                fullWidth
                required
                label="Category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                helperText={
                  categories.length === 0 ? "Create a category first." : ""
                }
                sx={fieldSx}
              >
                {formCategories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>

              {/* All other fields come from TEXT_FIELDS */}
              {TEXT_FIELDS.map((f) => (
                <TextField
                  key={f.name}
                  fullWidth
                  label={f.label}
                  type={f.type || "text"}
                  required={f.required}
                  multiline={f.multiline}
                  minRows={f.multiline ? 3 : undefined}
                  value={form[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  error={f.name === "salePrice" && saleTooHigh}
                  helperText={
                    f.name === "salePrice" && saleTooHigh
                      ? "Sale price cannot exceed price."
                      : ""
                  }
                  slotProps={
                    f.type === "number" ? { htmlInput: { min: 0 } } : undefined
                  }
                  sx={fieldSx}
                />
              ))}
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

          {mode !== "view" && (
            <Button
              variant="contained"
              onClick={saveProduct}
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
                "Create Product"
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteIds.length > 0}
        onClose={() => !saving && setDeleteIds([])}
        slotProps={{ paper: { sx: paperSx } }}
      >
        <DialogTitle>
          Delete {deleteIds.length > 1 ? "products" : "product"}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.muted }}>
            {deleteIds.length > 1
              ? `Delete ${deleteIds.length} selected products?`
              : "Delete this product?"}{" "}
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteIds([])}
            disabled={saving}
            sx={{ color: theme.muted, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmDelete}
            disabled={saving}
            sx={{
              bgcolor: RED,
              textTransform: "none",
              "&:hover": { bgcolor: "#C93C41" },
            }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
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
