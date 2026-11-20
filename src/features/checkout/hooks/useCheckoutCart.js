import { useEffect, useState } from "react";
import { CART_KEY } from "../checkoutConstants";
import { loadCart } from "../utils/checkoutUtils";

export function useCheckoutCart() {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    function loadSavedCart() {
      setCartItems(loadCart());
    }

    window.addEventListener("storage", loadSavedCart);
    window.addEventListener("cart:changed", loadSavedCart);

    return () => {
      window.removeEventListener("storage", loadSavedCart);
      window.removeEventListener("cart:changed", loadSavedCart);
    };
  }, []);

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("cart:changed"));
    setCartItems([]);
  }

  return { cartItems, setCartItems, clearCart };
}
