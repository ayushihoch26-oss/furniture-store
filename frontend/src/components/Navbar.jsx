import { useState, useEffect, useContext } from "react";
import SaleTicker from "./SaleTicker";
import {
  Box,
  Typography,
  InputBase,
  Select,
  MenuItem,
  IconButton,
  Drawer,
  Badge,
  Divider,
} from "@mui/material";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  FavoriteBorder,
  ShoppingBagOutlined,
  Phone,
  KeyboardArrowDown,
  Menu as MenuIcon,
  PlaceOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  LoginOutlined,
} from "@mui/icons-material";

import { getToken, getCurrentUser } from "../service/login.service";
import { getWishlist, fetchWishlist } from "../service/wishlist.service";
import shopService from "../service/shop.service";
import users from "../assets/user.svg";
import { ThemeModeContext } from "../theme/ThemeModeContext";
import logoImage from "../assets/cabinet 1.svg";

const BROWN = "#947458";
const CART_KEY = "furniture_cart";

const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };

const NAV_LINKS = [
  { title: "Home", href: "/Dashboard" },
  { title: "Shop", href: "/Shop" },
  { title: "About us", href: "/AboutUs" },
  { title: "Contact", href: "/Contact" },
];

const ADDRESS = "60 Fremont Ave. Hamden, CT 06514";
const PHONE = "(928) 630-9272";

const badgeSx = {
  "& .MuiBadge-badge": {
    bgcolor: "#111",
    color: "#fff",
    fontSize: 9,
    height: 14,
    minWidth: 14,
    padding: "0 3px",
    top: 3,
    right: 3,
  },
};

// ---------- Cart count ----------

const readCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY));

    return Array.isArray(cart)
      ? cart.reduce((sum, item) => sum + Number(item.qty || 0), 0)
      : 0;
  } catch {
    return 0;
  }
};

function useCartCount() {
  const [count, setCount] = useState(readCartCount);

  useEffect(() => {
    const update = () => setCount(readCartCount());

    window.addEventListener("storage", update);
    window.addEventListener("cart:changed", update);

    const timer = setInterval(update, 1000);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart:changed", update);
      clearInterval(timer);
    };
  }, []);

  return count;
}

// ---------- Wishlist count ----------

