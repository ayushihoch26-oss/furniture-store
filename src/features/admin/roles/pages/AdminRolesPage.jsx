import { useMemo, useState } from "react";
import { Alert, Box, Snackbar, Typography } from "@mui/material";

import Navbar from "../../layout/AdminNavbar";
import Sidebar from "../../layout/AdminSidebar";
import ProfileCard from "../components/ProfileCard";
import ChangePasswordCard from "../components/ChangePasswordCard";
import ProfileUpdateCard from "../components/ProfileUpdateCard";
import { TOAST_DURATION_MS } from "../constants/roles.constants";
import useDarkMode from "../hooks/useDarkMode";
import useToast from "../hooks/useToast";
import useProfile from "../hooks/useProfile";
import usePasswordChange from "../hooks/usePasswordChange";
import {
  getLabelTheme,
  getMenuProps,
  getRolesTheme,
} from "../utils/roles.theme";

export default function AdminRole() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { darkMode, toggleDarkMode } = useDarkMode();
  const { toast, showToast, clearToast } = useToast();

  const profileState = useProfile({ showToast });
  const passwordChange = usePasswordChange({ showToast });

  const theme = useMemo(() => getRolesTheme(darkMode), [darkMode]);
  const labelTheme = getLabelTheme(darkMode, theme);
  const menuProps = getMenuProps(darkMode, theme);

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
          title="Admin role"
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onThemeToggle={toggleDarkMode}
        />

        <Box sx={{ p: { xs: 2, sm: 3, md: 2 }, display: "grid", gap: 2.5 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
            About section
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              alignItems: "start",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1fr) minmax(0, 1.6fr)",
              },
            }}
          >
            {/* ===== LEFT COLUMN ===== */}
            <Box sx={{ display: "grid", gap: 2.5, minWidth: 0 }}>
              <ProfileCard
                profile={profileState.profile}
                theme={theme}
                darkMode={darkMode}
                onEdit={profileState.startEdit}
                onShare={profileState.copyEmail}
              />

              <ChangePasswordCard
                passwordChange={passwordChange}
                theme={theme}
                labelTheme={labelTheme}
                darkMode={darkMode}
              />
            </Box>

            {/* ===== RIGHT COLUMN ===== */}
            <ProfileUpdateCard
              profileState={profileState}
              theme={theme}
              labelTheme={labelTheme}
              darkMode={darkMode}
              menuProps={menuProps}
            />
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={TOAST_DURATION_MS}
        onClose={clearToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={clearToast}>
            {toast.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
