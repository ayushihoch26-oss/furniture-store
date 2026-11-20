import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import {
  ShoppingBagOutlined,
  LocationOnOutlined,
  LockOutlined,
} from "@mui/icons-material";

export const PROFILE_KEY = "furniture_profile";

export const COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
];

export const TABS = [
  { id: "account", label: "Account details", Icon: PersonOutlinedIcon },
  { id: "orders", label: "My orders", Icon: ShoppingBagOutlined },
  { id: "addresses", label: "Addresses", Icon: LocationOnOutlined },
  { id: "security", label: "Password", Icon: LockOutlined },
];

export function money(value) {
  const number = Number(value || 0);

  return `$${number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date) {
  const dateObject = new Date(date);

  return dateObject.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
