  import { useState } from "react";
  import {
    Box,
    Typography,
    Avatar,
    InputBase,
    IconButton,
    Badge,
    Tooltip,
  } from "@mui/material";

  import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
  import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
  import MenuIcon from "@mui/icons-material/Menu";
  import DarkModeIcon from "@mui/icons-material/DarkMode";
  import LightModeIcon from "@mui/icons-material/LightMode";

  function Navbar({
    title = "Dashboard",
    avatarSrc = "",
    hasNotification = true,
    onSearch,
    onMenuClick,
    darkMode = false,
    onThemeToggle,
  }) {
    const [query, setQuery] = useState("");

    const handleSearch = (e) => {
      e.preventDefault();

      const searchText = query.trim();

      if (!searchText) {
        setQuery("");
        onSearch?.("");
        return;
      }

      onSearch?.(searchText);
    };

    const handleSearchChange = (e) => {
      setQuery(e.target.value);
    };

    const handleClearSearch = () => {
      setQuery("");
      onSearch?.("");
    };

    const BG = darkMode ? "#1a1715" : "#F4F3F1";
    const TITLE = darkMode ? "#D8B89A" : "#7D524A";
    const TEXT = darkMode ? "#F5F0EB" : "#222222";
    const SEARCH_BG = darkMode ? "#292421" : "#FFFFFF";
    const SECONDARY = darkMode ? "#B8AAA0" : "#6B6B6B";
    const BORDER = darkMode ? "#494038" : "#E5E1DD";

    return (
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          width: "100%",
          minHeight: { xs: 64, md: 82 },
          bgcolor: BG,
          color: TEXT,
          borderBottom: `1px solid ${BORDER}`,
          boxSizing: "border-box",
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          py: { xs: "10px", md: 0 },
          display: "grid",
          alignItems: "center",
          columnGap: { xs: 2, md: "24px" },
          rowGap: "10px",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr) auto",
            md: "minmax(0, 1fr) minmax(240px, 420px) auto",
          },
          gridTemplateAreas: {
            xs: `"title actions" "search search"`,
            md: `"title search actions"`,
          },
          transition: "background-color 0.25s, color 0.25s",
        }}
      >
        {/* Menu and title */}
        <Box
          sx={{
            gridArea: "title",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <IconButton
            onClick={onMenuClick}
            aria-label="Open menu"
            edge="start"
            size="small"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: TEXT,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            noWrap
            component="div"
            sx={{
              fontSize: { xs: 18, md: 20 },
              fontWeight: 700,
              color: TITLE,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Search */}
        <Box
          component="form"
          onSubmit={handleSearch}
          role="search"
          sx={{
            gridArea: "search",
            display: "flex",
            alignItems: "center",
            width: "100%",
            minWidth: 0,
            height: { xs: 42, md: 46 },
            px: 2,
            bgcolor: SEARCH_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: "999px",
            boxSizing: "border-box",
          }}
        >
          <InputBase
            value={query}
            onChange={handleSearchChange}
            placeholder="Search data, users, or reports"
            inputProps={{
              "aria-label": "Search",
            }}
            sx={{
              flex: "1 1 0%",
              minWidth: 0,
              color: TEXT,
              "& .MuiInputBase-input": {
                p: 0,
                fontSize: 14,
                textOverflow: "ellipsis",
              },
              "& .MuiInputBase-input::placeholder": {
                color: SECONDARY,
                opacity: 1,
              },
            }}
          />

          {query && (
            <IconButton
              type="button"
              aria-label="Clear search"
              size="small"
              onClick={handleClearSearch}
              sx={{
                color: SECONDARY,
                flexShrink: 0,
                ml: 0.5,
                fontSize: 18,
              }}
            >
              ×
            </IconButton>
          )}

          <IconButton
            type="submit"
            aria-label="Search"
            size="small"
            sx={{ color: TEXT, flexShrink: 0, ml: 0.5 }}
          >
            <SearchOutlinedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>

        {/* Theme toggle, notifications and avatar */}
        <Box
          sx={{
            gridArea: "actions",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: { xs: "8px", md: "14px" },
          }}
        >
          <Tooltip
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <IconButton
              onClick={onThemeToggle}
              aria-label="Toggle theme"
              size="small"
              sx={{
                color: darkMode ? "#F5C451" : "#7D524A",
                bgcolor: darkMode ? "#393027" : "#EAE3DD",
                "&:hover": {
                  bgcolor: darkMode ? "#514033" : "#DED3C9",
                },
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <IconButton
            aria-label="Notifications"
            size="small"
            sx={{ color: TEXT, p: 0.5 }}
          >
            <Badge
              variant="dot"
              invisible={!hasNotification}
              sx={{
                "& .MuiBadge-dot": {
                  bgcolor: "#FF3B30",
                  width: 7,
                  height: 7,
                  minWidth: 7,
                  top: 3,
                  right: 3,
                },
              }}
            >
              <NotificationsNoneIcon sx={{ fontSize: 24 }} />
            </Badge>
          </IconButton>

          <Avatar
            src={avatarSrc}
            alt="Profile"
            sx={{
              width: { xs: 34, md: 40 },
              height: { xs: 34, md: 40 },
            }}
          />
        </Box>
      </Box>
    );
  }

  export default Navbar;
