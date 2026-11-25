import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { getStatus } from "./ProductTable";

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

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

export default function ProductDialog({
  mode,
  form,
  categories,
  imagePreview,
  saleTooHigh,
  formInvalid,
  saving,
  theme,
  onClose,
  onFieldChange,
  onPickImage,
  onSave,
}) {
  const previewSrc = imagePreview || form.image;
  const formCategories =
    form.category && !categories.includes(form.category)
      ? [form.category, ...categories]
      : categories;

  const fieldSx = {
    mb: 2,
    "& .MuiInputBase-root": { color: theme.text },
    "& .MuiInputLabel-root": { color: theme.muted },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
  };

  const viewRows = [
    ["Product ID", form.productCode || form.id],
    ["Product", form.name],
    ["Category", form.category],
    ["Price", `$${Number(form.price || 0).toFixed(2)}`],
    [
      "Sale Price",
      form.salePrice === ""
        ? "-"
        : `$${Number(form.salePrice).toFixed(2)}`,
    ],
    ["Stock", form.stock],
    ["Status", getStatus(form.stock).label],
    ["Material", form.material || "-"],
    ["Size", form.size || "-"],
    ["Shipping", form.shipping || "-"],
    ["Description", form.description || "-"],
  ];

  return (
    <Dialog
      open={Boolean(mode)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            bgcolor: theme.card,
            color: theme.text,
            backgroundImage: "none",
          },
        },
      }}
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
                sx={{ width: 120, height: 120, objectFit: "contain", mx: "auto" }}
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
                <Typography fontWeight={600} textAlign="right">
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
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
                  }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Image URL"
                  value={form.image}
                  onChange={(event) =>
                    onFieldChange("image", event.target.value)
                  }
                  sx={{ ...fieldSx, mb: 1 }}
                />
                <Button component="label" size="small" variant="outlined">
                  Upload Image
                  <input
                    hidden
                    type="file"
                    accept={IMAGE_TYPES.join(",")}
                    onChange={(event) => {
                      onPickImage(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </Button>
              </Box>
            </Box>

            <TextField
              select
              fullWidth
              required
              label="Category"
              value={form.category}
              onChange={(event) =>
                onFieldChange("category", event.target.value)
              }
              helperText={
                categories.length === 0 ? "Create a category first." : ""
              }
              sx={fieldSx}
            >
              {formCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            {TEXT_FIELDS.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                type={field.type || "text"}
                required={field.required}
                multiline={field.multiline}
                minRows={field.multiline ? 3 : undefined}
                value={form[field.name]}
                onChange={(event) =>
                  onFieldChange(field.name, event.target.value)
                }
                error={field.name === "salePrice" && saleTooHigh}
                helperText={
                  field.name === "salePrice" && saleTooHigh
                    ? "Sale price cannot exceed price."
                    : ""
                }
                sx={fieldSx}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ color: theme.muted, textTransform: "none" }}
        >
          {mode === "view" ? "Close" : "Cancel"}
        </Button>
        {mode !== "view" && (
          <Button
            variant="contained"
            onClick={onSave}
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
  );
}
