import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";

export const CATEGORY_PAGE_SIZE = 8;
export const CATEGORY_MAX_IMAGE_SIZE = 2 * 1024 * 1024;
export const CATEGORY_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const CATEGORY_NAME_MAX_LENGTH = 60;

export const EMPTY_CATEGORY_FORM = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

export const CATEGORY_COLORS = {
  BROWN: "#947458",
  BROWN_DARK: "#7D6149",
  BROWN_LIGHT: "#F3ECE5",
  GREEN: "#2E9E5B",
  RED: "#E5484D",
  GRAY: "#9A9A9A",
  CALENDAR_BG: "#28231F",
  CALENDAR_SURFACE: "#342D27",
  CALENDAR_BORDER: "#443A32",
  CALENDAR_TEXT: "#F5F0EB",
  CALENDAR_MUTED: "#B7AAA0",
};

export const CATEGORY_TABS = [
  { label: "All category", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const CATEGORY_STATUS = {
  Active: [CATEGORY_COLORS.GREEN, CheckCircleOutlinedIcon],
  Inactive: [CATEGORY_COLORS.GRAY, PauseCircleOutlinedIcon],
};

export const CATEGORY_TABLE_COLUMNS =
  "70px 110px minmax(200px, 2.2fr) 100px 1fr 130px 130px";

export const getCategoryTheme = (darkMode) => ({
  page: darkMode ? "#1C1917" : "#F7F7F7",
  card: darkMode ? "#292421" : "#FFFFFF",
  text: darkMode ? "#F5F0EB" : "#222222",
  muted: darkMode ? "#B8AAA0" : "#777777",
  border: darkMode ? "#403832" : "#E8EDF3",
  soft: darkMode ? "#332D28" : "#F7F7F7",
  header: darkMode ? "#332D28" : "#F3ECE5",
  pageActive: darkMode ? "#403832" : "#F3ECE5",
});
