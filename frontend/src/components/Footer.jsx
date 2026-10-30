import { Box, Typography, InputBase, Button, IconButton } from "@mui/material";
//inputBase use in input field and in this page apply in email
import { Facebook, X as XIcon, Instagram, YouTube } from "@mui/icons-material";
import logoImage from "../assets/cabinet 1.svg";
import { NavLink } from "react-router-dom";

const SIDE = { xs: 2, md: "10%" };
const BG = "var(--c-f4f2f0)";

const COLUMNS = [
  {
    title: "Page",
    links: [
      { label: "Home", path: "/Dashboard" },
      { label: "Shop", path: "/Shop" },
      { label: "About", path: "/AboutUs" },
      { label: "Contactus", path: "/Contact" },
      { label: "Profile", path: "/Profile" },
    ],
  },
  {
    title: "Customer service",
    links: [
      { label: "Orders", path: "/Orders" },
      { label: "Addresses", path: "/Profile" },
      { label: "Returns", path: "/Returns" },
      { label: "Account details", path: "/Profile" },
      { label: "F.A.Q", path: "/FAQ" },
    ],
  },
  {
    title: "Delivery",
    links: [
      { label: "Orders", path: "/Orders" },
      { label: "Return", path: "/Returns" },
      { label: "Free Delivery", path: "/Delivery" },
    ],
  },
];

const PAYMENTS = [
  { label: "VISA", sx: { fontStyle: "italic", color: "#6b6f8a" } },
  { label: "AMEX", sx: { color: "#b5b5b5" } },
  { label: "●●", sx: { color: "var(--c-8a8a8a)", letterSpacing: "-4px" } },
  { label: "PayPal", sx: { fontStyle: "italic", color: "#6b6f8a" } },
];

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: BG, width: "100%" }}>
      {/* Newsletter */}
      <Box
        sx={{
          px: SIDE,
          pt: { xs: 5, md: "56px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "center",
          gap: { xs: 3, md: 0 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--c-111111)",
              lineHeight: 1.6,
            }}
          >
            Subscribe to our newsletter
          </Typography>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--c-111111)",
              lineHeight: 1.6,
            }}
          >
            Don't miss latest news &amp; promotions
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: "5px" }}>
          <InputBase
            placeholder="Enter your email"
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: "var(--c-ffffff)",
              px: "14px",
              height: 40,
              fontSize: 13,
              "& input::placeholder": { color: "#B0B0B0", opacity: 1 },
            }}
          />
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: "#947458",
              borderRadius: 0,
              height: 40,
              width: 152,
              textTransform: "none",
              fontSize: 13,
              "&:hover": { bgcolor: "#7d6149" },
            }}
          >
            Subscribe
          </Button>
        </Box>
      </Box>

      {/* Links */}
      <Box
        sx={{
          px: SIDE,
          pt: { xs: 5, md: "48px" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "1.27fr 1fr 1.1fr 0.5fr" },
          gap: { xs: 4, md: 2 },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              mb: "10px",
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="f Store"
              sx={{ width: 20, height: 20, filter: "var(--icon-filter)" }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "var(--c-111111)" }}>
              f Store
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: "var(--c-555555)", lineHeight: 1.9 }}>
            60 Fremont Ave. Hamden, CT 06514
          </Typography>
          <Typography sx={{ fontSize: 11, color: "var(--c-555555)", lineHeight: 1.9 }}>
            <b style={{ color: "var(--c-111111)" }}>Email:</b> fStore@email.com
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: "var(--c-555555)", lineHeight: 1.9, mb: "8px" }}
          >
            <b style={{ color: "var(--c-111111)" }}>Phone:</b> (928) 630-9272
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", ml: "-3px" }}>
            {[Facebook, XIcon, Instagram, YouTube].map((Icon, i) => (
              <IconButton
                key={i}
                size="small"
                aria-label="social"
                sx={{ color: "var(--c-111111)", p: "3px" }}
              >
                <Icon sx={{ fontSize: 16 }} />
              </IconButton>
            ))}
          </Box>
        </Box>

        {COLUMNS.map((col) => (
          <Box key={col.title}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--c-111111)",
                mb: "12px",
                lineHeight: 1.4,
              }}
            >
              {col.title}
            </Typography>
            {col.links.map((link) => (
              <Typography
                key={link.label}
                component={NavLink}
                to={link.path}
                sx={{
                  display: "block",
                  fontSize: 16,
                  lineHeight: "18px",
                  color: "var(--c-666666)",
                  textDecoration: "none",
                  mb: "5px",
                  "&:hover": { color: "#947458" },
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>

      {/* Bottom bar */}
      <Box
        sx={{
          px: SIDE,
          pt: { xs: 4, md: "40px" },
          pb: { xs: 3, md: "28px" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography sx={{ fontSize: 11, color: "var(--c-777777)" }}>
          © Copyright f Store 2024. Design by Figma.guru
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "22px" }}>
          {PAYMENTS.map((p) => (
            <Typography
              key={p.label}
              sx={{ fontSize: 12, fontWeight: 700, ...p.sx }}
            >
              {p.label}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
