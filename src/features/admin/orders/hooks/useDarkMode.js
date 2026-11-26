// hooks/useDarkMode.js
// Remembers dark / light mode in localStorage.
import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  return { darkMode, toggleDarkMode };
}
