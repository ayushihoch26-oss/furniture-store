// constants/orderConstants.js
// All fixed values live here, so you change them in ONE place.
import {
  LocalShippingOutlined,
  PendingActionsOutlined,
  CancelOutlined,
} from "@mui/icons-material";
import { API_BASE_URL } from "../../../../config/constants";

export const ORDERS_API_URL = `${API_BASE_URL}/orders`;
export const PAGE_SIZE = 10;

// Tabs shown above the table
export const TABS = ["All order", "Completed", "Pending", "Canceled"];

// Tab name -> status value the backend understands
export const TAB_STATUS = {
  Completed: "Delivered",
  Pending: "Pending",
  Canceled: "Cancelled",
};

export const ORDER_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];
export const PAYMENT_OPTIONS = ["Paid", "Unpaid"];

export const COLORS = {
  brown: "#947458",
  brownDark: "#7d6149",
  brownLight: "#F3ECE5",
  bg: "#F7F7F7",
  blue: "#394CB8",
  red: "#E5484D",
  yellow: "#F5B301",
  green: "#2E9E5B",
};

// Color + icon for each order status
export const STATUS_STYLE = {
  Delivered: { color: COLORS.blue, Icon: LocalShippingOutlined },
  Pending: { color: COLORS.yellow, Icon: PendingActionsOutlined },
  Shipped: { color: "#275E23", Icon: LocalShippingOutlined },
  Cancelled: { color: COLORS.red, Icon: CancelOutlined },
};

// Table column widths
export const TABLE_COLUMNS =
  "52px 120px minmax(180px, 2.5fr) 1.2fr 100px 1fr 1.3fr 120px";

// Returns light or dark colors for the whole orders feature
export function getTheme(darkMode) {
  return {
    page: darkMode ? "#1C1917" : COLORS.bg,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : COLORS.bg,
    header: darkMode ? "#332D28" : COLORS.brownLight,
    pageActive: darkMode ? "#403832" : COLORS.brownLight,
  };
}
