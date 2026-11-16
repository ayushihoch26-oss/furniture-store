// src/assets/furnitureImages.js
// One place for every image link, shared by Dashboard, Shop and About Us.

export const U = (id, w = 800, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

// Neutral placeholder shown if any link fails to load.
export const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='416' height='555'>
       <rect width='100%' height='100%' fill='#F4F2F0'/>
       <text x='50%' y='50%' fill='#947458' font-family='sans-serif'
             font-size='18' text-anchor='middle'>Image unavailable</text>
     </svg>`,
  );

// Use on every <img>:  onError={onImgError}
export const onImgError = (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return; // avoid an infinite error loop
  img.dataset.fallback = "1";
  img.src = FALLBACK;
};

// Room / lifestyle photos
export const ROOM = {
  bedroom: "photo-1616486338812-3dadae4b4ace",
  dining: "photo-1615066390971-03e4e1c36ddf",
  living: "photo-1600607687939-ce8a6c25118c",
  interior: "photo-1618221195710-dd6b41faaea6",
  showroom: "photo-1555041469-a586c61ea9bc",
  yellowChair: "photo-1600607687920-4e2a09cf159d",
  lounge: "photo-1600210492486-724fe5c67fb0",
};

import stool from "../assets/products/stool.png";
import papasan from "../assets/products/papasan.png";
import classicChair from "../assets/products/simplechair.png";
import eggChair from "../assets/products/eggchair.png";
import chaise from "../assets/products/chair.png";
import modernChair from "../assets/products/modernchair.png";
import coffeeTable from "../assets/products/coffeetable.png";
import Table from "../assets/products/table.png";
import nightstand from "../assets/products/night-lamp-stand.png";
import bed from "../assets/products/bed.png";
import cabinet from "../assets/products/cabinet.png";
import sofa from "../assets/products/sofa.png";
// Product photos. Swap any value here and all pages update.

// Keep the PRODUCT array for components that need an array.
export const PRODUCT = [
  stool,
  papasan,
  classicChair,
  eggChair,
  chaise,
  modernChair,
  coffeeTable,
  Table,
  nightstand,
  bed,
  cabinet,
  sofa,
];

// Named image mapping for Shop.jsx and other components.
export const PRODUCTS = {
  stool,
  papasan,
  classicChair,
  eggChair,
  chaise,
  modernChair,
  coffeeTable,
  table: Table,
  whiteTable: Table,
  nightstand,
  bed,
  cabinet,
  sofa,

  // Aliases used by Shop.jsx
  armchair: modernChair,
  barStool: stool,
  foldingTable: Table,
  simpleChair: classicChair,
};

// Hero background
export const HERO_BG = "../assets/bg.jpg";
