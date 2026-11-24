import { useCallback, useEffect, useMemo, useState } from "react";

export const PAGE_SIZE = 10;

/**
 * Single source of truth for the table filters.
 * The page passes `query` to useContactMessages and `filters` to the table,
 * so what you click is exactly what is sent to the API.
 */
export default function useContactFilters() {
  const [tab, setTab] = useState("All message");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Debounce only the search box (300ms); every other filter is instant.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const changeTab = useCallback((name) => {
    setTab(name);
    setPage(1);
  }, []);

  const changeSearch = useCallback((value) => setSearch(value), []);

  const changeSubject = useCallback((value) => {
    setSubject(value);
    setPage(1);
  }, []);

  const changeDates = useCallback((start, end) => {
    setFromDate(start);
    setToDate(end);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSubject("All");
    setFromDate("");
    setToDate("");
    setPage(1);
  }, []);

  const toggleSort = useCallback(() => {
    setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    setPage(1);
  }, []);

  // Exactly what the API receives
  const query = useMemo(
    () => ({
      page: Math.max(1, Number(page) || 1),
      limit: PAGE_SIZE,
      search: debouncedSearch,
      status: tab === "All message" ? "" : tab,
      subject: subject === "All" ? "" : subject,
      fromDate,
      toDate: toDate || fromDate,
      sortOrder,
    }),
    [page, debouncedSearch, tab, subject, fromDate, toDate, sortOrder],
  );

  return {
    query,
    page,
    setPage,
    // values used by the table UI
    tab,
    search,
    subject,
    fromDate,
    toDate,
    sortOrder,
    // handlers used by the table UI
    changeTab,
    changeSearch,
    changeSubject,
    changeDates,
    clearFilters,
    toggleSort,
  };
}