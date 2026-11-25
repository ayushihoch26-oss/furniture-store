import { useCallback, useEffect, useState } from "react";
import {
  deleteWishlist,
  getWishlists,
  PAGE_SIZE,
} from "../services/wishlist.service";

export default function useWishlistTable({
  setWishlists,
  selected,
  setSelected,
  page,
  setPage,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [userId, setUserId] = useState("");
  const [productId, setProductId] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [serverPage, setServerPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [action, setAction] = useState("");

  const fetchRows = useCallback(
    async (requestedPage = page) => {
      setLoading(true);
      setError("");

      try {
        const data = await getWishlists({
          page: requestedPage,
          userId: userId.trim(),
          productId: productId.trim(),
        });

        const list = Array.isArray(data)
          ? data
          : data.wishlists ||
            data.data?.wishlists ||
            [];
        const recordCount = Number(
          data.total ?? data.data?.total ?? list.length,
        );
        const responsePage =
          Number(data.page ?? data.data?.page ?? requestedPage) || requestedPage;

        setRows(list);
        setTotal(recordCount);
        setServerPage(responsePage);
        setPage(responsePage);
        setWishlists(list);
        setSelected((oldSelected) =>
          oldSelected.filter((id) =>
            list.some((item) => String(item.id) === String(id)),
          ),
        );
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load wishlist records.");
        setRows([]);
        setTotal(0);
        setWishlists([]);
      } finally {
        setLoading(false);
      }
    },
    [page, userId, productId, setPage, setSelected, setWishlists],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => fetchRows(page), 400);
    return () => window.clearTimeout(timer);
  }, [page, fetchRows]);

  const visibleRows = rows
    .filter((item) => {
      const text = [
        item.id,
        item.userId,
        item.customer,
        item.email,
        item.productId,
        item.productName,
        item.price,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search.trim().toLowerCase());
    })
    .sort((first, second) => {
      if (sort === "asc") {
        return Number(first.price || 0) - Number(second.price || 0);
      }
      if (sort === "desc") {
        return Number(second.price || 0) - Number(first.price || 0);
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearFilters() {
    setSearch("");
    setSort("default");
    setUserId("");
    setProductId("");
    setPage(1);
  }

  function toggleOne(id) {
    setSelected((oldSelected) =>
      oldSelected.includes(id)
        ? oldSelected.filter((item) => item !== id)
        : [...oldSelected, id],
    );
  }

  function toggleAll() {
    const allIds = visibleRows.map((item) => item.id);
    const allSelected =
      allIds.length > 0 &&
      allIds.every((id) => selected.includes(id));

    setSelected((oldSelected) =>
      allSelected
        ? oldSelected.filter((id) => !allIds.includes(id))
        : [...new Set([...oldSelected, ...allIds])],
    );
  }

  function openAction(item, nextAction) {
    setSelectedWishlist(item);
    setAction(nextAction);
  }

  function closeAction() {
    setSelectedWishlist(null);
    setAction("");
  }

  async function removeWishlist() {
    if (!selectedWishlist?.id) return;

    setDeleting(true);
    setError("");

    try {
      await deleteWishlist(selectedWishlist.id);
      closeAction();

      if (rows.length === 1 && serverPage > 1) {
        setPage(serverPage - 1);
      } else {
        fetchRows(serverPage);
      }
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete wishlist item.");
    } finally {
      setDeleting(false);
    }
  }

  return {
    search,
    setSearch,
    sort,
    setSort,
    userId,
    setUserId,
    productId,
    setProductId,
    rows,
    visibleRows,
    total,
    totalPages,
    serverPage,
    loading,
    deleting,
    error,
    setError,
    selectedWishlist,
    action,
    clearFilters,
    toggleOne,
    toggleAll,
    openAction,
    closeAction,
    removeWishlist,
    refresh: () => fetchRows(serverPage),
  };
}
