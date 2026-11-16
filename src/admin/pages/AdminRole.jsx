import { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  EditOutlined,
  ShareOutlined,
  Visibility,
  VisibilityOff,
  AddPhotoAlternateOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import adminProfileService, {
  getErrorMessage,
} from "../service/Adminprofile.service";

// ---------- Colors (same as Dashboard / Products / Reviews) ----------
const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const RED = "#E5484D";

// ---------- Static data ----------
const COUNTRY_CODES = ["+1", "+44", "+61", "+91"];

const CARDS = ["843-4359-4444", "512-7788-1020", "309-4412-9087"];

const BIO_LIMIT = 250;

// Empty until the real profile is loaded from the backend
const INITIAL_PROFILE = {
  image: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "**********",
  countryCode: "+1",
  phone: "",
  birthDate: "", // YYYY-MM-DD (date input format)
  location: "",
  card: CARDS[0],
  bio: "",
};

const EMPTY_PASSWORDS = { current: "", next: "", repeat: "" };

// ---------- Reusable pieces ----------
function Card({ children, sx, theme, darkMode }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,.25)"
          : "0 1px 4px rgba(0,0,0,.06)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function FieldLabel({ children, theme }) {
  return (
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: 600,
        mb: 0.75,
        color: theme?.text || "#0F172A",
      }}
    >
      {children}
    </Typography>
  );
}

const DEFAULT_THEME = {
  input: "#F7F7F7",
  text: "#222222",
  muted: "#777777",
  border: "#E8EDF3",
};

const getInputSx = (theme = DEFAULT_THEME) => ({
  "& .MuiOutlinedInput-root": {
    bgcolor: theme.input,
    color: theme.text,
    borderRadius: 2,
    fontSize: 14,
    "& fieldset": { borderColor: theme.border },
    "&:hover fieldset": { borderColor: BROWN },
    "&.Mui-focused fieldset": { borderColor: BROWN },
    // MUI's default disabled outline is dark grey, so match the theme in dark mode
    ...(theme.dark && {
      "&.Mui-disabled fieldset": { borderColor: theme.border },
    }),
  },
  "& .MuiInputBase-input": {
    color: theme.text,
    ...(theme.dark && { colorScheme: "dark" }),
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: theme.muted,
  },
  "& .MuiInputLabel-root": { color: theme.muted },
  "& .MuiFormHelperText-root": { color: theme.muted },
  "& .MuiSvgIcon-root": { color: theme.muted },
});

