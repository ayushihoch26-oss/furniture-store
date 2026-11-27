import { BG, BROWN_LIGHT } from "../constants/invoice.constants";

// Theme used by the admin page shell
export const getPageTheme = (darkMode) => ({
  page: darkMode ? "#1C1917" : BG,
  card: darkMode ? "#292421" : "#FFFFFF",
  text: darkMode ? "#F5F0EB" : "#222222",
  border: darkMode ? "#403832" : "#E8EDF3",
  soft: darkMode ? "#332D28" : BG,
});

// Theme used by the invoice table
export const getTableTheme = (darkMode) => ({
  card: darkMode ? "#292421" : "#fff",
  text: darkMode ? "#F5F0EB" : "#222",
  headText: darkMode ? "#F5F0EB" : "#333",
  muted: darkMode ? "#B8AAA0" : "#777",
  iconButton: darkMode ? "#F5F0EB" : "#444",
  border: darkMode ? "#403832" : "#E8EDF3",
  soft: darkMode ? "#332D28" : BG,
  header: darkMode ? "#332D28" : BROWN_LIGHT,
  tabText: darkMode ? "#B8AAA0" : "#555",
  tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
  pageActive: darkMode ? "#403832" : BROWN_LIGHT,
  rangeBg: darkMode ? "#403832" : BROWN_LIGHT,
  dayHover: darkMode ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)",
  rowDivider: darkMode ? "#403832" : "#eee",
});

export const getPaperSx = (darkMode, theme) =>
  darkMode
    ? { bgcolor: theme.card, color: theme.text, backgroundImage: "none" }
    : {};

export const getFieldSx = (theme) => ({
  "& .MuiInputBase-root": { color: theme.text },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
  "& .MuiSvgIcon-root": { color: theme.muted },
});
