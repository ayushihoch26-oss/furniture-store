import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "@mui/material/styles";

import { createAppTheme } from "./theme";
import { PALETTE, DARK_PAGE } from "./palette";
import { ThemeModeContext } from "./ThemeModeContext";

// Same key the admin pages use, so the whole app shares one choice.
const STORAGE_KEY = "admin-dark-mode";

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

// Must be rendered INSIDE <BrowserRouter> (it re-reads the saved mode on navigation,
// so switching theme in the admin area is reflected when you go back to the shop).
export default function ThemeModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(readSaved);

  // Keep other browser tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setDarkMode(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Apply the colors + remember the choice
  useLayoutEffect(() => {
    const root = document.documentElement;
    const i = darkMode ? 1 : 0;

    Object.entries(PALETTE).forEach(([name, values]) =>
      root.style.setProperty(name, values[i]),
    );
    root.style.setProperty("--icon-filter", darkMode ? "invert(1)" : "none");
    root.setAttribute("data-theme", darkMode ? "dark" : "light");
    root.style.colorScheme = darkMode ? "dark" : "light";

    // light mode keeps whatever your CSS already does; dark mode paints the page
    if (darkMode) document.body.style.backgroundColor = DARK_PAGE;
    else document.body.style.removeProperty("background-color");

    try {
      localStorage.setItem(STORAGE_KEY, String(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  const muiTheme = useMemo(
    () => createAppTheme(darkMode ? "dark" : "light"),
    [darkMode],
  );

  const value = useMemo(
    () => ({ darkMode, toggleDarkMode, setDarkMode }),
    [darkMode, toggleDarkMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
