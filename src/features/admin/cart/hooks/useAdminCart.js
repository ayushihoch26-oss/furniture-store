import { useCallback, useEffect, useState } from "react";
import { deleteCart, getCartStats } from "../services/cart.service";

const EMPTY_STATS = {
  total: 0,
  active: 0,
  abandoned: 0,
  converted: 0,
};

export default function useAdminCart() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [carts, setCarts] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);
  const [action, setAction] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [stats, setStats] = useState(EMPTY_STATS);

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  const loadStats = useCallback(async () => {
    try {
      const result = await getCartStats();
      const data = result.data || result.stats || result;

      setStats({
        total: Number(data.total ?? 0),
        active: Number(data.active ?? 0),
        abandoned: Number(data.abandoned ?? 0),
        converted: Number(data.converted ?? 0),
      });
      setStatsError("");
    } catch (error) {
      setStatsError(error.message || "Unable to load cart statistics.");
    }
  }, []);

  useEffect(() => {
    // Load the latest statistics when the page first opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    window.addEventListener("carts:refresh", loadStats);
    return () => window.removeEventListener("carts:refresh", loadStats);
  }, [loadStats]);

  const exportCarts = useCallback(() => {
    const cartsToExport = selected.length
      ? carts.filter((cart) => selected.includes(cart.id))
      : carts;

    if (!cartsToExport.length) {
      window.alert("No loaded carts to export");
      return;
    }

    const headers = ["Cart ID", "Customer", "Items", "Date", "Subtotal", "Status"];
    const rows = cartsToExport.map((cart) => [
      cart.cartCode || cart.id,
      cart.customer || "Guest",
      cart.itemCount ?? cart.items?.length ?? 0,
      cart.createdAt
        ? new Date(cart.createdAt).toLocaleDateString("en-GB")
        : "",
      cart.subtotal ?? 0,
      cart.status || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = selected.length ? "selected-carts.csv" : "loaded-carts.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [carts, selected]);

  const deleteSelectedCarts = async () => {
    if (!selected.length) {
      window.alert("Please select at least one cart");
      return;
    }

    if (!window.confirm(`Delete ${selected.length} selected cart(s)?`)) {
      return;
    }

    setBulkBusy(true);

    try {
      const results = await Promise.allSettled(
        selected.map((id) => deleteCart(id)),
      );
      const deletedIds = selected.filter(
        (_, index) => results[index].status === "fulfilled",
      );
      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      setCarts((currentCarts) =>
        currentCarts.filter((cart) => !deletedIds.includes(cart.id)),
      );
      setSelected((currentSelected) =>
        currentSelected.filter((id) => !deletedIds.includes(id)),
      );
      window.dispatchEvent(new Event("carts:refresh"));

      if (failedCount) {
        window.alert(
          `${deletedIds.length} cart(s) deleted. ` +
            `${failedCount} failed; check permissions/network.`,
        );
      } else {
        window.alert(`${deletedIds.length} cart(s) deleted successfully.`);
      }
    } finally {
      setBulkBusy(false);
    }
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
    page,
    setPage,
    selected,
    setSelected,
    carts,
    setCarts,
    selectedCart,
    setSelectedCart,
    action,
    setAction,
    darkMode,
    setDarkMode,
    moreAnchor,
    setMoreAnchor,
    bulkBusy,
    statsError,
    setStatsError,
    stats,
    exportCarts,
    deleteSelectedCarts,
  };
}
