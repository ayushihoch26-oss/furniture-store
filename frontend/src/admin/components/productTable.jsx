import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Checkbox,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Search,
  Inventory2Outlined,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@mui/icons-material";

const BROWN = "#947458";
const GREEN = "#2E9E5B";
const RED = "#E5484D";
const YELLOW = "#F5B301";

// Must match LOW_STOCK_LIMIT in the backend (product.repository.js)
export const LOW_STOCK_LIMIT = 8;

// eslint-disable-next-line
export const getStatus = (stock) => {
  const qty = Number(stock);
  if (qty <= 0) return { label: "Out of Stock", color: RED };
  if (qty <= LOW_STOCK_LIMIT) return { label: "Low Stock", color: YELLOW };
  return { label: "In Stock", color: GREEN };
};

// Page buttons, e.g. 1 2 3 4 5 .... 24  (built from the real page count)
const getPageList = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 4) return [1, 2, 3, 4, 5, "start-gap", totalPages];

  if (page >= totalPages - 3) {
    return [
      1,
      "end-gap",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "start-gap", page - 1, page, page + 1, "end-gap", totalPages];
};

const TABS = [
  { label: "All", value: "all" },
  { label: "In Stock", value: "in_stock" },
  { label: "Low Stock", value: "low_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
];

const SORTS = [
  { label: "Newest first", value: "latest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
  { label: "Stock: Low to High", value: "stock_asc" },
  { label: "Stock: High to Low", value: "stock_desc" },
];

function ProductImage({ src, theme }) {
  const box = {
    width: 40,
    height: 40,
    borderRadius: 1.5,
    flexShrink: 0,
    border: `1px solid ${theme.border}`,
  };

  if (!src) {
    return (
      <Box
        sx={{
          ...box,
          bgcolor: theme.soft,
          color: BROWN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Inventory2Outlined fontSize="small" />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt=""
      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
      sx={{ ...box, objectFit: "cover" }}
    />
  );
}

export default function ProductTable({
  products,
  loading,
  theme,
  categories,
  selected,
  setSelected,
  page,
  setPage,
  pageSize,
  totalPages,
  totalProducts,
  search,
  setSearch,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  stockStatus,
  setStockStatus,
  category,
  setCategory,
  sort,
  setSort,
  onClear,
  onView,
  onEdit,
  onDelete,
}) {
  const allSelected =
    products.length > 0 && products.every((p) => selected.includes(p.id));

  const hasFilters =
    search ||
    minPrice !== "" ||
    maxPrice !== "" ||
    category !== "All" ||
    stockStatus !== "all";

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleAll = () =>
    setSelected(allSelected ? [] : products.map((p) => p.id));

  // Change a filter and always go back to page 1
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const from = totalProducts === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalProducts);

  const cellSx = { color: theme.text, borderColor: theme.border, fontSize: 13 };
  const headSx = { ...cellSx, fontWeight: 700, bgcolor: theme.header };
  const navButtonSx = {
    height: 36,
    color: theme.text,
    borderColor: theme.border,
    textTransform: "none",
    "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
    "&.Mui-disabled": { color: theme.muted, borderColor: theme.border },
  };
  const inputSx = {
    "& .MuiInputBase-root": { color: theme.text, height: 40 },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
    "& .MuiSvgIcon-root": { color: theme.muted },
    "& .MuiInputLabel-root": { color: theme.muted },
  };

  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        minWidth: 0,
      }}
    >
      {/* Stock tabs */}
      <Box sx={{ display: "flex", gap: 0.5, mb: 2, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => changeFilter(setStockStatus)(tab.value)}
            sx={{
              textTransform: "none",
              whiteSpace: "nowrap",
              bgcolor: stockStatus === tab.value ? BROWN : "transparent",
              color: stockStatus === tab.value ? "#fff" : theme.muted,
              "&:hover": {
                bgcolor: stockStatus === tab.value ? BROWN : theme.soft,
              },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Search + filters */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            height: 40,
            borderRadius: 1,
            bgcolor: theme.soft,
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search sx={{ color: theme.muted, fontSize: 20 }} />
          <InputBase
            placeholder="Search by name, ID or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: 13, color: theme.text }}
          />
        </Box>

        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => changeFilter(setCategory)(e.target.value)}
          sx={{ ...inputSx, minWidth: 150 }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {categories.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ ...inputSx, width: 110 }}
        />

        <TextField
          size="small"
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ ...inputSx, width: 110 }}
        />

        <TextField
          select
          size="small"
          value={sort}
          onChange={(e) => changeFilter(setSort)(e.target.value)}
          sx={{ ...inputSx, minWidth: 170 }}
        >
          {SORTS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </TextField>

        {hasFilters && (
          <Button
            onClick={onClear}
            sx={{ textTransform: "none", color: BROWN, height: 40 }}
          >
            Clear filters
          </Button>
        )}
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={headSx}>
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={selected.length > 0 && !allSelected}
                  onChange={toggleAll}
                  sx={{
                    color: theme.muted,
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: BROWN,
                    },
                  }}
                />
              </TableCell>
              <TableCell sx={headSx}>ID</TableCell>
              <TableCell sx={headSx}>Product</TableCell>
              <TableCell sx={headSx}>Category</TableCell>
              <TableCell sx={headSx}>Price</TableCell>
              <TableCell sx={headSx}>Stock</TableCell>
              <TableCell sx={headSx}>Status</TableCell>
              <TableCell sx={headSx}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={cellSx}>
                  <CircularProgress size={28} sx={{ color: BROWN, my: 3 }} />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{ ...cellSx, py: 4, color: theme.muted }}
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const status = getStatus(p.stock);
                const onSale =
                  p.salePrice !== "" &&
                  p.salePrice != null &&
                  Number(p.salePrice) < Number(p.price);

                return (
                  <TableRow key={p.id} hover>
                    <TableCell padding="checkbox" sx={cellSx}>
                      <Checkbox
                        size="small"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleOne(p.id)}
                        sx={{
                          color: theme.muted,
                          "&.Mui-checked": { color: BROWN },
                        }}
                      />
                    </TableCell>

                    <TableCell sx={cellSx}>
                      {p.productCode || `PRD${String(p.id).padStart(4, "0")}`}
                    </TableCell>

                    <TableCell sx={cellSx}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <ProductImage src={p.image} theme={theme} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{ fontSize: 13, maxWidth: 220 }}
                          >
                            {p.name || "Unnamed product"}
                          </Typography>
                          <Typography
                            noWrap
                            sx={{
                              fontSize: 12,
                              color: theme.muted,
                              maxWidth: 220,
                            }}
                          >
                            {p.description || "No description"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={cellSx}>{p.category || "-"}</TableCell>

                    <TableCell sx={cellSx}>
                      ${Number(p.price || 0).toFixed(2)}
                      {onSale && (
                        <Typography sx={{ fontSize: 11, color: GREEN }}>
                          Sale: ${Number(p.salePrice).toFixed(2)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={cellSx}>{p.stock}</TableCell>

                    <TableCell
                      sx={{ ...cellSx, color: status.color, fontWeight: 600 }}
                    >
                      {status.label}
                    </TableCell>

                    <TableCell sx={cellSx}>
                      <IconButton
                        size="small"
                        title="View"
                        onClick={() => onView(p)}
                        sx={{ color: BROWN }}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Edit"
                        onClick={() => onEdit(p)}
                        sx={{ color: GREEN }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Delete"
                        onClick={() => onDelete(p)}
                        sx={{ color: RED }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          disabled={loading || page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          sx={navButtonSx}
        >
          Previous
        </Button>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {getPageList(page, totalPages).map((p) => {
            const isGap = typeof p === "string";
            const active = page === p;

            return (
              <Button
                key={p}
                disabled={isGap || loading}
                onClick={() => setPage(p)}
                aria-label={isGap ? "More pages" : `Page ${p}`}
                aria-current={active ? "page" : undefined}
                sx={{
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: active ? theme.pageActive : theme.border,
                  bgcolor: active ? theme.pageActive : "transparent",
                  color: active ? BROWN : theme.text,
                  fontWeight: active ? 700 : 400,
                  "&.Mui-disabled": {
                    color: active ? BROWN : theme.text,
                  },
                }}
              >
                {isGap ? "...." : p}
              </Button>
            );
          })}
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={loading || page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          sx={navButtonSx}
        >
          Next
        </Button>
      </Box>

      <Typography
        sx={{
          mt: 2,
          fontSize: 12,
          color: theme.muted,
          textAlign: "center",
        }}
      >
        Showing {from}–{to} of {totalProducts} products · Page {page} of{" "}
        {totalPages}
      </Typography>
    </Box>
  );
}
