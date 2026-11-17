import { useEffect, useState } from "react";
import shopService from "../service/shop.service";
import { getWishlist, fetchWishlist } from "../service/wishlist.service";
import { toCard } from "../utils/dashboardUtils";

// Categories with product counts: null while loading, [] when none / on error
export function useCategories() {
  const [list, setList] = useState(null);

  useEffect(() => {
    let active = true;

    shopService
      .getFilters()
      .then((data) => {
        if (!active) return;
        const rows = (data?.categories || [])
          .map((item) => ({ name: item.name, count: Number(item.count) || 0 }))
          .filter((item) => item.name && item.count > 0)
          .sort((a, b) => b.count - a.count);
        setList(rows);
      })
      .catch(() => active && setList([]));

    return () => {
      active = false;
    };
  }, []);

  return list;
}

// One page of products from the shop API (cached by shopService)
export function useProducts(params) {
  const key = JSON.stringify(params);
  const [result, setResult] = useState({ key: "", items: [], error: "" });

  useEffect(() => {
    let active = true;

    shopService
      .getProducts(JSON.parse(key))
      .then((data) => {
        if (active) {
          setResult({ key, items: data.products.map(toCard), error: "" });
        }
      })
      .catch(() => {
        if (active) {
          setResult({ key, items: [], error: "Could not load products." });
        }
      });

    return () => {
      active = false;
    };
  }, [key]);

  return {
    items: result.items,
    error: result.error,
    loading: result.key !== key,
  };
}

// Ids of the products in the wishlist; updates when a heart is clicked anywhere
export function useWishedIds() {
  const [ids, setIds] = useState(() =>
    getWishlist().map((item) => String(item.id)),
  );

  useEffect(() => {
    const sync = () => setIds(getWishlist().map((item) => String(item.id)));
    window.addEventListener("wishlist:changed", sync);

    // Logged-in users: load the saved wishlist from the database
    try {
      if (localStorage.getItem("token")) fetchWishlist().catch(() => { });
    } catch {
      // storage unavailable
    }

    return () => window.removeEventListener("wishlist:changed", sync);
  }, []);

  return ids;
}
