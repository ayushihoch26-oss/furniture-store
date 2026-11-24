import { useCallback, useEffect, useState } from "react";
import {
  CART_SEARCH_DEBOUNCE_MS,
  deleteCart,
  getCarts,
  updateCartStatus,
} from "../services/cart.service";

const PAGE_SIZE = 10;

export default function useCartTable({
  carts,
  setCarts,
  selected,
  setSelected,
  selectedCart,
  setSelectedCart,
  setAction,
  page,
  setPage,
}) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [minItems, setMinItems] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [rows, setRows] = useState(Array.isArray(carts) ? carts : []);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const currentPage = Math.max(Number(page) || 1, 1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, CART_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [search, setPage]);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getCarts({
        page: currentPage,
        limit: PAGE_SIZE,
        status: tab,
        search: debouncedSearch,
        minItems,
        fromDate,
        toDate,
        sortOrder,
      });
      const data = result.data || result;
      const cartRows = Array.isArray(data.carts)
        ? data.carts
        : Array.isArray(data.rows)
          ? data.rows
          : Array.isArray(data.data)
            ? data.data
            : [];
      const cartCount = Number(data.total ?? cartRows.length);
      const pages = Math.max(1, Math.ceil(cartCount / PAGE_SIZE));

      setRows(cartRows);
      setTotal(cartCount);
      setTotalPages(pages);
      setCarts(cartRows);

      if (currentPage > pages) {
        setPage(pages);
      }

      setSelected((previous) =>
        previous.filter((id) => cartRows.some((cart) => cart.id === id)),
      );
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load carts.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    tab,
    debouncedSearch,
    minItems,
    fromDate,
    toDate,
    sortOrder,
    setCarts,
    setPage,
    setSelected,
  ]);

  useEffect(() => {
    // Load the requested page whenever its filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCarts();
  }, [fetchCarts]);

  useEffect(() => {
    window.addEventListener("carts:refresh", fetchCarts);
    return () => window.removeEventListener("carts:refresh", fetchCarts);
  }, [fetchCarts]);

  const openAction = (cart, type) => {
    setSelectedCart({ ...cart });
    setAction(type);
  };

  const closeAction = () => {
    setSelectedCart(null);
    setAction("");
  };

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const selectAllOnPage = (checked) => {
    setSelected((previous) => {
      const otherPages = previous.filter(
        (id) => !rows.some((cart) => cart.id === id),
      );
      return checked ? [...otherPages, ...rows.map((cart) => cart.id)] : otherPages;
    });
  };

  const allOnPageSelected =
    rows.length > 0 && rows.every((cart) => selected.includes(cart.id));

  const saveCartStatus = async () => {
    if (!selectedCart?.id || !selectedCart?.status) return;

    setSaving(true);
    try {
      await updateCartStatus(selectedCart.id, selectedCart.status);
      closeAction();
      setNotice("Cart status updated successfully.");
      window.dispatchEvent(new Event("carts:refresh"));
    } catch (saveError) {
      setError(saveError.message || "Unable to update cart status.");
    } finally {
      setSaving(false);
    }
  };

  const removeCart = async () => {
    if (!selectedCart?.id) return;

    setSaving(true);
    try {
      await deleteCart(selectedCart.id);
      const deletedId = selectedCart.id;
      setSelected((previous) => previous.filter((id) => id !== deletedId));
      closeAction();
      setNotice("Cart deleted successfully.");

      if (rows.length === 1 && currentPage > 1) {
        setPage(currentPage - 1);
      } else {
        window.dispatchEvent(new Event("carts:refresh"));
      }
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete cart.");
    } finally {
      setSaving(false);
    }
  };

  return {
    tab,
    setTab,
    search,
    setSearch,
    filterAnchor,
    setFilterAnchor,
    minItems,
    setMinItems,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sortOrder,
    setSortOrder,
    rows,
    total,
    totalPages,
    loading,
    saving,
    error,
    setError,
    notice,
    setNotice,
    currentPage,
    openAction,
    closeAction,
    toggleSelected,
    selectAllOnPage,
    allOnPageSelected,
    fetchCarts,
    saveCartStatus,
    removeCart,
  };
}
