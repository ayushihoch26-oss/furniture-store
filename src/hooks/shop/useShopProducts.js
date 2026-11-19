import { useEffect, useState } from "react";
import shopService from "../../service/shop.service";
import { PAGE_SIZE } from "../../features/shop/shopConstants";
import { normalizeProduct, errorMessage } from "../../utils/shopUtils";

export function useShopFilters() {
  const [categories, setCategories] = useState([]);
  const [priceBounds, setPriceBounds] = useState([0, 0]);
  const [saleCount, setSaleCount] = useState(0);
  const [colorOptions, setColorOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const [filters, sale, categoryList] = await Promise.all([
          shopService.getFilters(),
          shopService.getProducts({ onSale: true, limit: 1 }),
          shopService.getCategories(),
        ]);

        if (cancelled) return;

        setCategories(
          categoryList.map((category) => ({
            name: category.name,
            count: Number(category.count) || 0,
          })),
        );

        setPriceBounds([
          Math.floor(Number(filters?.price?.min) || 0),
          Math.ceil(Number(filters?.price?.max) || 0),
        ]);

        setSaleCount(Number(sale?.total) || 0);
        setColorOptions(Array.isArray(filters?.colors) ? filters.colors : []);
        setMaterialOptions(
          Array.isArray(filters?.materials) ? filters.materials : [],
        );
        setBrandOptions(Array.isArray(filters?.brands) ? filters.brands : []);
      } catch (err) {
        if (!cancelled) {
          console.error("[Shop] could not load filters:", err.message);
          setError("Could not load filter options.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    categories,
    priceBounds,
    saleCount,
    colorOptions,
    materialOptions,
    brandOptions,
    loading,
    error,
  };
}

// Fetch newest products for the sidebar and featured section.
export function useShopExtras() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadExtras() {
      try {
        const data = await shopService.getProducts({
          sort: "latest",
          page: 1,
          limit: 12,
        });

        if (!cancelled) {
          setItems((data?.products || []).map(normalizeProduct));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[Shop] could not load latest products:", err.message);
        }
      }
    }

    loadExtras();

    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}

// Load products whenever the selected filters or page change.
export function useProductPage(query) {
  const [data, setData] = useState({
    products: [],
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await shopService.getProducts(query, {
          signal: controller.signal,
        });

        if (!active) return;

        // Support common API response shapes.
        const result = response?.data ?? response;
        const payload = result?.data ?? result;

        const products = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.products)
            ? payload.products
            : Array.isArray(payload?.rows)
              ? payload.rows
              : [];

        const total =
          Number(
            payload?.total ??
            payload?.count ??
            result?.total ??
            products.length,
          ) || 0;

        const totalPages =
          Number(
            payload?.totalPages ??
            payload?.pages ??
            result?.totalPages ??
            Math.ceil(total / PAGE_SIZE),
          ) || 0;

        setData({
          products: products.map(normalizeProduct),
          total,
          totalPages,
        });
      } catch (err) {
        // Ignore errors from requests that were cancelled during a filter change.
        if (
          !active ||
          controller.signal.aborted ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("[Shop] Product fetch failed:", err);

        setData({
          products: [],
          total: 0,
          totalPages: 0,
        });

        setError(errorMessage(err));
      } finally {
        if (active && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [query]);

  return { ...data, loading, error };
}

// ---------------------------------------------------------------------------
