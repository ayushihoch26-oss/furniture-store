import api from "../api/api";

// Backend mounts the product router at /api/products, and the router defines
// POST /product/list. If your axios instance baseURL already ends with
// "/products", change this to "".
const BASE = "/products";

export const PAGE_LIMIT = 9; // 9 products per page (3 x 3 grid); backend caps limit at 100

const CACHE_TTL_MS = 60 * 1000; // pages are reused for 1 minute
const CACHE_MAX = 60; // keep memory small

const log = (...args) => console.log("[shopService]", ...args);

// Remove empty values so we only send real filters to the backend
const clean = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );

// Same filters in a different key order must hit the same cache entry
const cacheKey = (body) =>
  JSON.stringify(
    Object.keys(body)
      .sort()
      .map((k) => [k, body[k]]),
  );

// key -> { time, promise }. Storing the promise also de-duplicates requests
// that are made at the same moment (e.g. prefetch + click on the same page).
const cache = new Map();

const remember = (key, promise) => {
  cache.set(key, { time: Date.now(), promise });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
};

const shopService = {
  // ONE page of products, filtered/sorted/searched on the server.
  // Supported: search, categories, minPrice, maxPrice, onSale, sort, page, limit
  // Options: { signal } to cancel an old request, { fresh } to skip the cache.

  async getProducts(params = {}, { signal, fresh = false } = {}) {
    const body = clean({ page: 1, limit: PAGE_LIMIT, ...params });
    const key = cacheKey(body);

    const hit = cache.get(key);

    if (!fresh && hit && Date.now() - hit.time < CACHE_TTL_MS) {
      try {
        return await hit.promise;
      } catch {
        // Never reuse a failed cached request.
        if (cache.get(key) === hit) {
          cache.delete(key);
        }
        // Continue below and make a fresh request.
      }
    }

    const startedAt = performance.now();
    let promise;

    promise = api
      .post(`${BASE}/product/list`, body, { signal })
      .then((response) => {
        const result = response.data?.data ?? response.data;
        const products = Array.isArray(result)
          ? result
          : (result?.products ?? result?.rows ?? []);

        if (!Array.isArray(products)) {
          throw new Error("Invalid product response from backend");
        }

        const total = Number(result?.total ?? result?.count ?? products.length);

        const data = {
          products,
          total,
          page: Number(result?.page ?? body.page),
          totalPages: Number(
            result?.totalPages ?? Math.ceil(total / body.limit),
          ),
        };

        log(
          "Loaded:",
          data.products.length,
          "products | total:",
          data.total,
          "| pages:",
          data.totalPages,
          "|",
          Math.round(performance.now() - startedAt),
          "ms",
        );

        return data;
      })
      .catch((error) => {
        // Delete only this request's cache entry.
        if (cache.get(key)?.promise === promise) {
          cache.delete(key);
        }

        console.error(
          "[shopService] Product request failed:",
          error.response?.status,
          error.response?.data ?? error.message,
        );

        throw error;
      });

    // Store the pending request so concurrent calls can share it.
    remember(key, promise);

    return promise;
  },

  // Warm the cache for a page the user will probably open next.
  // Errors are ignored: it is only an optimisation.
  prefetch(params = {}) {
    const body = clean({ page: 1, limit: PAGE_LIMIT, ...params });
    const hit = cache.get(cacheKey(body));
    if (hit && Date.now() - hit.time < CACHE_TTL_MS) return;

    log("prefetch page", body.page);
    shopService.getProducts(params).catch(() => {});
  },

  // Sidebar data: { categories: [{ name, count }], price: { min, max } }
  async getFilters() {
    const key = "filters";
    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.promise;

    log("POST", `${BASE}/product/filters`);

    const promise = api
      .post(`${BASE}/product/filters`)
      .then((response) => {
        log("filters response:", response.data);
        return response.data;
      })
      .catch((err) => {
        cache.delete(key);
        console.error(
          "[shopService] filters failed:",
          err.response?.status,
          err.response?.data || err.message,
        );
        throw err;
      });

    remember(key, promise);
    return promise;
  },

  // Active categories managed in Admin > Categories -> [{ id, name }]
  async getCategories() {
    const key = "categories";
    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.promise;

    log("POST", `${BASE}/category/options`);

    const promise = api
      .post(`${BASE}/category/options`)
      .then((response) => {
        const list = response.data?.data ?? response.data;
        return Array.isArray(list) ? list : [];
      })
      .catch((err) => {
        cache.delete(key);
        console.error(
          "[shopService] categories failed:",
          err.response?.status,
          err.response?.data || err.message,
        );
        throw err;
      });

    remember(key, promise);
    return promise;
  },

  async getProductById(id) {
    log("POST", `${BASE}/product/${id}`);
    const response = await api.post(`${BASE}/product/${id}`);
    return response.data;
  },

  clearCache() {
    cache.clear();
  },
};

export default shopService;
