import { useCallback, useEffect, useState } from "react";
import { DARK_MODE_STORAGE_KEY } from "../constants/roles.constants";

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true",
  );

  useEffect(() => {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);

  return { darkMode, toggleDarkMode };
}
