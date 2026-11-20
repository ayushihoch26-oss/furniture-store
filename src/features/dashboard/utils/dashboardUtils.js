import { EASE } from "../dashboardStyles";

export const anim = (name, delay = 0, duration = 800) =>
  `${name} ${duration}ms ${EASE} ${delay}ms both`;
export const stagger = (index, step = 90, max = 7) => Math.min(index, max) * step;

// ---------- Data helpers (everything below comes from the backend) ----------
export const money = (value) => {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
};

// Backend product -> the shape the cards use
export const toCard = (product) => {
  const price = Number(product.finalPrice ?? product.price ?? 0);
  const onSale = Boolean(product.onSale);
  const soldOut =
    product.stockStatus === "out_of_stock" || Number(product.stock) === 0;

  let badge = "";
  if (soldOut) badge = "SOLD OUT";
  else if (onSale) badge = "SALE";
  else if (product.isNew) badge = "NEW";

  return {
    id: product.id,
    name: product.name || "Unnamed product",
    price,
    oldPrice: onSale ? Number(product.price) : undefined,
    salePrice: onSale ? price : undefined,
    badge,
    img: product.image || "",
  };
};
