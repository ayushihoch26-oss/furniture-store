import { createContext } from "react";

// Shared by ThemeModeProvider (writes) and any component that needs the toggle (reads).
export const ThemeModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});
