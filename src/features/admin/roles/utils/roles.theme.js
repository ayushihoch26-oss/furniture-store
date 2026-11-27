import { BG, BROWN, BROWN_LIGHT } from "../constants/roles.constants";

export const DEFAULT_THEME = {
  input: "#F7F7F7",
  text: "#222222",
  muted: "#777777",
  border: "#E8EDF3",
};

// Light values are the original hardcoded colors, so light mode is unchanged.
export const getRolesTheme = (darkMode) => ({
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
});

// Labels had no theme before: only switch them in dark mode so their
// light color (#0F172A) stays exactly the same.
export const getLabelTheme = (darkMode, theme) => (darkMode ? theme : undefined);

// Dropdown menus use MUI's default light paper, so match the theme in dark.
export const getMenuProps = (darkMode, theme) =>
  darkMode
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

export const getInputSx = (theme = DEFAULT_THEME) => ({
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

export const getOutlineButtonSx = (theme) => ({
  color: theme.buttonText,
  borderColor: theme.border,
  textTransform: "none",
  "&:hover": { borderColor: BROWN, bgcolor: theme.soft },
});
