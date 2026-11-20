import api from "../../../api/api";

const CACHE_KEY = "wishlist";

function convertServerItem(serverItem) {
  return {
    id: serverItem.productId,
    wishlistId: serverItem.id,
    name: serverItem.name,
    price: Number(serverItem.price),
    img: serverItem.image,
    oldPrice: serverItem.oldPrice,
    salePrice: serverItem.salePrice,
    badge: serverItem.badge,
    addedAt: serverItem.addedAt,
  };
}

function notifyWishlistChanged() {
  window.dispatchEvent(new CustomEvent("wishlist:changed"));
}

function saveWishlistToStorage(items) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // The browser may block access to local storage.
  }
}

function saveServerWishlist(data) {
  let items = [];

  if (data && Array.isArray(data.items)) {
    items = data.items.map(convertServerItem);
  }

  saveWishlistToStorage(items);
  notifyWishlistChanged();

  let total = items.length;

  if (data && data.total !== undefined && data.total !== null) {
    total = data.total;
  }

  return {
    items,
    total,
  };
}

function createWishlistError(error) {
  let message = "Something went wrong. Please try again.";
  let status;

  if (error && error.response) {
    status = error.response.status;

    if (error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
  } else if (error && error.message) {
    message = error.message;
  }

  const wishlistError = new Error(message);
  wishlistError.status = status;

  return wishlistError;
}

function hasUserToken() {
  return Boolean(localStorage.getItem("token"));
}

export function getWishlist() {
  try {
    const savedItems = localStorage.getItem(CACHE_KEY) || "[]";
    const items = JSON.parse(savedItems);

    if (Array.isArray(items)) {
      return items;
    }

    return [];
  } catch {
    return [];
  }
}

export function toggleWishlist(product) {
  if (!product) {
    return false;
  }

  const previousItems = getWishlist();
  const productAlreadySaved = previousItems.some((item) => {
    return String(item.id) === String(product.id);
  });

  let updatedItems;

  if (productAlreadySaved) {
    updatedItems = previousItems.filter((item) => {
      return String(item.id) !== String(product.id);
    });
  } else {
    const newWishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      badge: product.badge,
    };

    updatedItems = [...previousItems, newWishlistItem];
  }

  saveWishlistToStorage(updatedItems);
  notifyWishlistChanged();

  if (hasUserToken()) {
    api
      .post("/wishlist/toggle", { productId: product.id })
      .then((response) => {
        saveServerWishlist(response.data);
      })
      .catch(() => {
        saveWishlistToStorage(previousItems);
        notifyWishlistChanged();
      });
  }

  return !productAlreadySaved;
}

export async function fetchWishlist() {
  try {
    const response = await api.post("/wishlist/me", {});
    return saveServerWishlist(response.data);
  } catch (error) {
    throw createWishlistError(error);
  }
}

export async function removeFromWishlist(productId) {
  try {
    const response = await api.post("/wishlist/remove", { productId });
    return saveServerWishlist(response.data);
  } catch (error) {
    throw createWishlistError(error);
  }
}

export async function clearWishlist() {
  try {
    await api.post("/wishlist/clear", {});
    return saveServerWishlist({
      items: [],
      total: 0,
    });
  } catch (error) {
    throw createWishlistError(error);
  }
}

export async function getWishlistCount() {
  try {
    const response = await api.post("/wishlist/count", {});
    let total = 0;

    if (response.data) {
      total = response.data.total;
    }

    return Number(total) || 0;
  } catch (error) {
    throw createWishlistError(error);
  }
}

export function clearWishlistCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // The browser may block access to local storage.
  }

  notifyWishlistChanged();
}

const wishlistService = {
  getWishlist,
  toggleWishlist,
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
  clearWishlistCache,
};

export default wishlistService;
