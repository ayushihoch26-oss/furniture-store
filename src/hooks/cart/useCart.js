import { useCallback, useEffect, useState } from "react";
import {
  getMyCart,
  removeCartItem,
  updateCartItem,
} from "../../service/cart.service";

export function useCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);

  const loadMyCart = useCallback(async () => {
    try {
      setLoading(true);
      setCartError("");

      const cart = await getMyCart();
      setItems(cart.items || []);
    } catch (error) {
      setCartError(error.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    loadMyCart();
  }, [loadMyCart]);

  useEffect(() => {
    const refreshCart = () => {
      loadMyCart();
    };

    window.addEventListener("cart:changed", refreshCart);

    return () => {
      window.removeEventListener("cart:changed", refreshCart);
    };
  }, [loadMyCart]);

  const changeQty = async (itemId, delta) => {
    if (updatingItem !== null) return;

    const item = items.find((current) => String(current.id) === String(itemId));

    if (!item) return;

    const currentQty = Number(item.quantity) || 1;
    const quantity = Math.max(1, currentQty + delta);

    if (quantity === currentQty) return;

    try {
      setUpdatingItem(itemId);
      setCartError("");

      const response = await updateCartItem(item.id, quantity);
      const cart = response.cart ?? response;

      setItems(cart.items ?? []);
      window.dispatchEvent(new Event("cart:changed"));
    } catch (error) {
      setCartError(error.message || "Unable to update quantity.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    if (updatingItem !== null) return;

    if (itemId == null || !Number.isFinite(Number(itemId))) {
      console.error("Invalid cart item ID:", itemId);
      setCartError("Unable to identify this cart item.");
      return;
    }

    try {
      setUpdatingItem(itemId);
      setCartError("");

      await removeCartItem(itemId);

      const cart = await getMyCart();
      setItems(cart.items || []);
    } catch (error) {
      setCartError(error.message || "Unable to remove item.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const count = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (Number(item.total) ||
        (Number(item.price) || 0) * (Number(item.quantity) || 0)),
    0,
  );

  return {
    items,
    loading,
    cartError,
    setCartError,
    updatingItem,
    loadMyCart,
    changeQty,
    removeItem,
    count,
    subtotal,
  };
}
