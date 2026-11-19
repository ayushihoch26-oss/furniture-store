import { FALLBACK } from "../assets/furnitureImages";

const splitList = (value) =>
  String(value || "")
    .split(/[,/&]/)
    .map((value) => value.trim())
    .filter(Boolean);

const titleCase = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const normalizeProduct = (item) => {
  const price = Number(item.finalPrice ?? item.price ?? 0);
  const onSale = Boolean(item.onSale);
  const stock = item.stock == null ? null : Number(item.stock);
  const soldOut = item.stockStatus === "out_of_stock" || stock === 0;

  const category =
    typeof item.category === "object" ? item.category?.name : item.category;

  const materials = splitList(
    item.details?.material ?? item.material,
  ).map(titleCase);

  let badge = "";
  if (soldOut) badge = "SOLD OUT";
  else if (onSale) badge = "SALE";
  else if (item.isNew) badge = "NEW";

  return {
    ...item,
    id: item.id,
    name: item.name || "Unnamed product",
    price,
    oldPrice: onSale ? Number(item.price) : undefined,
    img: item.image || FALLBACK,
    cats: category ? [category] : [],
    materials,
    isSale: onSale,
    soldOut,
    badge,
  };
};

export const errorMessage = (err) =>
  err?.response?.data?.message || "Unable to load products. Please try again.";

// ---------------------------------------------------------------------------
