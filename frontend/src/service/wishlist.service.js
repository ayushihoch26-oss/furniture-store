import api from "../api/api";

const CACHE_KEY = "wishlist";

// ---------- Local copy (so hearts can update instantly) ----------

// Same shape the old localStorage wishlist used: { id, name, price, img, badge }
const toItem = (row) => ({
  id: row.productId, // product id (used by the cart and the heart buttons)
  wishlistId: row.id,
  name: row.name,
  price: Number(row.price),
  img: row.image,
  oldPrice: row.oldPrice,
  salePrice: row.salePrice,
  badge: row.badge,
  addedAt: row.addedAt,
});

const notify = () => window.dispatchEvent(new CustomEvent("wishlist:changed"));

const writeCache = (items) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable.
  }
};

const applyServerData = (data) => {
  const items = (data?.items || []).map(toItem);
  writeCache(items);
  notify();
  return { items, total: data?.total ?? items.length };
};

const toError = (error) => {
  const err = new Error(
    error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.",
  );
  err.status = error?.response?.status;
  return err;
};

const hasToken = () => Boolean(localStorage.getItem("token"));

// Read the local copy
export const getWishlist = () => {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

// Heart button: updates the heart straight away, then saves to the server.
// If the server fails, the heart goes back to how it was.
export const toggleWishlist = (product) => {
  if (!product) return false;

  const before = getWishlist();
  const exists = before.some((item) => String(item.id) === String(product.id));

  const after = exists
    ? before.filter((item) => String(item.id) !== String(product.id))
    : [
        ...before,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          badge: product.badge,
        },
      ];

  writeCache(after);
  notify();

  if (hasToken()) {
    api
      .post("/wishlist/toggle", { productId: product.id })
      .then((response) => applyServerData(response.data))
      .catch(() => {
        writeCache(before);
        notify();
      });
  }

  return !exists;
};

// ---------- Server calls ----------

// Load my wishlist from the database
export const fetchWishlist = async () => {
  try {
    const response = await api.post("/wishlist/me", {});
    return applyServerData(response.data);
  } catch (error) {
    throw toError(error);
  }
};

// X button on a card
export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.post("/wishlist/remove", { productId });
    return applyServerData(response.data);
  } catch (error) {
    throw toError(error);
  }
};

// "Clear all" button
export const clearWishlist = async () => {
  try {
    await api.post("/wishlist/clear", {});
    return applyServerData({ items: [], total: 0 });
  } catch (error) {
    throw toError(error);
  }
};

// Number for the header badge
export const getWishlistCount = async () => {
  try {
    const response = await api.post("/wishlist/count", {});
    return Number(response.data?.total) || 0;
  } catch (error) {
    throw toError(error);
  }
};

// Call this on logout so the next user doesn't see this user's hearts
export const clearWishlistCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
  notify();
};

export default {
  getWishlist,
  toggleWishlist,
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
  clearWishlistCache,
};
