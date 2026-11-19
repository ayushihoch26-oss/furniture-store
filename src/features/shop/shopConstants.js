import { CreditCardOutlined, Inventory2Outlined, ContactSupportOutlined } from "@mui/icons-material";
import { PAGE_LIMIT } from "../../service/shop.service";
import Armchairs from "../../assets/shop-icon1.png";
import Cabinets from "../../assets/shop-icon2.png";
import Sofa from "../../assets/shop-icon3.png";
import Chair from "../../assets/shop-icon4.png";
import Decor from "../../assets/shop-icon5.png";

export const BROWN = "#947458";
export const GRAY_BG = "var(--c-f4f2f0)";
export const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
export const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };
export const SECTION_PY = { xs: "56px", md: "80px", lg: "118px" };

export const H2 = {
  fontSize: { xs: 26, md: 34, lg: 40 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.2,
};

export const FILTER_TITLE = {
  fontSize: { xs: 16, md: 17, lg: 20 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.3,
  mb: { xs: "10px", lg: "12px" },
};

export const OPTION_TEXT = {
  fontSize: { xs: 13, md: 14, lg: 16 },
  color: "var(--c-222222)",
};

export const ROW_PY = { xs: "4px", lg: "6px" };
export const DOTS = ["#BDBDBD", "#A79186", "#9A9AAE"];

export const CATEGORY_ICONS = {
  armchairs: Armchairs,
  armchair: Armchairs,
  cabinets: Cabinets,
  cabinet: Cabinets,
  sofas: Sofa,
  sofa: Sofa,
  chairs: Chair,
  chair: Chair,
  decor: Decor,
};
export const FALLBACK_CATEGORY_ICON = Decor;

export const BADGE_COLORS = {
  SALE: "#FF5252",
  NEW: "#1a1a1a",
  "SOLD OUT": "#8a8a8a",
};

export const SERVICES = [
  {
    Icon: CreditCardOutlined,
    title: "Secure Payments",
    text: "Feugiat mi gravida vestibulum orci ac volutpat non",
  },
  {
    Icon: Inventory2Outlined,
    title: "Return Within 14 Days",
    text: "Urna elementum eget quam facilisi vulputate",
  },
  {
    Icon: ContactSupportOutlined,
    title: "24/7 Support",
    text: "Semper turpis sed maecenas vivamus vel scelerisque",
  },
];

export const PAGE_SIZE = PAGE_LIMIT;
export const SALE = "Sale";
export const SEARCH_DEBOUNCE_MS = 400;

export const SORTS = [
  { value: "latest", label: "Sort by latest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export const scrollToProducts = () =>
  document
    .getElementById("shop-products")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

// ---------------------------------------------------------------------------
