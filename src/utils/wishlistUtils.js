export function addProductToCart(product) {
  try {
    const savedCart = localStorage.getItem("furniture_cart");
    const cart = JSON.parse(savedCart) || [];
    const color = "Grey";
    const itemKey = `${product.id}-${color}`;
    const existingItem = cart.find((item) => item.key === itemKey);

    let updatedCart = [];

    if (existingItem) {
      updatedCart = cart.map((item) => {
        if (item.key === itemKey) {
          return {
            ...item,
            qty: item.qty + 1,
          };
        }

        return item;
      });
    } else {
      const newItem = {
        key: itemKey,
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.salePrice ?? product.price,
        img: product.img,
        color,
        qty: 1,
      };

      updatedCart = [...cart, newItem];
    }

    localStorage.setItem("furniture_cart", JSON.stringify(updatedCart));
  } catch {
    // The browser may block access to local storage.
  }
}
