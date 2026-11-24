import { useEffect, useMemo, useState } from "react";
import customerService, {
  getErrorMessage,
  PAGE_LIMIT,
} from "../services/customer.service";
import { sortCustomers } from "../customer.helpers";

const SEARCH_DEBOUNCE_MS = 400;

const EMPTY_STATS = {
  total: 0,
  newThisMonth: 0,
};

const EMPTY_OVERVIEW = {
  thisWeek: [4, 6, 3, 8, 5, 9, 7],
  lastWeek: [2, 5, 4, 6, 3, 7, 5],
};

export default function useAdminCustomers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [minOrders, setMinOrders] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [week, setWeek] = useState("this");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCustomer, setDrawerCustomer] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("admin-dark-mode") === "true",
  );

  useEffect(() => {
    localStorage.setItem("admin-dark-mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const searchTerm = search.trim();

      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setPage(1);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      setLoading(true);
      setError("");

      try {
        const result = await customerService.list({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch,
        });

        if (cancelled) return;

        setCustomers(result.customers || []);
        setTotal(Number(result.total) || 0);
        setTotalPages(Number(result.totalPages) || 0);
        setStats({
          total: Number(result.stats?.total) || Number(result.total) || 0,
          newThisMonth: Number(result.stats?.newThisMonth) || 0,
        });
      } catch (loadError) {
        if (cancelled) return;

        console.error("Could not load customers:", loadError);
        setCustomers([]);
        setTotal(0);
        setTotalPages(0);
        setStats(EMPTY_STATS);
        setError(getErrorMessage(loadError, "Could not load customers"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, reloadKey]);

  useEffect(() => {
    if (!loading && !error && totalPages > 0 && page > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(totalPages);
    }
  }, [loading, error, totalPages, page]);

  const sortedCustomers = useMemo(
    () => sortCustomers(customers, statusFilter, minOrders, sortBy, sortOrder),
    [customers, statusFilter, minOrders, sortBy, sortOrder],
  );

  const reload = () => {
    setReloadKey((previous) => previous + 1);
  };

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const toggleAll = () => {
    const visibleIds = sortedCustomers.map((customer) => customer.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selected.includes(id));

    setSelected((previous) =>
      allSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])],
    );
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await customerService.remove(customerToDelete.id);
      setSelected((previous) =>
        previous.filter((id) => id !== customerToDelete.id),
      );
      setDeleteOpen(false);
      setCustomerToDelete(null);
      reload();
    } catch (deleteError) {
      setDeleteOpen(false);
      window.alert(getErrorMessage(deleteError, "Could not delete customer"));
    }
  };

  const deleteSelectedCustomers = async () => {
    if (selected.length === 0) {
      window.alert("Please select at least one customer");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selected.length} selected customer(s)?`,
    );
    if (!confirmed) return;

    const results = await Promise.allSettled(
      selected.map((id) => customerService.remove(id)),
    );
    const failed = results.filter(
      (result) => result.status === "rejected",
    ).length;

    if (failed > 0) {
      window.alert(`${failed} customer(s) could not be deleted`);
    }

    setSelected([]);
    setPage(1);
    reload();
  };

  const exportCustomers = async () => {
    let exportData;

    try {
      const allCustomers = await customerService.getAll({
        search: debouncedSearch,
      });
      exportData = sortCustomers(
        allCustomers,
        statusFilter,
        minOrders,
        sortBy,
        sortOrder,
      );

      if (selected.length > 0) {
        exportData = exportData.filter((customer) =>
          selected.includes(customer.id),
        );
      }
    } catch (exportError) {
      window.alert(getErrorMessage(exportError, "Could not export customers"));
      return;
    }

    if (exportData.length === 0) {
      window.alert("No customers to export");
      return;
    }

    const headers = [
      "Customer ID",
      "Name",
      "Phone",
      "Order Count",
      "Total Spend",
      "Status",
    ];
    const rows = exportData.map((customer) => [
      customer.code,
      customer.name,
      customer.phone,
      customer.orders,
      customer.spend,
      customer.status,
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
    link.download =
      selected.length > 0 ? "selected-customers.csv" : "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    search,
    setSearch,
    selected,
    setSelected,
    filterAnchor,
    setFilterAnchor,
    moreAnchor,
    setMoreAnchor,
    statusFilter,
    setStatusFilter,
    minOrders,
    setMinOrders,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    sidebarOpen,
    setSidebarOpen,
    collapsed,
    setCollapsed,
    week,
    setWeek,
    overview: EMPTY_OVERVIEW,
    page,
    setPage,
    total,
    totalPages,
    stats,
    loading,
    error,
    deleteOpen,
    setDeleteOpen,
    customerToDelete,
    setCustomerToDelete,
    drawerOpen,
    setDrawerOpen,
    drawerCustomer,
    setDrawerCustomer,
    darkMode,
    setDarkMode,
    sortedCustomers,
    toggleSelected,
    toggleAll,
    confirmDelete,
    deleteSelectedCustomers,
    exportCustomers,
    tableMessage: loading ? "Loading customers..." : error || "No customers found",
  };
}