function useWishlistCount() {
  const [count, setCount] = useState(() => getWishlist().length);

  useEffect(() => {
    const update = () => setCount(getWishlist().length);

    window.addEventListener("wishlist:changed", update);
    window.addEventListener("storage", update);

    if (getToken()) {
      fetchWishlist().catch(() => {
        // Retain the current local count if the request fails.
      });
    }

    return () => {
      window.removeEventListener("wishlist:changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return count;
}

// ---------- Account icon ----------

function AccountIcon({ loggedIn, size = 24 }) {
  return loggedIn ? (
    <Box
      component="img"
      src={users}
      alt="My account"
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "var(--icon-filter)",
      }}
    />
  ) : (
    <LoginOutlined sx={{ fontSize: size }} />
  );
}

// ---------- Navbar ----------

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Dynamic category and search state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);

  const { darkMode, toggleDarkMode } = useContext(ThemeModeContext);

  const closeMenu = () => setMenuOpen(false);

  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  const isLoggedIn = Boolean(getToken() && getCurrentUser());

  const accountTo = isLoggedIn ? "/profile" : "/login";
  const accountLabel = isLoggedIn ? "My account" : "Login";

  // Load active categories from Admin > Categories
  useEffect(() => {
    let active = true;

    shopService
      .getCategories()
      .then((list) => {
        if (!active) return;

        const names = list
          .map((item) => item?.name)
          .filter((name) => typeof name === "string" && name.trim());

        setCategories([...new Set(names)]);
      })
      .catch(() => {
        // already logged inside shopService
      })
      .finally(() => {
        if (active) setCategoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Keep the dropdown and search box in sync with the Shop page URL
  useEffect(() => {
    if (location.pathname.toLowerCase() !== "/shop") return;

    const params = new URLSearchParams(location.search);

    // eslint-disable-next-line
    setSelectedCategory((params.get("categories") || "").split(",")[0].trim());
    setSearchText(params.get("search") || "");
  }, [location.pathname, location.search]);

  // If the URL has a category that is no longer active, still show it
  // so the Select never has a value that is missing from its options.
  const categoryOptions =
    selectedCategory && !categories.includes(selectedCategory)
      ? [selectedCategory, ...categories]
      : categories;

  // Navigate to the Shop page with the selected filters
  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const search = searchText.trim();
    const category = selectedCategory.trim();

    if (search) {
      params.set("search", search);
    }

    if (category) {
      params.set("categories", category);
    }

    params.set("page", "1");

    navigate(`/Shop?${params.toString()}`);
    closeMenu();
  };

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        m: 0,
        p: 0,
        fontFamily: "DM Sans, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Announcement bar */}
      <Box
        sx={{
          width: "100%",
          minHeight: { xs: 32, md: 38 },
          bgcolor: BROWN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: "6px",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Announcement bar: sliding sale discounts */}
        <Box
          sx={{
            width: "100%",
            minHeight: { xs: 32, md: 38 },
            bgcolor: BROWN,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            py: "6px",
            boxSizing: "border-box",
          }}
        >
          <SaleTicker />
        </Box>
        <Typography
          sx={{
            fontSize: { xs: 11, sm: 12, md: 14 },
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            textAlign: "center",
          }}
        >
          This weekend sale <b>20% off</b> on all products
        </Typography>
      </Box>

      {/* 2. Address / search / phone */}
      <Box
        sx={{
          minHeight: { xs: 60, md: 82 },
          bgcolor: "var(--c-f6f4f2)",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr minmax(320px, 462px) 1fr",
          },
          alignItems: "center",
          columnGap: 2,
          px: SIDE,
          py: { xs: "10px", md: 0 },
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifySelf: "start",
          }}
        >
          <Typography
            sx={{
              fontSize: { md: 13, lg: 14 },
              color: "var(--c-111111)",
            }}
          >
            {ADDRESS}
          </Typography>
        </Box>

        {/* Search with dynamic categories */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: 462 },
            height: { xs: 40, md: 42 },
            display: "flex",
            alignItems: "center",
            border: "1px solid var(--c-e5e5e5)",
            bgcolor: "var(--c-ffffff)",
            boxSizing: "border-box",
            justifySelf: "center",
          }}
        >
          <Select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            variant="standard"
            disableUnderline
            IconComponent={KeyboardArrowDown}
            displayEmpty
            MenuProps={{ disableScrollLock: true }}
            sx={{
              width: { xs: 112, sm: 124 },
              flexShrink: 0,
              fontSize: { xs: 13, md: 14 },
              height: 34,
              px: "5px",
              "& .MuiSelect-select": {
                py: "5px",
                pr: "16px !important",
              },
            }}
          >
            <MenuItem value="">
              {categoryLoading ? "Loading..." : "All Categories"}
            </MenuItem>

            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>

          <Box
            sx={{
              width: "1px",
              height: "100%",
              bgcolor: "var(--c-e5e5e5)",
              flexShrink: 0,
            }}
          />

          <InputBase
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search product..."
            inputProps={{ "aria-label": "Search products" }}
            sx={{
              flex: 1,
              minWidth: 0,
              px: "8px",
              fontSize: { xs: 13, md: 14 },
              "& input::placeholder": {
                color: "#A5A5A5",
                opacity: 1,
              },
            }}
          />

          <IconButton
            type="submit"
            aria-label="Search"
            sx={{
              p: "8px",
              color: "var(--c-111111)",
            }}
          >
            <Search sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: "12px",
            justifySelf: "end",
          }}
        >
          <Phone sx={{ fontSize: 16, color: "var(--c-111111)" }} />

          <Typography
            sx={{
              fontSize: { md: 13, lg: 14 },
              color: "var(--c-111111)",
            }}
          >
            {PHONE}
          </Typography>
        </Box>
      </Box>

      {/* 3. Main navigation */}
      <Box
        sx={{
          minHeight: { xs: 64, md: 84, lg: 111 },
          bgcolor: "var(--c-ffffff)",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr auto",
            md: "1fr auto 1fr",
          },
          alignItems: "center",
          columnGap: 2,
          px: SIDE,
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <Box
          component={NavLink}
          to="/Dashboard"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            justifySelf: "start",
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src={logoImage}
            alt="Furniture Store"
            sx={{
              width: { xs: 22, lg: 24 },
              height: { xs: 22, lg: 24 },
              objectFit: "contain",
              filter: "var(--icon-filter)",
            }}
          />

          <Typography
            sx={{
              fontSize: { xs: 17, sm: 18, lg: 20 },
              fontWeight: 700,
              color: "var(--c-111111)",
              whiteSpace: "nowrap",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Furniture Store
          </Typography>
        </Box>

        {/* Desktop links */}
        <Box
          component="nav"
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: { md: "20px", lg: "26px", xl: "36px" },
          }}
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.title}
              to={item.href}
              end={item.href === "/Dashboard"}
              style={{ textDecoration: "none" }}
            >
              {({ isActive }) => (
                <Typography
                  sx={{
                    color: isActive ? BROWN : "var(--c-111111)",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: { md: 15, lg: 16, xl: 18 },
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                    "&:hover": { color: BROWN },
                  }}
                >
                  {item.title}
                </Typography>
              )}
            </NavLink>
          ))}
        </Box>

        {/* Icons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: "4px", md: "8px" },
            justifySelf: "end",
          }}
        >
          <IconButton
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Light mode" : "Dark mode"}
            sx={{ color: "var(--c-111111)", p: "4px" }}
          >
            {darkMode ? (
              <LightModeOutlined sx={{ fontSize: 24 }} />
            ) : (
              <DarkModeOutlined sx={{ fontSize: 24 }} />
            )}
          </IconButton>

          <IconButton
            component={Link}
            to={accountTo}
            aria-label={accountLabel}
            title={accountLabel}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              color: "var(--c-111111)",
              p: "4px",
            }}
          >
            <AccountIcon loggedIn={isLoggedIn} size={24} />
          </IconButton>

          <IconButton
            component={Link}
            to="/Wishlist"
            aria-label="Wishlist"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              color: "var(--c-111111)",
              p: "4px",
            }}
          >
            <Badge badgeContent={wishlistCount} showZero sx={badgeSx}>
              <FavoriteBorder sx={{ fontSize: 24 }} />
            </Badge>
          </IconButton>

          <IconButton
            component={Link}
            to="/cart"
            aria-label="Shopping bag"
            sx={{ color: "var(--c-111111)", p: "4px" }}
          >
            <Badge badgeContent={cartCount} showZero sx={badgeSx}>
              <ShoppingBagOutlined sx={{ fontSize: 24 }} />
            </Badge>
          </IconButton>

          <IconButton
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "var(--c-111111)",
              p: "4px",
              ml: "2px",
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Mobile / tablet menu */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            width: { xs: "82%", sm: 340 },
            maxWidth: 360,
          },
        }}
      >
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <IconButton
            component={Link}
            to={accountTo}
            onClick={closeMenu}
            aria-label={accountLabel}
            title={accountLabel}
            sx={{
              border: "1px solid var(--c-dddddd)",
              borderRadius: 0,
            }}
          >
            <AccountIcon loggedIn={isLoggedIn} size={22} />
          </IconButton>

          <IconButton
            component={Link}
            to="/Wishlist"
            onClick={closeMenu}
            aria-label="Wishlist"
            sx={{
              border: "1px solid var(--c-dddddd)",
              borderRadius: 0,
            }}
          >
            <Badge badgeContent={wishlistCount} showZero sx={badgeSx}>
              <FavoriteBorder sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          <IconButton
            component={Link}
            to="/cart"
            onClick={closeMenu}
            aria-label="Cart"
            sx={{
              border: "1px solid var(--c-dddddd)",
              borderRadius: 0,
            }}
          >
            <Badge badgeContent={cartCount} showZero sx={badgeSx}>
              <ShoppingBagOutlined sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
        </Box>

        <Divider />

        {/* Mobile search uses the same search and category state */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2 }}
        >
          <Select
            fullWidth
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            displayEmpty
            size="small"
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="">
              {categoryLoading ? "Loading..." : "All Categories"}
            </MenuItem>

            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid var(--c-e5e5e5)",
              minHeight: 40,
            }}
          >
            <InputBase
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search product..."
              inputProps={{ "aria-label": "Search products" }}
              sx={{ flex: 1, minWidth: 0, px: 1, fontSize: 14 }}
            />

            <IconButton type="submit" aria-label="Search products">
              <Search sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        <Box component="nav" sx={{ py: 1 }}>
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.title}
              to={item.href}
              end={item.href === "/Dashboard"}
              onClick={closeMenu}
              style={{ textDecoration: "none" }}
            >
              {({ isActive }) => (
                <Typography
                  sx={{
                    px: 2.5,
                    py: "14px",
                    fontSize: 17,
                    color: isActive ? BROWN : "var(--c-111111)",
                    fontWeight: isActive ? 600 : 400,
                    borderLeft: `3px solid ${isActive ? BROWN : "transparent"}`,
                  }}
                >
                  {item.title}
                </Typography>
              )}
            </NavLink>
          ))}
        </Box>

        <Divider />

        <Box
          sx={{
            px: 2.5,
            py: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <PlaceOutlined sx={{ fontSize: 18, mt: "1px" }} />

            <Typography sx={{ fontSize: 14, color: "var(--c-333333)" }}>
              {ADDRESS}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <Phone sx={{ fontSize: 18 }} />

            <Typography sx={{ fontSize: 14, color: "var(--c-333333)" }}>
              {PHONE}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <IconButton
              component={Link}
              to={accountTo}
              onClick={closeMenu}
              aria-label={accountLabel}
              title={accountLabel}
              sx={{
                border: "1px solid var(--c-dddddd)",
                borderRadius: 0,
              }}
            >
              <AccountIcon loggedIn={isLoggedIn} size={22} />
            </IconButton>

            <IconButton
              component={Link}
              to="/Wishlist"
              onClick={closeMenu}
              aria-label="Wishlist"
              sx={{
                border: "1px solid var(--c-dddddd)",
                borderRadius: 0,
              }}
            >
              <Badge badgeContent={wishlistCount} showZero sx={badgeSx}>
                <FavoriteBorder sx={{ fontSize: 22 }} />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Navbar;