// password box with show / hide eye
function PasswordField({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  helperText,
  theme = DEFAULT_THEME,
}) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      fullWidth
      size="small"
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      helperText={helperText}
      sx={getInputSx(theme)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setShow((previous) => !previous)}
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? (
                <Visibility fontSize="small" />
              ) : (
                <VisibilityOff fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

// profile picture, or a person icon when there is no image
function ProfileAvatar({ src, size, theme }) {
  return (
    <Avatar
      src={src || undefined}
      sx={{
        width: size,
        height: size,
        bgcolor: theme.avatarBg,
        color: BROWN,
      }}
    >
      <PersonOutlinedIcon sx={{ fontSize: size * 0.55 }} />
    </Avatar>
  );
}

// ---------- Page ----------
export default function AdminRole() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // saved profile + the copy being edited
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  // Light values are the original hardcoded colors, so light mode is unchanged.
  const theme = {
    dark: darkMode,
    page: darkMode ? "#1C1917" : BG,
    card: darkMode ? "#292421" : "#FFFFFF",
    text: darkMode ? "#F5F0EB" : "#222222",
    muted: darkMode ? "#B8AAA0" : "#777777",
    border: darkMode ? "#403832" : "#E8EDF3",
    input: darkMode ? "#332D28" : BG,
    hover: darkMode ? "#39312B" : "#F3ECE5",
    email: darkMode ? "#B8AAA0" : "#666",
    subtle: darkMode ? "#B8AAA0" : "#555",
    unlinked: darkMode ? "#B8AAA0" : "#888",
    avatarBg: darkMode ? "#403832" : BROWN_LIGHT,
    soft: darkMode ? "#332D28" : BG,
    buttonText: darkMode ? "#F5F0EB" : "#222",
    dangerHover: darkMode ? "rgba(229,72,77,.15)" : "#FDECEC",
  };

  // For labels that had no theme before: only switch them in dark mode so
  // their light color (#0F172A) stays exactly the same.
  const labelTheme = darkMode ? theme : undefined;

  // dropdown menus use MUI's default light paper, so match the theme in dark
  const menuProps = darkMode
    ? {
        slotProps: {
          paper: {
            sx: {
              bgcolor: theme.card,
              color: theme.text,
              backgroundImage: "none",
            },
          },
        },
      }
    : undefined;

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [toast, setToast] = useState(null); // { severity, text }

  const showToast = (text, severity = "success") =>
    setToast({ severity, text });

  // Put what the backend sent into the page state
  const applyProfile = (data) => {
    setProfile(data);
    setDraft(data);
  };

  // Load the profile when the page opens
  useEffect(() => {
    let cancelled = false;

    adminProfileService
      .getProfile()
      .then((data) => {
        if (!cancelled) applyProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setToast({
            severity: "error",
            text: getErrorMessage(err, "Could not load profile"),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ----- profile update -----
  const updateDraft = (field, value) =>
    setDraft((previous) => ({ ...previous, [field]: value }));

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const draftInvalid =
    !draft.firstName.trim() ||
    !draft.lastName.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email);

  const saveProfile = async () => {
    if (draftInvalid) return;

    try {
      const data = await adminProfileService.updateProfile(draft);
      applyProfile(data);
      setEditing(false);
      showToast("Profile updated");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not update profile"), "error");
    }
  };

  // upload the chosen image to the backend (it is saved straight away)
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets you choose the same file again
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2 MB", "error");
      return;
    }

    try {
      const data = await adminProfileService.uploadImage(file);
      // only the picture changes, so unsaved edits in the form are kept
      setProfile((previous) => ({ ...previous, image: data.image }));
      setDraft((previous) => ({ ...previous, image: data.image }));
      showToast("Profile photo updated");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not upload photo"), "error");
    }
  };

  const deleteImage = async () => {
    try {
      await adminProfileService.deleteImage();
      setProfile((previous) => ({ ...previous, image: "" }));
      setDraft((previous) => ({ ...previous, image: "" }));
      showToast("Profile photo removed");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not remove photo"), "error");
    }
  };

  // link / unlink a social account

  // ----- copy email -----
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      showToast("Email copied");
    } catch {
      showToast("Could not copy email", "error");
    }
  };

  // ----- change password -----
  const updatePassword = (field, value) =>
    setPasswords((previous) => ({ ...previous, [field]: value }));

  const passwordErrors = {
    current: passwords.current ? "" : "Enter your current password",
    next:
      passwords.next.length >= 8
        ? ""
        : "New password must be at least 8 characters",
    repeat: passwords.repeat === passwords.next ? "" : "Passwords do not match",
  };

  const savePassword = async () => {
    setPasswordTouched(true);

    if (Object.values(passwordErrors).some(Boolean)) return;

    try {
      await adminProfileService.changePassword(passwords);
      setPasswords(EMPTY_PASSWORDS);
      setPasswordTouched(false);
      showToast("Password changed");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not change password"), "error");
    }
  };

  const showError = (field) =>
    passwordTouched && Boolean(passwordErrors[field]);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  const outlineButtonSx = {
    color: theme.buttonText,
    borderColor: theme.border,
    textTransform: "none",
    "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
  };

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
          onThemeToggle={() => setDarkMode((previous) => !previous)}
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
              {/* ----- Profile card ----- */}
              <Card theme={theme} darkMode={darkMode} sx={{ pb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                    Profile
                  </Typography>

                  <Box>
                    <IconButton
                      size="small"
                      title="Edit profile"
                      onClick={startEdit}
                      sx={{ color: BROWN }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Share"
                      onClick={copyEmail}
                      sx={{ color: BROWN }}
                    >
                      <ShareOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    mt: 1,
                  }}
                >
                  <ProfileAvatar src={profile.image} size={96} theme={theme} />

                  <Typography sx={{ fontSize: 18, fontWeight: 700, mt: 1.5 }}>
                    {fullName}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography sx={{ fontSize: 13, color: theme.email }}>
                      {profile.email}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  ></Box>
                </Box>
              </Card>

              {/* ----- Change password card ----- */}
              <Card theme={theme} darkMode={darkMode}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                    Change Password
                  </Typography>

                  <Button
                    size="small"
                    endIcon={<HelpOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: BROWN,
                      textTransform: "none",
                      textDecoration: "underline",
                    }}
                  >
                    Need help
                  </Button>
                </Box>

                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box>
                    <FieldLabel theme={labelTheme}>Current Password</FieldLabel>
                    <PasswordField
                      placeholder="Enter password"
                      value={passwords.current}
                      onChange={(e) =>
                        updatePassword("current", e.target.value)
                      }
                      error={showError("current")}
                      helperText={
                        showError("current") ? passwordErrors.current : ""
                      }
                      theme={theme}
                    />
                    <Button
                      size="small"
                      sx={{
                        mt: 0.5,
                        px: 0,
                        color: BROWN,
                        textTransform: "none",
                        fontSize: 12,
                      }}
                    >
                      Forgot Current Password? Click here
                    </Button>
                  </Box>

                  <Box>
                    <FieldLabel theme={labelTheme}>New Password</FieldLabel>
                    <PasswordField
                      placeholder="Enter password"
                      value={passwords.next}
                      onChange={(e) => updatePassword("next", e.target.value)}
                      error={showError("next")}
                      helperText={showError("next") ? passwordErrors.next : ""}
                      theme={theme}
                    />
                  </Box>

                  <Box>
                    <FieldLabel theme={labelTheme}>
                      Re-enter Password
                    </FieldLabel>
                    <PasswordField
                      placeholder="Enter password"
                      value={passwords.repeat}
                      onChange={(e) => updatePassword("repeat", e.target.value)}
                      error={showError("repeat")}
                      helperText={
                        showError("repeat") ? passwordErrors.repeat : ""
                      }
                      theme={theme}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={savePassword}
                    sx={{
                      height: 44,
                      mt: 1,
                      bgcolor: BROWN,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { bgcolor: BROWN_DARK },
                    }}
                  >
                    Save Change
                  </Button>
                </Box>
              </Card>
            </Box>

            {/* ===== RIGHT COLUMN: PROFILE UPDATE ===== */}
            <Card
              theme={theme}
              darkMode={darkMode}
              sx={{ p: { xs: 2, sm: 3 } }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                  Profile Update
                </Typography>

                {editing ? (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloseOutlined />}
                      onClick={cancelEdit}
                      sx={{ height: 36, ...outlineButtonSx }}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      disableElevation
                      startIcon={<SaveOutlined />}
                      disabled={draftInvalid}
                      onClick={saveProfile}
                      sx={{
                        height: 36,
                        bgcolor: BROWN,
                        textTransform: "none",
                        "&:hover": { bgcolor: BROWN_DARK },
                        ...(darkMode && {
                          "&.Mui-disabled": {
                            bgcolor: theme.border,
                            color: theme.muted,
                          },
                        }),
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlined />}
                    onClick={startEdit}
                    sx={{ height: 36, ...outlineButtonSx }}
                  >
                    Edit
                  </Button>
                )}
              </Box>

              {/* Photo upload */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  mb: 3,
                }}
              >
                <ProfileAvatar src={profile.image} size={64} theme={theme} />

                <Button
                  component="label"
                  variant="contained"
                  disableElevation
                  startIcon={<AddPhotoAlternateOutlined />}
                  sx={{
                    height: 40,
                    bgcolor: BROWN,
                    textTransform: "none",
                    "&:hover": { bgcolor: BROWN_DARK },
                  }}
                >
                  Upload New
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DeleteOutlined />}
                  disabled={!profile.image}
                  onClick={deleteImage}
                  sx={{
                    height: 40,
                    color: RED,
                    borderColor: theme.border,
                    textTransform: "none",
                    "&:hover": { borderColor: RED, bgcolor: theme.dangerHover },
                    ...(darkMode && {
                      "&.Mui-disabled": {
                        color: theme.muted,
                        borderColor: theme.border,
                        opacity: 0.6,
                      },
                    }),
                  }}
                >
                  Delete
                </Button>

                <Typography sx={{ fontSize: 11, color: theme.muted }}>
                  PNG or JPG, up to 2 MB
                </Typography>
              </Box>

              {/* Form */}
              <Box
                sx={{
                  display: "grid",
                  gap: 2.5,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                <Box>
                  <FieldLabel theme={theme}>First Name</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={draft.firstName}
                    disabled={!editing}
                    error={editing && !draft.firstName.trim()}
                    onChange={(e) => updateDraft("firstName", e.target.value)}
                    sx={getInputSx(theme)}
                  />
                </Box>

                <Box>
                  <FieldLabel theme={theme}>Last Name</FieldLabel>

                  <TextField
                    fullWidth
                    size="small"
                    value={draft.lastName}
                    disabled={!editing}
                    error={editing && !draft.lastName.trim()}
                    onChange={(e) => updateDraft("lastName", e.target.value)}
                    sx={getInputSx(theme)}
                  />
                </Box>

                <Box>
                  <FieldLabel theme={theme}>Password</FieldLabel>
                  <PasswordField
                    value={draft.password}
                    disabled
                    onChange={() => {}}
                    theme={theme}
                  />
                </Box>

                <Box>
                  <FieldLabel theme={theme}>Phone Number</FieldLabel>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      select
                      size="small"
                      value={draft.countryCode}
                      disabled={!editing}
                      onChange={(e) =>
                        updateDraft("countryCode", e.target.value)
                      }
                      slotProps={{ select: { MenuProps: menuProps } }}
                      sx={{ ...getInputSx(theme), width: 96, flexShrink: 0 }}
                    >
                      {COUNTRY_CODES.map((code) => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      size="small"
                      value={draft.phone}
                      disabled={!editing}
                      onChange={(e) => updateDraft("phone", e.target.value)}
                      sx={getInputSx(theme)}
                    />
                  </Box>
                </Box>

                <Box>
                  <FieldLabel theme={labelTheme}>E-mail</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={draft.email}
                    disabled={!editing}
                    error={
                      editing &&
                      draftInvalid &&
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
                    }
                    helperText={
                      editing && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
                        ? "Enter a valid email"
                        : ""
                    }
                    onChange={(e) => updateDraft("email", e.target.value)}
                    sx={getInputSx(theme)}
                  />
                </Box>

                <Box>
                  <FieldLabel theme={labelTheme}>Date of Birth</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={draft.birthDate}
                    disabled={!editing}
                    onChange={(e) => updateDraft("birthDate", e.target.value)}
                    sx={getInputSx(theme)}
                  />
                </Box>

                <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                  <FieldLabel theme={labelTheme}>Location</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={draft.location}
                    disabled={!editing}
                    onChange={(e) => updateDraft("location", e.target.value)}
                    sx={getInputSx(theme)}
                  />
                </Box>

                <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                  <FieldLabel theme={labelTheme}>Credit Card</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={draft.card}
                    disabled={!editing}
                    onChange={(e) => updateDraft("card", e.target.value)}
                    slotProps={{ select: { MenuProps: menuProps } }}
                    sx={getInputSx(theme)}
                  >
                    {CARDS.map((number) => (
                      <MenuItem key={number} value={number}>
                        {number}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                  <FieldLabel theme={labelTheme}>Biography</FieldLabel>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="Enter a biography about you"
                    value={draft.bio}
                    disabled={!editing}
                    inputProps={{ maxLength: BIO_LIMIT }}
                    helperText={
                      editing ? `${draft.bio.length}/${BIO_LIMIT}` : ""
                    }
                    onChange={(e) => updateDraft("bio", e.target.value)}
                    sx={getInputSx(theme)}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast(null)}
          >
            {toast.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
