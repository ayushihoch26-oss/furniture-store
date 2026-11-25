import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Typography,
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";
import ProductTable from "../components/ProductTable";
import ProductDialog from "../components/ProductDialog";
import useAdminProducts, {
  PAGE_SIZE,
} from "../hooks/useAdminProducts";

const BROWN = "#947458";
const RED = "#E5484D";

export default function AdminProducts() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const products = useAdminProducts();

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

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

  const statCards = [
    { title: "Total Products", value: products.stats.total },
    { title: "In Stock", value: products.stats.inStock },
    { title: "Low Stock", value: products.stats.lowStock },
    { title: "Out of Stock", value: products.stats.outOfStock },
  ];

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
        onToggle={() => setCollapsed((value) => !value)}
        darkMode={darkMode}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar
          title="Products"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((value) => !value)}
        />

        <Box sx={{ p: { xs: 2, md: 3 }, display: "grid", gap: 2.5 }}>
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
                onClick={products.exportCsv}
                sx={{
                  textTransform: "none",
                  color: theme.text,
                  borderColor: theme.border,
                }}
              >
                Export
              </Button>

              {products.selected.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteOutlineOutlined />}
                  onClick={() => products.setDeleteIds(products.selected)}
                  sx={{
                    textTransform: "none",
                    color: RED,
                    borderColor: RED,
                  }}
                >
                  Delete ({products.selected.length})
                </Button>
              )}

              <Button
                variant="contained"
                disableElevation
                startIcon={<AddCircleOutlinedIcon />}
                onClick={() => products.openDialog("add")}
                sx={{
                  textTransform: "none",
                  bgcolor: BROWN,
                  "&:hover": { bgcolor: "#7d6149" },
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

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
            {statCards.map((stat) => (
              <Box
                key={stat.title}
                sx={{
                  bgcolor: theme.card,
                  borderRadius: "12px",
                  p: 2.5,
                  boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {stat.title}
                </Typography>
                <Typography
                  sx={{ fontSize: 28, fontWeight: 800, color: BROWN }}
                >
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          <ProductTable
            products={products.products}
            loading={products.loading}
            theme={theme}
            categories={products.categories}
            selected={products.selected}
            setSelected={products.setSelected}
            page={products.page}
            setPage={products.setPage}
            pageSize={PAGE_SIZE}
            totalPages={products.totalPages}
            totalProducts={products.totalProducts}
            search={products.searchText}
            setSearch={products.setSearchText}
            minPrice={products.minText}
            setMinPrice={products.setMinText}
            maxPrice={products.maxText}
            setMaxPrice={products.setMaxText}
            stockStatus={products.stockStatus}
            setStockStatus={products.setStockStatus}
            category={products.category}
            setCategory={products.setCategory}
            sort={products.sort}
            setSort={products.setSort}
            onClear={products.clearFilters}
            onView={(product) =>
              products.openDialog("view", product)
            }
            onEdit={(product) =>
              products.openDialog("edit", product)
            }
            onDelete={(product) =>
              products.setDeleteIds([product.id])
            }
          />
        </Box>
      </Box>

      <ProductDialog
        mode={products.mode}
        form={products.form}
        categories={products.categories}
        imagePreview={products.imagePreview}
        saleTooHigh={products.saleTooHigh}
        formInvalid={products.formInvalid}
        saving={products.saving}
        theme={theme}
        onClose={products.closeDialog}
        onFieldChange={products.setField}
        onPickImage={products.pickImage}
        onSave={products.saveProduct}
      />

      <Dialog
        open={products.deleteIds.length > 0}
        onClose={() => {
          if (!products.saving) products.setDeleteIds([]);
        }}
        slotProps={{ paper: { sx: { bgcolor: theme.card, color: theme.text } } }}
      >
        <DialogTitle>
          Delete {products.deleteIds.length > 1 ? "products" : "product"}?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.muted }}>
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => products.setDeleteIds([])}
            disabled={products.saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={products.deleteProducts}
            disabled={products.saving}
            sx={{ bgcolor: RED, "&:hover": { bgcolor: "#C93C41" } }}
          >
            {products.saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={products.notice.open}
        autoHideDuration={4000}
        onClose={() =>
          products.setNotice((oldNotice) => ({
            ...oldNotice,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={products.notice.severity}
          variant="filled"
          onClose={() =>
            products.setNotice((oldNotice) => ({
              ...oldNotice,
              open: false,
            }))
          }
        >
          {products.notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
