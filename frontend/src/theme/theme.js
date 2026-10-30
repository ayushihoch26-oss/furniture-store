import { createTheme } from "@mui/material/styles";

const base = {
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    allVariants: { fontFamily: '"DM Sans", sans-serif' },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { fontFamily: '"DM Sans", sans-serif' } },
    },
  },
};

// Light theme = exactly what you had before
const theme = createTheme({
  ...base,
  palette: {
    primary: { main: "#947458", dark: "#7D6149" },
    text: { primary: "#111111" },
  },
});

// Used by ThemeModeProvider: "light" | "dark"
export const createAppTheme = (mode = "light") =>
  mode === "dark"
    ? createTheme({
        ...base,
        palette: {
          mode: "dark",
          primary: { main: "#947458", dark: "#7D6149" },
          text: { primary: "#F5F0EB", secondary: "#B8AAA0" },
          background: { default: "#1C1917", paper: "#292421" },
          divider: "#403832",
        },
      })
    : theme;

export default theme;
