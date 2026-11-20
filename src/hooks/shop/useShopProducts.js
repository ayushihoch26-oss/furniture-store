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
    let isCurrent = true;

    async function loadFilters() {
      try {
        const filterRequest = shopService.getFilters();
        const saleRequest = shopService.getProducts({
          onSale: true,
          limit: 1,
        });
        const categoryRequest = shopService.getCategories();

        const [filters, sale, categoryList] = await Promise.all([
          filterRequest,
          saleRequest,
          categoryRequest,
        ]);

        if (!isCurrent) return;

        const simpleCategories = categoryList.map((category) => {
          return {
            name: category.name,
            count: Number(category.count) || 0,
          };
        });

        const smallestPrice = Math.floor(
          Number(filters?.price?.min) || 0,
        );
        const largestPrice = Math.ceil(
          Number(filters?.price?.max) || 0,
        );

        setCategories(simpleCategories);
        setPriceBounds([smallestPrice, largestPrice]);
        setSaleCount(Number(sale?.total) || 0);
        setColorOptions(
          Array.isArray(filters?.colors) ? filters.colors : [],
        );
        setMaterialOptions(
          Array.isArray(filters?.materials) ? filters.materials : [],
        );
        setBrandOptions(
          Array.isArray(filters?.brands) ? filters.brands : [],
        );
      } catch (requestError) {
        if (isCurrent) {
          console.error(
            "[Shop] Could not load filter options:",
            requestError,
          );
          setError("Could not load filter options.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadFilters();

    return () => {
      isCurrent = false;
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

// Load the products shown in the featured section.
export function useShopExtras() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isCurrent = true;

    async function loadProducts() {
      try {
        const data = await shopService.getProducts({
          sort: "latest",
          page: 1,
          limit: 12,
        });

        if (isCurrent) {
          const simpleProducts = (data?.products || []).map(normalizeProduct);
          setProducts(simpleProducts);
        }
      } catch (requestError) {
        if (isCurrent) {
          console.error(
            "[Shop] Could not load featured products:",
            requestError,
          );
        }
      }
    }

    loadProducts();

    return () => {
      isCurrent = false;
    };
  }, []);

  return products;
}

// Load products again when the search or filters change.
export function useProductPage(query) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const requestController = new AbortController();
    let isCurrent = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await shopService.getProducts(query, {
          signal: requestController.signal,
        });

        if (!isCurrent) return;

        const result = response?.data ?? response;
        const productData = result?.data ?? result;

        let productList = [];
        if (Array.isArray(productData)) {
          productList = productData;
        } else if (Array.isArray(productData?.products)) {
          productList = productData.products;
        } else if (Array.isArray(productData?.rows)) {
          productList = productData.rows;
        }

        const productTotal =
          Number(
            productData?.total ??
              productData?.count ??
              result?.total ??
              productList.length,
          ) || 0;

        const pageCount =
          Number(
            productData?.totalPages ??
              productData?.pages ??
              result?.totalPages ??
              Math.ceil(productTotal / PAGE_SIZE),
          ) || 0;

        setProducts(productList.map(normalizeProduct));
        setTotal(productTotal);
        setTotalPages(pageCount);
      } catch (requestError) {
        const wasCancelled =
          !isCurrent ||
          requestController.signal.aborted ||
          requestError?.name === "AbortError" ||
          requestError?.code === "ERR_CANCELED";

        if (wasCancelled) return;

        console.error("[Shop] Product request failed:", requestError);
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
        setError(errorMessage(requestError));
      } finally {
        if (isCurrent && !requestController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isCurrent = false;
      requestController.abort();
    };
  }, [query]);

  return {
    products,
    total,
    totalPages,
    loading,
    error,
  };
}

// ---------------------------------------------------------------------------
