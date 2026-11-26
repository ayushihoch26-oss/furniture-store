// hooks/useOrders.js
// Handles the order LIST: filters, search, tabs, paging, sorting, loading.
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOrdersList } from "../services/orderService";
import { PAGE_SIZE, TAB_STATUS } from "../constants/orderConstants";

export default function useOrders() {
  // data
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("All order");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOrdersList({
        page,
        limit: PAGE_SIZE,
        search: search.trim(),
        status: TAB_STATUS[tab] || "",
        paymentStatus: paymentFilter === "All" ? "" : paymentFilter,
        startDate: fromDate,
        endDate: toDate,
      });
      const list = Array.isArray(data.orders) ? data.orders : [];
      setOrders(list);
      setTotalOrders(Number(data.total ?? list.length));
      setTotalPages(Math.max(1, Number(data.totalPages) || 1));
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, search, tab, paymentFilter, fromDate, toDate]);

  // Re-fetch whenever a filter or the page changes
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Sort the current page by price
  const rows = useMemo(() => {
    return [...orders].sort((a, b) => {
      const priceA = Number(a.total ?? a.price ?? 0);
      const priceB = Number(b.total ?? b.price ?? 0);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });
  }, [orders, sortOrder]);

  // Changing any filter should send the user back to page 1
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setPaymentFilter("All");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return {
    rows, orders, totalOrders, totalPages, loading, error, setError,
    page, setPage,
    tab, setTab: changeFilter(setTab),
    search, setSearch: changeFilter(setSearch),
    paymentFilter, setPaymentFilter: changeFilter(setPaymentFilter),
    fromDate, setFromDate: changeFilter(setFromDate),
    toDate, setToDate: changeFilter(setToDate),
    sortOrder, toggleSort: () => setSortOrder((p) => (p === "asc" ? "desc" : "asc")),
    clearFilters,
    reload: loadOrders,
  };
}
