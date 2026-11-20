import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import { logoutUser } from "../../auth/services/login.service";
import profileService, { formatProfile } from "../services/profile.service";
import AccountPanel from "../components/AccountPanel";
import OrdersPanel from "../components/OrdersPanel";
import AddressesPanel from "../components/AddressesPanel";
import SecurityPanel from "../components/SecurityPanel";
import {
  BROWN,
  LIGHT_BG,
  SIDE,
  brownBtn,
  outlineBtn,
} from "../profileStyles";
import { TABS, PROFILE_KEY } from "../utils/profileUtils";

const EMPTY_PROFILE = formatProfile();

export default function ProfilePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const initials =
    `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() ||
    "U";

  function showMessage(message) {
    setToast({
      open: true,
      msg: message,
    });
  }

  useEffect(() => {
    let isComponentActive = true;

    async function loadProfile() {
      try {
        const user = await profileService.getMyProfile();

        if (isComponentActive) {
          setProfile(formatProfile(user));
        }
      } catch (error) {
        if (isComponentActive) {
          showMessage(error.message || "Failed to load profile");
        }
      } finally {
        if (isComponentActive) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isComponentActive = false;
    };
  }, []);

  function handleLogout() {
    setLogoutDialogOpen(false);
    logoutUser();
    navigate("/Dashboard", { replace: true });
  }

  async function saveProfile(profileData) {
    try {
      const updatedProfile =
        await profileService.updateMyProfile(profileData);

      setProfile(updatedProfile);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      showMessage("Profile updated");
    } catch (error) {
      showMessage(error.message || "Failed to update profile");
    }
  }

  async function saveAddress(addressData) {
    try {
      const nameParts = String(addressData.fullName)
        .trim()
        .split(/\s+/);

      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || profile.lastName;

      const updatedProfile = await profileService.updateMyProfile({
        ...profile,
        firstName,
        lastName,
        phone: addressData.phone,
        street: addressData.line1,
        apartment: addressData.apartment || "",
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        country: addressData.country,
      });

      setProfile(updatedProfile);

      if (profile.street) {
        showMessage("Address updated");
      } else {
        showMessage("Address added");
      }

      return true;
    } catch (error) {
      showMessage(error.message || "Failed to save address");
      return false;
    }
  }

  async function removeAddress() {
    try {
      const updatedProfile = await profileService.updateMyProfile({
        ...profile,
        street: "",
        apartment: "",
        city: "",
        state: "",
        zip: "",
      });

      setProfile(updatedProfile);
      showMessage("Address removed");
    } catch (error) {
      showMessage(error.message || "Failed to remove address");
    }
  }

  function selectTab(tabId) {
    setActiveTab(tabId);
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
      }}
    >
      <Navbar />

      <Box
        sx={{
          bgcolor: LIGHT_BG,
          px: SIDE,
          py: { xs: 4, md: 5, lg: 7 },
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 28, md: 34, lg: 40 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: 1.2,
          }}
        >
          My Account
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1,
            fontSize: { xs: 12, lg: 14 },
            color: "var(--c-777777)",
          }}
        >
          <Box
            component={Link}
            to="/Dashboard"
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover": { color: BROWN },
            }}
          >
            Home
          </Box>
          /<Box sx={{ color: "var(--c-111111)" }}>My Account</Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: SIDE,
          py: { xs: 3, md: "48px", lg: "72px" },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "260px minmax(0, 1fr)",
            lg: "320px minmax(0, 1fr)",
          },
          columnGap: { md: "32px", lg: "64px" },
          rowGap: 3,
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: LIGHT_BG,
              p: { xs: 2, lg: 3 },
              mb: { xs: 2, md: 2.5 },
            }}
          >
            <Box
              sx={{
                width: { xs: 52, lg: 64 },
                height: { xs: 52, lg: 64 },
                borderRadius: "50%",
                bgcolor: BROWN,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: { xs: 18, lg: 22 },
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: { xs: 16, lg: 18 }, fontWeight: 600 }}
                noWrap
              >
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: "var(--c-777777)" }}
                noWrap
              >
                {profile.email}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {TABS.map((tab) => (
              <ButtonBase
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                ref={(element) => {
                  if (element && activeTab === tab.id) {
                    element.scrollIntoView({
                      inline: "center",
                      block: "nearest",
                      behavior: "smooth",
                    });
                  }
                }}
                sx={{
                  flexShrink: 0,
                  px: 2,
                  height: 38,
                  fontSize: 13.5,
                  border: `1px solid ${
                    activeTab === tab.id ? BROWN : "var(--c-d9d4cf)"
                  }`,
                  bgcolor: activeTab === tab.id ? BROWN : "var(--c-ffffff)",
                  color:
                    activeTab === tab.id ? "#fff" : "var(--c-333333)",
                }}
              >
                {tab.label}
              </ButtonBase>
            ))}
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              border: "1px solid var(--c-e5e0db)",
            }}
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;

              return (
                <ButtonBase
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  sx={{
                    justifyContent: "flex-start",
                    gap: 1.5,
                    px: 2.5,
                    py: { md: "13px", lg: "16px" },
                    fontSize: { md: 14, lg: 16 },
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? BROWN : "var(--c-222222)",
                    bgcolor: isSelected
                      ? "var(--c-fbf8f5)"
                      : "var(--c-ffffff)",
                    borderLeft: `3px solid ${
                      isSelected ? BROWN : "transparent"
                    }`,
                    borderBottom: "1px solid var(--c-eeeeee)",
                    "&:hover": { bgcolor: "var(--c-fbf8f5)" },
                  }}
                >
                  <tab.Icon sx={{ fontSize: 20 }} />
                  {tab.label}
                </ButtonBase>
              );
            })}

            <ButtonBase
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                justifyContent: "flex-start",
                gap: 1.5,
                px: 2.5,
                py: { md: "13px", lg: "16px" },
                fontSize: { md: 14, lg: 16 },
                color: "#c62828",
                borderLeft: "3px solid transparent",
                "&:hover": { bgcolor: "#FDECEA" },
              }}
            >
              <LogoutOutlined sx={{ fontSize: 20 }} />
              Log out
            </ButtonBase>
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          {activeTab === "account" &&
            (profileLoading ? (
              <Typography>Loading account details...</Typography>
            ) : (
              <AccountPanel
                key={JSON.stringify(profile)}
                profile={profile}
                onSave={saveProfile}
              />
            ))}

          {activeTab === "orders" && <OrdersPanel />}

          {activeTab === "addresses" && (
            <AddressesPanel
              profile={profile}
              onSave={saveAddress}
              onClear={removeAddress}
            />
          )}

          {activeTab === "security" && <SecurityPanel notify={showMessage} />}

          <Button
            startIcon={<LogoutOutlined />}
            onClick={() => setLogoutDialogOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mt: 4,
              color: "#c62828",
              textTransform: "none",
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      <Footer />

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Log out?</DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
            You will need to sign in again to see your account.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            sx={outlineBtn}
          >
            Cancel
          </Button>
          <Button onClick={handleLogout} sx={brownBtn}>
            Log out
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() =>
          setToast((currentToast) => ({
            ...currentToast,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() =>
            setToast((currentToast) => ({
              ...currentToast,
              open: false,
            }))
          }
          sx={{ borderRadius: 0, bgcolor: BROWN }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
