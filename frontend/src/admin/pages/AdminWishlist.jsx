import { useState, useEffect } from "react";
import { Box, Typography, Button, Menu, MenuItem } from "@mui/material";

import {
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  DownloadOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";

import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import WishlistTable from "../components/wishlistTable";

const BROWN = "#947458";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

const WISHLISTS = [
  ["#WIS0001", "John Doe", "Wooden Sofa", "10", "Sofa", "01-10-2026", "12999"],
  [
    "#WIS0002",
    "Jane Smith",
    "Dining Table",
    "10",
    "Table",
    "02-10-2026",
    "8999",
  ],
  ["#WIS0003", "Emily Davis", "King Bed", "10", "Bed", "03-10-2026", "24999"],
  [
    "#WIS0004",
    "Michael Brown",
    "Office Chair",
    "10",
    "Chair",
    "04-10-2026",
    "4999",
  ],
  [
    "#WIS0005",
    "Sarah Wilson",
    "Bookshelf",
    "10",
    "Storage",
    "05-10-2026",
    "6999",
  ],
  [
    "#WIS0006",
    "David Miller",
    "Coffee Table",
    "10",
    "Table",
    "06-10-2026",
    "3999",
  ],
  [
    "#WIS0007",
    "Olivia Taylor",
    "Wardrobe",
    "10",
    "Storage",
    "07-10-2026",
    "18999",
  ],
  [
    "#WIS0008",
    "James Anderson",
    "TV Unit",
    "10",
    "TV Unit",
    "08-10-2026",
    "7999",
  ],
  [
    "#WIS0009",
    "Sophia Thomas",
    "Lounge Chair",
    "10",
    "Chair",
    "09-10-2026",
    "5999",
  ],
  [
    "#WIS0010",
    "Daniel Moore",
    "Bedside Table",
    "10",
    "Table",
    "10-10-2026",
    "2999",
  ],
];

function Card({ children, sx, darkMode = false }) {
  return (
    <Box
      sx={{
        bgcolor: darkMode ? "#292421" : "#FFFFFF",
        color: darkMode ? "#F5F0EB" : "#222222",
        border: `1px solid ${darkMode ? "#403832" : "#EEEEEE"}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,.25)"
          : "0 1px 4px rgba(0,0,0,.06)",
        transition: "background-color 0.25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function WishlistStatCard({ title, value, change, up, darkMode = false }) {
  const color = up === false ? RED : GREEN;

  return (
    <Card
      darkMode={darkMode}
      sx={{
        borderRadius: "12px",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,.35)"
            : "0 10px 25px rgba(15,23,42,.15)",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: darkMode ? "#F5F0EB" : "#0F172A",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1.5,
          fontSize: 28,
          fontWeight: 800,
          color: darkMode ? "#D8B89A" : BROWN,
        }}
      >
        {value}
      </Typography>

      <Typography sx={{ fontSize: 12, color, mt: 0.5 }}>
        {up === true && (
          <ArrowUpward sx={{ fontSize: 14, verticalAlign: "middle" }} />
        )}
        {up === false && (
          <ArrowDownward sx={{ fontSize: 14, verticalAlign: "middle" }} />
        )}{" "}
        {change}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          color: darkMode ? "#B8AAA0" : "#777",
          mt: 1,
        }}
      >
        Wishlist overview
      </Typography>
    </Card>
  );
}

export default function AdminWishlist() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [wishlists, setWishlists] = useState(WISHLISTS);
  const [moreAnchor, setMoreAnchor] = useState(null);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const theme = {
    page: darkMode ? "#1C1917" : BG,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
  };

  const openMore = (event) => setMoreAnchor(event.currentTarget);
  const closeMore = () => setMoreAnchor(null);

  const exportWishlists = () => {
    const data =
      selected.length > 0
        ? wishlists.filter((item) => selected.includes(item[0]))
        : wishlists;

    if (!data.length) {
      alert("No wishlist records to export");
      return;
    }

    const headers = [
      "Wishlist ID",
      "Customer",
      "Product",
      "Category",
      "Added Date",
      "Price",
    ];

    const csv = [headers, ...data]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "wishlist-records.csv";
    link.click();

    URL.revokeObjectURL(url);
    closeMore();
  };

  const deleteSelected = () => {
    if (!selected.length) {
      alert("Please select at least one wishlist item");
      closeMore();
      return;
    }

    if (
      !window.confirm(`Delete ${selected.length} selected wishlist item(s)?`)
    ) {
      closeMore();
      return;
    }

    setWishlists((previous) =>
      previous.filter((item) => !selected.includes(item[0])),
    );
    setSelected([]);
    setPage(1);
    closeMore();
  };

  const stats = [
    {
      title: "Total Wishlist Items",
      value: wishlists.length,
      change: "All saved items",
    },
    {
      title: "Customers",
      value: new Set(wishlists.map((item) => item[1])).size,
      change: "Customers with saved items",
    },
    {
      title: "Total Products Value",
      value:
        "₹" +
        wishlists
          .reduce((sum, item) => sum + Number(item[5]), 0)
          .toLocaleString("en-IN"),
      change: "Combined product value",
    },
    {
      title: "Product Categories",
      value: new Set(wishlists.map((item) => item[3])).size,
      change: "Categories in wishlist",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.page,
        color: theme.text,
        transition: "background-color 0.25s ease",
      }}
    >
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((previous) => !previous)}
        darkMode={darkMode}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Navbar
          title="Wishlist"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode((previous) => !previous)}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FavoriteBorderOutlinedIcon sx={{ color: BROWN, fontSize: 28 }} />
              <Typography
                sx={{ fontSize: 22, fontWeight: 700, color: theme.text }}
              >
                Wishlist List
              </Typography>
            </Box>

            <Button
              variant="outlined"
              endIcon={<MoreVert />}
              onClick={openMore}
              sx={{
                height: 40,
                px: 2.5,
                bgcolor: theme.card,
                color: theme.text,
                borderColor: theme.border,
                textTransform: "none",
                "&:hover": {
                  borderColor: BROWN,
                  bgcolor: theme.soft,
                },
              }}
            >
              More Action
            </Button>

            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={closeMore}
              PaperProps={{
                sx: {
                  bgcolor: theme.card,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                },
              }}
            >
              <MenuItem onClick={exportWishlists}>
                <DownloadOutlined sx={{ mr: 1.5 }} />
                Export Wishlists
              </MenuItem>

              <MenuItem
                disabled={selected.length === 0}
                onClick={deleteSelected}
              >
                <DeleteOutlineOutlined sx={{ mr: 1.5 }} />
                Delete Selected
              </MenuItem>
            </Menu>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {stats.map((stat) => (
              <WishlistStatCard
                key={stat.title}
                {...stat}
                darkMode={darkMode}
              />
            ))}
          </Box>

          <WishlistTable
            wishlists={wishlists}
            setWishlists={setWishlists}
            selected={selected}
            setSelected={setSelected}
            page={page}
            setPage={setPage}
            darkMode={darkMode}
          />
        </Box>
      </Box>
    </Box>
  );
}
