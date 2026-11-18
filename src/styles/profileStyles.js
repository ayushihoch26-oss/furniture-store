export const BROWN = "#947458";
export const GRAY_BG = "var(--c-f4f2f0)";
export const LIGHT_BG = "var(--c-f8f8f8)";
export const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
export const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };

export const STATUS_STYLE = {
  Delivered: { bg: "#E8F5E9", color: "#2e7d32" },
  Shipped: { bg: "#E3F2FD", color: "#1565c0" },
  Pending: { bg: "var(--c-f5ede6)", color: BROWN },
  Processing: { bg: "var(--c-f5ede6)", color: BROWN },
  Cancelled: { bg: "#FDECEA", color: "#c62828" },
};

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    bgcolor: "var(--c-ffffff)",
    fontSize: { xs: 14, lg: 15 },
    "& fieldset": { borderColor: "var(--c-d9d4cf)" },
    "&:hover fieldset": { borderColor: BROWN },
    "&.Mui-focused fieldset": { borderColor: BROWN, borderWidth: 1 },
  },
  "& .MuiInputLabel-root": { fontSize: { xs: 14, lg: 15 } },
  "& .MuiInputLabel-root.Mui-focused": { color: BROWN },
};

export const brownBtn = {
  height: { xs: 44, lg: 48 },
  px: { xs: 3, lg: 5 },
  borderRadius: 0,
  bgcolor: BROWN,
  color: "#fff",
  textTransform: "none",
  fontSize: { xs: 14, lg: 15 },
  fontWeight: 600,
  "&:hover": { bgcolor: "#7d6048" },
};

export const outlineBtn = {
  height: { xs: 44, lg: 48 },
  px: { xs: 3, lg: 4 },
  borderRadius: 0,
  borderColor: BROWN,
  color: "var(--c-555555)",
  textTransform: "none",
  fontSize: { xs: 14, lg: 15 },
  "&:hover": { borderColor: BROWN, bgcolor: "transparent" },
};
