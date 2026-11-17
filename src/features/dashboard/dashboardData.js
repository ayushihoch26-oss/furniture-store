import { U, PRODUCT as PRODUCT_IMAGES } from "../../assets/furnitureImages";
import icon1 from "../../assets/Logo.svg";
import icon2 from "../../assets/Logo (1).svg";
import icon3 from "../../assets/Logo (2).svg";
import icon4 from "../../assets/Logo (3).svg";

// Map existing product images without changing furnitureImages.js.
export const PRODUCT = {
  stool: PRODUCT_IMAGES[0],
  papasan: PRODUCT_IMAGES[1],
  classicChair: PRODUCT_IMAGES[2],
  eggChair: PRODUCT_IMAGES[3],
  chaise: PRODUCT_IMAGES[4],
  modernChair: PRODUCT_IMAGES[5],
  coffeeTable: PRODUCT_IMAGES[6],
  Table: PRODUCT_IMAGES[7],
  nightstand: PRODUCT_IMAGES[8],
  bed: PRODUCT_IMAGES[9],
  cabinet: PRODUCT_IMAGES[10],
  sofa: PRODUCT_IMAGES[11],

  // Aliases used by existing dashboard sections.
  barStool: PRODUCT_IMAGES[0],
  armchair: PRODUCT_IMAGES[5],
  foldingTable: PRODUCT_IMAGES[7],
  simpleChair: PRODUCT_IMAGES[2],
};
// ---------- Images ----------

export const DOTS = ["#BDBDBD", "#A79186", "#9A9AAE"];

// ---------- Data ----------
export const HERO_CARDS = [
  { price: "$199", img: PRODUCT.modernChair },
  { promo: true },
  { price: "$99", img: PRODUCT.stool },
  { price: "$199", img: PRODUCT.papasan },
];

// Look (picture + gradient) for the category cards. Categories come from the
// database; a name that is not listed here uses one of the fallbacks.
export const CATEGORY_LOOKS = {
  tables: {
    img: U("photo-1530018607912-eff2daa1bac4", 700, 700),
    bg: "linear-gradient(160deg,var(--c-d9dadb),#8f9091)",
  },
  chairs: {
    img: U("photo-1503602642458-232111445657", 700, 700),
    bg: "linear-gradient(160deg,#b8a692,#d9b995)",
  },
  armchairs: {
    img: U("photo-1586023492125-27b2c045efd7", 700, 700),
    bg: "linear-gradient(160deg,#4a423d,#1c1917)",
  },
  sofas: {
    img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80",
    bg: "linear-gradient(160deg,#b9b8c4,var(--c-e4e4e8))",
  },
};

export const CATEGORY_FALLBACKS = Object.values(CATEGORY_LOOKS);

export const categoryLook = (name, index) =>
  CATEGORY_LOOKS[String(name).trim().toLowerCase()] ||
  CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];

export const MAX_CATEGORY_CARDS = 4;
export const MAX_TABS = 5; // "All" + up to 5 categories

export const FEATURE_ICONS = [icon1, icon2, icon3, icon4];
