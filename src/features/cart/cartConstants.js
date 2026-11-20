export const BROWN = "#947458";
export const GRAY_BG = "var(--c-f4f2f0)";
export const LIGHT_BG = "var(--c-f8f8f8)";
export const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
export const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };

export const BROWN_BUTTON = {
  height: { xs: 50, lg: 56 },
  borderRadius: 0,
  bgcolor: BROWN,
  color: "#fff",
  textTransform: "none",
  fontSize: { xs: 15, lg: 16 },
  fontWeight: 600,
  "&:hover": { bgcolor: "#7d6048" },
};

export const ROW_COLUMNS = {
  xs: "1fr auto",
  md: "minmax(0, 1fr) 110px 140px 110px 36px",
};

export function formatCartMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
