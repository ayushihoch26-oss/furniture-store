const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const CART_BASE = `${API_BASE}/cart`;

async function cartRequest(endpoint, body = {}) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to access your cart.");
  }

  const response = await fetch(`${CART_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Cart request failed.");
  }

  return result;
}

// Get the current user's cart.
export async function getMyCart() {
  const response = await cartRequest("/cart/me");
  return response.data ?? response;
}

// Add a product to the cart.
export async function addToCart(product, quantity = 1) {
  const productId = typeof product === "object" ? product?.id : product;

  if (productId == null || !Number.isFinite(Number(productId))) {
    throw new Error("Product ID is missing.");
  }

  return cartRequest("/add", {
    productId: Number(productId),
    quantity: Number(quantity),
  });
}

// Update cart item quantity.
export async function updateCartItem(itemId, quantity) {
  if (itemId == null || !Number.isFinite(Number(itemId))) {
    throw new Error("Cart item ID is missing.");
  }

  const response = await cartRequest("/update", {
    itemId: Number(itemId),
    quantity: Number(quantity),
  });

  return response.data ?? response;
}

// Remove cart item.

export const removeCartItem = (itemId) => {
  if (itemId == null || !Number.isFinite(Number(itemId))) {
    return Promise.reject(new Error("Cart item ID is missing."));
  }

  return cartRequest("/remove", {
    itemId: Number(itemId),
  });
};

// Checkout.
export async function checkoutCart() {
  const response = await cartRequest("/checkout");
  return response.data ?? response;
}
