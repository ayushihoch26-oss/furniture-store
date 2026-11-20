import { PlaceOutlined, PhoneOutlined, MailOutlined } from "@mui/icons-material";
import bg from "../../assets/images/contactus-bg.jpg";

export const ADDRESS = "60 Fremont Ave. Hamden, CT 06514";

export const MAP_URL =
  "https://maps.google.com/maps?q=60%20Fremont%20Ave%2C%20Hamden%2C%20CT%2006514&z=15&output=embed";

export const CONTACT_INFO = [
  { Icon: PlaceOutlined, label: "Physical address", value: ADDRESS },
  { Icon: PhoneOutlined, label: "Phone number", value: "+437 402-2459" },
  { Icon: MailOutlined, label: "Email address", value: "fStore@email.com" },
];

export const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  message: "",
};
export const HERO_BACKGROUND = [
  "radial-gradient(ellipse 28% 55% at 28% 105%, rgba(58,45,33,0.75) 0%, transparent 70%)",
  "radial-gradient(ellipse 22% 60% at 100% 0%, rgba(198,181,157,0.55) 0%, transparent 70%)",
  "radial-gradient(ellipse 25% 50% at 0% 15%, rgba(171,148,121,0.5) 0%, transparent 70%)",
  "radial-gradient(ellipse 30% 45% at 60% 40%, rgba(95,75,55,0.6) 0%, transparent 75%)",
  "linear-gradient(180deg, rgba(140,116,89,0.5) 0%, rgba(112,90,67,0.65) 100%)",
  `url(${bg}) center / cover no-repeat`,
].join(", ");
