import { useState, useEffect, useCallback } from "react";

const KEY = "admin-dark-mode";

export default function useAdminDarkMode() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem(KEY) === "true",
  );

  useEffect(() => {
    localStorage.setItem(KEY, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(
    () => setDarkMode((previous) => !previous),
    [],
  );

  return { darkMode, toggleDarkMode };
}
