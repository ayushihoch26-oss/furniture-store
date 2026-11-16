import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Avatar,
  Drawer,
  IconButton,
  ButtonBase,
  Tooltip,
} from "@mui/material";

import { logoutUser, getCurrentUser } from "../../service/login.service";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Link, useLocation } from "react-router-dom";

import {
  Menu as MenuIcon,
  MenuOpen,
  HomeOutlined,
  LocalShippingOutlined,
  PersonOutlined,
  ShoppingCartOutlined,
  Inventory2Outlined,
  ManageAccountsOutlined,
  SettingsOutlined,
  LogoutOutlined,
  StorefrontOutlined,
  OpenInNew,
  KeyboardDoubleArrowLeft,
  CategoryOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";

const BROWN = "#947458";
const WIDTH = 260;
const COLLAPSED_WIDTH = 76;
const STORAGE_KEY = "admin-sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

function usePersistedCollapsed() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;

      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }

      return next;
    });
  }, []);

  return [collapsed, toggle];
}

const MENU = [
  {
    title: "Main menu",
    items: [
      { label: "Dashboard", icon: HomeOutlined, to: "/admin" },
      {
        label: "Order Management",
        icon: LocalShippingOutlined,
        to: "/admin/orderManagement",
      },
      { label: "Customers", icon: PersonOutlined, to: "/admin/customers" },
      { label: "Cart", icon: ShoppingCartOutlined, to: "/admin/cart" },
      { label: "Contact us", icon: OpenInNew, to: "/admin/contactus" },
      { label: "Wishlist", icon: FavoriteBorderIcon, to: "/admin/wishlist" },
      { label: "Invoice", icon: ReceiptLongOutlined, to: "/admin/invoice" },
    ],
  },
  {
    title: "Product",
    items: [
      { label: "Products", icon: Inventory2Outlined, to: "/admin/products" },
      {
        label: "Categories",
        icon: CategoryOutlined,
        to: "/admin/category",
      },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Admin role", icon: ManageAccountsOutlined, to: "/admin/roles" },
      {
        label: "Control Authority",
        icon: SettingsOutlined,
        to: "/admin/authority",
      },
    ],
  },
];

function SidebarContent({
  user,
  shopUrl,
  onLogout,
  onClose,
  collapsed,
  onToggle,
  darkMode,
}) {
  const { pathname } = useLocation();

  const theme = darkMode
    ? {
        bg: "#24211F",
        text: "#F5F0EB",
        muted: "#B8AAA0",
        border: "#403832",
        hover: "#39312B",
        active: "#947458",
        shopText: "#D8B89A",
      }
    : {
        bg: "#FFFFFF",
        text: "#2B2B2B",
        muted: "#777777",
        border: "#EEEEEE",
        hover: "#F6F4F2",
        active: BROWN,
        shopText: "#0F3D3E",
      };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.bg,
        color: theme.text,
        transition: "background-color 0.25s ease",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 72,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Typography
            sx={{ fontSize: 22, fontWeight: 800, color: theme.shopText }}
          >
            Furniture<span style={{ color: BROWN }}>S</span>tore
          </Typography>
        )}

        <IconButton
          onClick={onToggle}
          sx={{
            display: { xs: "none", md: "inline-flex" },
            color: theme.text,
          }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <MenuIcon /> : <MenuOpen />}
        </IconButton>

        <IconButton
          onClick={onClose}
          sx={{
            display: { xs: "inline-flex", md: "none" },
            color: theme.text,
          }}
          aria-label="Close sidebar"
        >
          <KeyboardDoubleArrowLeft />
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.75, pb: 2 }}>
        {MENU.map((section) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            {!collapsed && (
              <Typography
                sx={{ fontSize: 12, color: theme.muted, px: 1.5, mb: 1 }}
              >
                {section.title}
              </Typography>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.to === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);

              return (
                <Tooltip
                  key={item.to}
                  title={collapsed ? item.label : ""}
                  placement="right"
                  arrow
                >
                  <ButtonBase
                    component={Link}
                    to={item.to}
                    onClick={onClose}
                    sx={{
                      width: "100%",
                      height: 40,
                      px: 1.5,
                      mb: 0.5,
                      gap: 1.5,
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 1.5,
                      bgcolor: active ? theme.active : "transparent",
                      color: active ? "#FFFFFF" : theme.text,
                      "&:hover": {
                        bgcolor: active ? theme.active : theme.hover,
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />

                    {!collapsed && (
                      <Typography sx={{ fontSize: 14, color: "inherit" }}>
                        {item.label}
                      </Typography>
                    )}
                  </ButtonBase>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* User profile */}
      <Box sx={{ p: 1.75 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: collapsed ? "column" : "row",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Avatar
            src={user.avatar}
            sx={{ width: 34, height: 34, bgcolor: BROWN }}
          >
            {user.name?.[0]}
          </Avatar>

          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography noWrap sx={{ fontSize: 11, color: theme.muted }}>
                {user.email}
              </Typography>
            </Box>
          )}

          <Tooltip title="Logout" arrow>
            <IconButton
              onClick={onLogout}
              size="small"
              aria-label="Logout"
              sx={{ color: theme.text }}
            >
              <LogoutOutlined />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Your Shop */}
        <Tooltip title={collapsed ? "Your Shop" : ""} placement="right" arrow>
          <ButtonBase
            component={Link}
            to={shopUrl}
            sx={{
              width: "100%",
              height: 40,
              px: 1.5,
              justifyContent: collapsed ? "center" : "space-between",
              borderRadius: 1.5,
              border: `1px solid ${theme.border}`,
              boxShadow: darkMode ? "none" : "0 1px 6px rgba(0,0,0,.12)",
              color: theme.shopText,
              "&:hover": { bgcolor: theme.hover },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StorefrontOutlined />
              {!collapsed && (
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Your Shop
                </Typography>
              )}
            </Box>

            {!collapsed && <OpenInNew sx={{ fontSize: 16 }} />}
          </ButtonBase>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onClose = () => {},
  user,
  shopUrl = "/shop",
  onLogout,
  darkMode = false,
}) {
  const [collapsed, onToggle] = usePersistedCollapsed();

  const current = getCurrentUser();
  const profile = user || {
    name:
      `${current?.firstName ?? ""} ${current?.lastName ?? ""}`.trim() ||
      "Admin",
    email: current?.email || "",
    avatar: "",
  };

  const handleLogout =
    onLogout ||
    (() => {
      logoutUser(); // clears token + user from local and session storage
      window.location.href = "/login";
    });

  return (
    <>
      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: WIDTH,
            maxWidth: "85%",
            bgcolor: darkMode ? "#24211F" : "#FFFFFF",
          },
        }}
      >
        <SidebarContent
          user={profile}
          shopUrl={shopUrl}
          onLogout={handleLogout}
          onClose={onClose}
          collapsed={false}
          onToggle={onToggle}
          darkMode={darkMode}
        />
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? COLLAPSED_WIDTH : WIDTH,
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRight: `1px solid ${darkMode ? "#403832" : "#EEEEEE"}`,
          transition: "width 0.25s ease",
        }}
      >
        <SidebarContent
          user={profile}
          shopUrl={shopUrl}
          onLogout={handleLogout}
          onClose={onClose}
          collapsed={collapsed}
          onToggle={onToggle}
          darkMode={darkMode}
        />
      </Box>
    </>
  );
}
