import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  IconButton,
  GlobalStyles,
  Skeleton,
} from "@mui/material";
import {
  FavoriteBorder,
  Favorite,
  ArrowForward,
  PlayArrow,
  Star,
  Person,
} from "@mui/icons-material";

import { U, ROOM, PRODUCT as PRODUCT_IMAGES } from "../assets/furnitureImages";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import shopService from "../service/shop.service";
import {
  getWishlist,
  toggleWishlist,
  fetchWishlist,
} from "../service/wishlist.service";

import icon1 from "../assets/Logo.svg";
import icon2 from "../assets/Logo (1).svg";
import icon3 from "../assets/Logo (2).svg";
import icon4 from "../assets/Logo (3).svg";

// ---------- Layout (1440px Figma frame: 72px side padding, 1296px content) ----------
const BROWN = "#947458";
const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };
const SECTION_PY = { xs: "56px", md: "80px", xl: "110px" };

const H2 = {
  fontSize: { xs: 26, md: 32 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.2,
};

// ---------- Animation helpers ----------
const EASE = "cubic-bezier(.2,.7,.2,1)";

// CSS animation shorthand that keeps the final state (fill-mode: both)
const anim = (name, delay = 0, duration = 800) =>
  `${name} ${duration}ms ${EASE} ${delay}ms both`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Keyframes + reduced-motion safety, scoped to the home page
const ANIMATION_STYLES = {
  "@keyframes fs-fadeUp": {
    from: { opacity: 0, transform: "translateY(28px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes fs-popIn": {
    from: { opacity: 0, transform: "translateY(24px) scale(.8)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes fs-float": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-8px)" },
  },
  "@keyframes fs-kenburns": {
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.12)" },
  },
  "@keyframes fs-pulse": {
    "0%": { transform: "scale(1)", opacity: 0.6 },
    "100%": { transform: "scale(1.9)", opacity: 0 },
  },
  "@keyframes fs-heartPop": {
    "0%": { transform: "scale(.4)" },
    "60%": { transform: "scale(1.35)" },
    "100%": { transform: "scale(1)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".fs-home *, .fs-home *::before, .fs-home *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important",
      transitionDelay: "0s !important",
    },
  },
};

// Tells us when an element has scrolled into view (once)
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (seen) return undefined;

    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}

const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
  zoom: "scale(.92)",
  none: "none",
};

// Fades + slides its children in when they scroll into view
function Reveal({ children, delay = 0, direction = "up", sx, ...rest }) {
  const [ref, seen] = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : REVEAL_FROM[direction],
        transition: `opacity .7s ease ${delay}ms, transform .8s ${EASE} ${delay}ms`,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

// Small stagger so long grids don't wait too long
const stagger = (index, step = 90, max = 7) => Math.min(index, max) * step;

// Map existing product images without changing furnitureImages.js.
const PRODUCT = {
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

const DOTS = ["#BDBDBD", "#A79186", "#9A9AAE"];

// ---------- Data ----------
const HERO_CARDS = [
  { price: "$199", img: PRODUCT.modernChair },
  { promo: true },
  { price: "$99", img: PRODUCT.stool },
  { price: "$199", img: PRODUCT.papasan },
];

// Look (picture + gradient) for the category cards. Categories come from the
// database; a name that is not listed here uses one of the fallbacks.
const CATEGORY_LOOKS = {
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

const CATEGORY_FALLBACKS = Object.values(CATEGORY_LOOKS);

const categoryLook = (name, index) =>
  CATEGORY_LOOKS[String(name).trim().toLowerCase()] ||
  CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];

const MAX_CATEGORY_CARDS = 4;
const MAX_TABS = 5; // "All" + up to 5 categories

// ---------- Data helpers (everything below comes from the backend) ----------
const money = (value) => {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
};

// Backend product -> the shape the cards use
const toCard = (product) => {
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

// Categories with product counts: null while loading, [] when none / on error
function useCategories() {
  const [list, setList] = useState(null);

  useEffect(() => {
    let active = true;

    shopService
      .getFilters()
      .then((data) => {
        if (!active) return;
        const rows = (data?.categories || [])
          .map((item) => ({ name: item.name, count: Number(item.count) || 0 }))
          .filter((item) => item.name && item.count > 0)
          .sort((a, b) => b.count - a.count);
        setList(rows);
      })
      .catch(() => active && setList([]));

    return () => {
      active = false;
    };
  }, []);

  return list;
}

// One page of products from the shop API (cached by shopService)
function useProducts(params) {
  const key = JSON.stringify(params);
  const [result, setResult] = useState({ key: "", items: [], error: "" });

  useEffect(() => {
    let active = true;

    shopService
      .getProducts(JSON.parse(key))
      .then((data) => {
        if (active) {
          setResult({ key, items: data.products.map(toCard), error: "" });
        }
      })
      .catch(() => {
        if (active) {
          setResult({ key, items: [], error: "Could not load products." });
        }
      });

    return () => {
      active = false;
    };
  }, [key]);

  return {
    items: result.items,
    error: result.error,
    loading: result.key !== key,
  };
}

// Ids of the products in the wishlist; updates when a heart is clicked anywhere
function useWishedIds() {
  const [ids, setIds] = useState(() =>
    getWishlist().map((item) => String(item.id)),
  );

  useEffect(() => {
    const sync = () => setIds(getWishlist().map((item) => String(item.id)));
    window.addEventListener("wishlist:changed", sync);

    // Logged-in users: load the saved wishlist from the database
    try {
      if (localStorage.getItem("token")) fetchWishlist().catch(() => {});
    } catch {
      // storage unavailable
    }

    return () => window.removeEventListener("wishlist:changed", sync);
  }, []);

  return ids;
}

const FEATURE_ICONS = [icon1, icon2, icon3, icon4];

// ---------- Reusable pieces ----------
function ColorDots({ sx }) {
  return (
    <Box sx={{ display: "flex", gap: "4px", alignItems: "center", ...sx }}>
      {DOTS.map((color) => (
        <Box
          key={color}
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: color,
            transition: "transform .25s ease",
            "&:hover": { transform: "scale(1.5)" },
          }}
        />
      ))}
    </Box>
  );
}

function SectionHeader({ title }) {
  const navigate = useNavigate();

  return (
    <Reveal>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 3, md: "48px" },
        }}
      >
        <Typography sx={H2}>{title}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/Shop")}
          sx={{
            width: 120,
            height: 40,
            borderRadius: 0,
            borderColor: "var(--c-111111)",
            color: "var(--c-111111)",
            fontSize: 14,
            fontWeight: 400,
            textTransform: "none",
            transition: "background-color .25s ease, color .25s ease",
            "&:hover": {
              borderColor: "var(--c-111111)",
              bgcolor: "var(--c-111111)",
              color: "#fff",
            },
          }}
        >
          View all
        </Button>
      </Box>
    </Reveal>
  );
}

function Img({ src, alt = "" }) {
  if (!src) return null;

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        p: { xs: "8px", md: "14px", lg: "18px" },
        objectFit: "contain",
        objectPosition: "center",
        display: "block",
        transition: `transform .6s ${EASE}`,
      }}
    />
  );
}

// Image frame whose picture zooms in slowly on hover
const zoomOnHover = {
  "& img": { transition: `transform .6s ${EASE}` },
  "&:hover img": { transform: "scale(1.07)" },
};

// ---------- Hero ----------
function Hero() {
  const { items } = useProducts({ sort: "latest", limit: 3 });

  // Same 4 slots as before: product, promo, product, product
  let next = 0;
  const heroCards = HERO_CARDS.map((card) => {
    if (card.promo) return card;
    const product = items[next++];
    return product
      ? {
          price: `$${money(product.price)}`,
          img: product.img || card.img,
          name: product.name,
        }
      : card;
  });

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: { xs: 460, md: 480, xl: 583 },
        bgcolor: "#16131f",
        color: "#fff",
        px: { xs: 2, sm: 4, md: "10%" },
        py: { xs: 6, md: 0 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Background image with a slow zoom (Ken Burns) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            `linear-gradient(90deg, rgba(22,18,15,.88) 0%, rgba(22,18,15,.6) 47%, rgba(22,18,15,.25) 100%), ` +
            `url("https://images.unsplash.com/photo-1679215805560-3c8236d86862?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D") center/cover no-repeat #16131f`,
          animation: "fs-kenburns 22s ease-in-out infinite alternate",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "inline-block",
            bgcolor: "#2b2927",
            px: "12px",
            py: "5px",
            fontSize: 12,
            mb: "22px",
            animation: anim("fs-fadeUp", 100),
          }}
        >
          Furniture
        </Box>

        <Typography
          sx={{
            fontSize: { xs: 36, md: 42, lg: 48, xl: 52 },
            fontWeight: 600,
            lineHeight: 1.15,
            animation: anim("fs-fadeUp", 250, 900),
          }}
        >
          Where Traditional
          <br />
          Meets Modern
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "rgba(255,255,255,.8)",
            mt: "32px",
            mb: "44px",
            maxWidth: 380,
            animation: anim("fs-fadeUp", 450),
          }}
        >
          Mi tristique est nunc sapien orci tortor ac. Suspendisse leo et cursus
          pharetra tellus tincidunt.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: "8px",
            animation: anim("fs-fadeUp", 650),
          }}
        >
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: BROWN,
              borderRadius: 0,
              textTransform: "none",
              fontSize: 13,
              minWidth: 133,
              height: 45,
              transition: "transform .25s ease, background-color .25s ease",
              "&:hover": { bgcolor: "#7d6149", transform: "translateY(-3px)" },
            }}
          >
            Shop now
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderRadius: 0,
              color: "#fff",
              borderColor: "rgba(255,255,255,.55)",
              textTransform: "none",
              fontSize: 13,
              minWidth: 137,
              height: 45,
              transition: "transform .25s ease, border-color .25s ease",
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "transparent",
                transform: "translateY(-3px)",
              },
            }}
          >
            Learn more
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          width: "100%",
          maxWidth: { xs: 360, md: 340, xl: 380 },
          justifySelf: { xs: "start", md: "end" },
        }}
      >
        {heroCards.map((item, index) => (
          // Outer box: pops in on load. Inner box: floats gently forever.
          <Box
            key={index}
            sx={{
              aspectRatio: "1",
              animation: anim("fs-popIn", 500 + index * 140, 800),
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                bgcolor: item.promo ? BROWN : "var(--c-f4f3f1)",
                color: item.promo ? "#fff" : BROWN,
                p: item.promo ? "12px" : 0,
                fontSize: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: item.promo ? "center" : "flex-start",
                justifyContent: item.promo ? "center" : "flex-start",
                textAlign: "center",
                overflow: "hidden",
                boxSizing: "border-box",
                animation: `fs-float ${5 + index * 0.7}s ease-in-out ${index * 0.5}s infinite`,
                transition: "box-shadow .3s ease",
                "&:hover": { boxShadow: "0 16px 32px rgba(0,0,0,.4)" },
                ...zoomOnHover,
              }}
            >
              {item.promo ? (
                <>
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}
                  >
                    25% OFF
                  </Typography>
                  <Typography sx={{ fontSize: 12, mt: "8px", lineHeight: 1.4 }}>
                    custom-made
                    <br />
                    furniture
                  </Typography>
                </>
              ) : (
                <>
                  {/* Whole product is shown (contain), centred, and kept clear
                      of the price tag, so every card looks the same size */}
                  <Box
                    component="img"
                    src={item.img}
                    alt={item.name || ""}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      boxSizing: "border-box",
                      p: "34px 12px 12px",
                      objectFit: "contain",
                      objectPosition: "center bottom",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      m: "10px",
                      px: "8px",
                      py: "2px",
                      bgcolor: "var(--c-f4f3f1)",
                      color: BROWN,
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      letterSpacing: ".02em",
                      boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                    }}
                  >
                    {item.price}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---------- Categories ----------
function Categories() {
  const navigate = useNavigate();
  const categories = useCategories();

  if (categories && categories.length === 0) return null;

  const cards = categories
    ? categories.slice(0, MAX_CATEGORY_CARDS).map((item, index) => ({
        ...item,
        ...categoryLook(item.name, index),
      }))
    : [];

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <SectionHeader title="Shop by Categories" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: { xs: 2, md: "17px" },
        }}
      >
        {categories === null &&
          Array.from({ length: MAX_CATEGORY_CARDS }, (_, index) => (
            <Box key={index}>
              <Skeleton
                variant="rectangular"
                sx={{ aspectRatio: "1", height: "auto", mb: "14px" }}
              />
              <Skeleton width="50%" />
            </Box>
          ))}

        {cards.map((item, index) => (
          <Reveal key={item.name} delay={stagger(index, 120)}>
            <Box
              onClick={() =>
                navigate(`/Shop?categories=${encodeURIComponent(item.name)}`)
              }
              sx={{
                cursor: "pointer",
                "&:hover .fs-cat-name": { color: BROWN },
                "&:hover .fs-cat-arrow": {
                  opacity: 1,
                  transform: "translateX(0)",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "1",
                  background: item.bg,
                  mb: "14px",
                  overflow: "hidden",
                  ...zoomOnHover,
                }}
              >
                <Box
                  component="img"
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Typography
                  className="fs-cat-name"
                  sx={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                    transition: "color .25s ease",
                  }}
                >
                  {item.name}
                </Typography>
                <ArrowForward
                  className="fs-cat-arrow"
                  sx={{
                    fontSize: 16,
                    color: BROWN,
                    opacity: 0,
                    transform: "translateX(-8px)",
                    transition: "opacity .25s ease, transform .25s ease",
                  }}
                />
              </Box>
              <Typography
                sx={{ fontSize: 12, color: "var(--c-777777)", lineHeight: 1.5 }}
              >
                {item.count} {item.count === 1 ? "product" : "products"}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------- New products ----------
function NewProducts() {
  const [tab, setTab] = useState("All");
  const wishedIds = useWishedIds();

  const categories = useCategories();
  const tabs = [
    "All",
    ...(categories || []).slice(0, MAX_TABS).map((c) => c.name),
  ];

  // Newest products of the selected category (3 cards, same as the design)
  const { items, loading, error } = useProducts({
    sort: "latest",
    limit: 3,
    categories: tab === "All" ? "" : tab,
  });

  return (
    <Box sx={{ bgcolor: "var(--c-f8f9fb)", px: SIDE, py: SECTION_PY }}>
      <Reveal>
        <Typography sx={{ ...H2, textAlign: "center" }}>
          New Products
        </Typography>
      </Reveal>

      <Reveal delay={120}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: { xs: 2.5, md: "44px" },
            mt: "24px",
            mb: { xs: 3, md: "44px" },
          }}
        >
          {tabs.map((item) => (
            <Typography
              key={item}
              onClick={() => setTab(item)}
              sx={{
                cursor: "pointer",
                fontSize: 16,
                color: tab === item ? BROWN : "var(--c-111111)",
                pb: "3px",
                borderBottom:
                  tab === item ? `2px solid ${BROWN}` : "2px solid transparent",
                transition: "color .25s ease, border-color .25s ease",
                "&:hover": { color: BROWN },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Reveal>

      {/* key={tab}: the cards animate in again every time the tab changes */}
      <Box
        key={tab}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: { xs: 2, md: "17px" },
        }}
      >
        {loading &&
          Array.from({ length: 3 }, (_, index) => (
            <Box key={index}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "416 / 555",
                  mb: "14px",
                }}
              />
              <Skeleton width="60%" />
            </Box>
          ))}

        {!loading && items.length === 0 && (
          <Typography
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--c-777777)",
              py: 6,
              animation: anim("fs-fadeUp", 0, 500),
            }}
          >
            {error || "No products in this category yet."}
          </Typography>
        )}

        {!loading &&
          items.map((product, index) => {
            const liked = wishedIds.includes(String(product.id));

            return (
              <Reveal key={product.id} delay={stagger(index, 120)}>
                <Box
                  sx={{
                    "&:hover .fs-card-frame": {
                      boxShadow: "0 14px 30px rgba(0,0,0,.1)",
                    },
                  }}
                >
                  <Box
                    className="fs-card-frame"
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "416 / 555",
                      bgcolor: "var(--c-f4f2f0)",
                      overflow: "hidden",
                      mb: "14px",
                      transition: "box-shadow .4s ease",
                      ...zoomOnHover,
                    }}
                  >
                    <Box sx={{ position: "absolute", inset: 0 }}>
                      <Img src={product.img} alt={product.name} />
                    </Box>
                    <IconButton
                      size="small"
                      aria-label={
                        liked ? "Remove from wishlist" : "Add to wishlist"
                      }
                      onClick={() => toggleWishlist(product)}
                      sx={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        color: liked ? "#FF5252" : "var(--c-333333)",
                      }}
                    >
                      {liked ? (
                        <Favorite
                          sx={{
                            fontSize: 17,
                            animation: "fs-heartPop .45s ease both",
                          }}
                        />
                      ) : (
                        <FavoriteBorder sx={{ fontSize: 17 }} />
                      )}
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--c-111111)",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <ColorDots />
                  </Box>

                  <Typography
                    sx={{ fontSize: 13, color: "var(--c-111111)", mt: "4px" }}
                  >
                    ${money(product.price)}
                  </Typography>
                </Box>
              </Reveal>
            );
          })}
      </Box>
    </Box>
  );
}

// ---------- Rooms ----------
function Rooms() {
  const tiles = [
    {
      name: "Bedroom",
      img: U(ROOM.bedroom, 1000, 600),
      grid: { gridColumn: { xs: "1 / 3", md: "1 / 3" }, gridRow: { md: 1 } },
      bg: "var(--c-dedbd5)",
    },
    {
      name: "Kitchen",
      img: U(ROOM.dining, 600, 900),
      grid: { gridColumn: { md: 3 }, gridRow: { md: "1 / 3" } },
      bg: "#c9b8a8",
    },
    {
      name: "Living room",
      img: U(ROOM.living, 600, 500),
      grid: { gridColumn: { md: 1 }, gridRow: { md: 2 } },
      bg: "var(--c-e8e0d6)",
    },
    {
      name: "Hallway",
      img: U(ROOM.interior, 600, 500),
      grid: { gridColumn: { md: 2 }, gridRow: { md: 2 } },
      bg: "#a99b8d",
    },
  ];

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gridTemplateRows: { md: "1fr 1fr" },
          aspectRatio: { md: "1296 / 637" },
          gap: { xs: 2, md: "17px" },
        }}
      >
        {tiles.map((item, index) => (
          <Reveal
            key={item.name}
            direction="zoom"
            delay={stagger(index, 140)}
            sx={{
              display: "flex",
              minHeight: { xs: 170, md: 0 },
              ...item.grid,
            }}
          >
            <Box
              sx={{
                position: "relative",
                flex: 1,
                overflow: "hidden",
                background: item.bg,
                cursor: "pointer",
                ...zoomOnHover,
                "&:hover .fs-room-label": { pl: "20px" },
                "&:hover .fs-room-arrow": { transform: "translateX(5px)" },
              }}
            >
              <Box
                component="img"
                src={item.img}
                alt={item.name}
                loading="lazy"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                className="fs-room-label"
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  bgcolor: "rgba(72,68,66,.92)",
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 1,
                  px: "14px",
                  py: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "padding-left .3s ease",
                }}
              >
                {item.name}
                <ArrowForward
                  className="fs-room-arrow"
                  sx={{ fontSize: 14, transition: "transform .3s ease" }}
                />
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------- Video banner ----------
function VideoBanner() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: { xs: "auto", md: 520, lg: 560, xl: 640 },
        bgcolor: "var(--c-f4f2f0)",
      }}
    >
      <Reveal
        direction="left"
        sx={{ display: "flex", minHeight: { xs: 280, md: "100%" } }}
      >
        <Box
          sx={{
            position: "relative",
            flex: 1,
            background: `
    linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.15)),
    url("https://images.unsplash.com/photo-1680007889201-114ac772447d?q=80&w=900&h=700&fit=crop")
    center / cover no-repeat
  `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            aria-label="Play video"
            sx={{
              position: "relative",
              width: 60,
              height: 60,
              bgcolor: "#000",
              color: "#fff",
              transition: "transform .25s ease, background-color .25s ease",
              "&:hover": { bgcolor: "#222", transform: "scale(1.12)" },
              // Pulsing rings around the play button
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.7)",
                animation: "fs-pulse 2.2s ease-out infinite",
                pointerEvents: "none",
              },
              "&::after": { animationDelay: "1.1s" },
            }}
          >
            <PlayArrow />
          </IconButton>
        </Box>
      </Reveal>

      <Box
        sx={{
          px: { xs: 2, md: "100px" },
          py: { xs: 5, md: 0 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Reveal direction="right">
          <Typography
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 600,
              lineHeight: 1.3,
              maxWidth: 340,
              mb: "40px",
            }}
          >
            Affordable furniture for every home
          </Typography>
        </Reveal>

        <Box sx={{ maxWidth: 360 }}>
          <Reveal direction="right" delay={150}>
            <Typography
              sx={{
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--c-222222)",
                mb: "6px",
              }}
            >
              Ultrices porttitor lacus sed condimentum nulla viverra. Maecenas
              sed nisi imperdiet sed lorem sed quis sagittis in. Auctor augue ut
              nec a quisque libero imperdiet velit ut.
            </Typography>
          </Reveal>
          <Reveal direction="right" delay={280}>
            <Typography
              sx={{ fontSize: 12, lineHeight: 1.7, color: "var(--c-222222)" }}
            >
              Tellus dui pharetra ut pellentesque posuere ut amet. Curabitur
              lectus viverra in sit tortor. Magnis tristique tristique blandit
              nunc tincidunt et duis adipiscing ac. Nulla dictum semper commodo
            </Typography>
          </Reveal>
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Bestsellers ----------
function Bestsellers() {
  const { items, loading, error } = useProducts({ sort: "latest", limit: 8 });

  if (!loading && items.length === 0 && !error) return null;

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <SectionHeader title="Bestsellers" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          columnGap: { xs: 2, md: "17px" },
          rowGap: { xs: 4, md: "30px" },
        }}
      >
        {loading &&
          Array.from({ length: 8 }, (_, index) => (
            <Box key={index}>
              <Skeleton
                variant="rectangular"
                sx={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "416 / 555",
                  mb: "14px",
                }}
              />
              <Skeleton width="60%" sx={{ mx: "auto" }} />
            </Box>
          ))}

        {!loading && error && (
          <Typography
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--c-777777)",
              py: 6,
            }}
          >
            {error}
          </Typography>
        )}

        {!loading &&
          items.map((product, index) => (
            <Reveal key={product.id} delay={stagger(index % 4, 110)}>
              <Box
                sx={{
                  textAlign: "center",
                  transition: `transform .4s ${EASE}`,
                  "&:hover": { transform: "translateY(-8px)" },
                  "&:hover .fs-card-frame": {
                    boxShadow: "0 16px 32px rgba(0,0,0,.12)",
                  },
                }}
              >
                <Box
                  className="fs-card-frame"
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "416 / 555",
                    bgcolor: "var(--c-f4f2f0)",
                    overflow: "hidden",
                    mb: "14px",
                    transition: "box-shadow .4s ease",
                    ...zoomOnHover,
                  }}
                >
                  <Box sx={{ position: "absolute", inset: 0 }}>
                    <Img src={product.img} alt={product.name} />
                  </Box>

                  {product.badge && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        px: "10px",
                        py: "3px",
                        fontSize: 11,
                        lineHeight: 1.5,
                        color: "#fff",
                        bgcolor:
                          product.badge === "SALE" ? "#FF5252" : "#1a1a1a",
                      }}
                    >
                      {product.badge}
                    </Box>
                  )}
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                  }}
                >
                  {product.name}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "var(--c-555555)",
                    lineHeight: 1.6,
                  }}
                >
                  {product.salePrice ? (
                    <>
                      <s>${money(product.oldPrice)}</s>{" "}
                      <b style={{ color: "var(--c-111111)", fontWeight: 500 }}>
                        ${money(product.salePrice)}
                      </b>
                    </>
                  ) : (
                    `$${money(product.price)}`
                  )}
                </Typography>

                <ColorDots sx={{ justifyContent: "center", mt: "4px" }} />
              </Box>
            </Reveal>
          ))}
      </Box>
    </Box>
  );
}

// ---------- Reviews ----------
function Reviews() {
  // Stars pop in one after another when the section scrolls into view
  const [starsRef, starsSeen] = useInView();

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: { xs: "auto", md: 520, lg: 562, xl: 640 },
        bgcolor: "var(--c-f4f2f0)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          pl: { xs: 2, md: "20%" },
          pr: { xs: 2, md: "14%" },
          py: { xs: 5, md: 0 },
        }}
      >
        <Reveal>
          <Typography
            sx={{ ...H2, fontSize: { xs: 26, md: 28, xl: 32 }, mb: "28px" }}
          >
            Customer Reviews
          </Typography>
        </Reveal>

        <Box ref={starsRef} sx={{ display: "flex", gap: "2px", mb: "20px" }}>
          {[1, 2, 3, 4, 5].map((star, i) => (
            <Star
              key={star}
              sx={{
                fontSize: 20,
                color: "#FFC107",
                opacity: starsSeen ? 1 : 0,
                transform: starsSeen
                  ? "scale(1) rotate(0deg)"
                  : "scale(0) rotate(-120deg)",
                transition: `opacity .4s ease ${i * 120}ms, transform .5s cubic-bezier(.3,1.6,.5,1) ${i * 120}ms`,
              }}
            />
          ))}
        </Box>

        <Reveal delay={150}>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: "24px",
              color: "var(--c-111111)",
              mb: "12px",
            }}
          >
            Ultrices porttitor lacus sed condimentum nulla viverra. Maecenas sed
            nisi imperdiet sed lorem sed quis sagittis in. Auctor augue ut nec a
            quisque libero imperdiet velit ut.
          </Typography>
        </Reveal>

        <Reveal delay={260}>
          <Typography
            sx={{ fontSize: 14, lineHeight: "24px", color: "var(--c-111111)" }}
          >
            Ullamcorper sit lacus sed risus congue integer amet erat risus.
            Euismod lacus lectus a dignissim velit. Facilisi lorem vitae purus
            habitant ac neque...
          </Typography>
        </Reveal>

        <Reveal delay={380}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              mt: "28px",
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "var(--c-e4e4e4)",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                transition: "transform .3s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              <Person sx={{ fontSize: 44, color: "#B8B8B8", mb: "-4px" }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--c-111111)",
                  lineHeight: 1.4,
                }}
              >
                Devon Simpson
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "var(--c-8a8a8a)", lineHeight: 1.4 }}
              >
                Customer
              </Typography>
            </Box>
          </Box>
        </Reveal>
      </Box>

      <Reveal
        direction="right"
        sx={{ display: "flex", minHeight: { xs: 300, md: "100%" } }}
      >
        <Box
          sx={{
            flex: 1,
            background: `url(${U(ROOM.interior, 900, 800)}) center/cover`,
          }}
        />
      </Reveal>
    </Box>
  );
}

// ---------- Feature logos ----------
function Features({ darkMode = false }) {
  return (
    <Box
      sx={{
        px: SIDE,
        minHeight: 150,
        py: { xs: 4, md: 0 },
        display: "flex",
        flexWrap: { xs: "wrap", md: "nowrap" },
        justifyContent: "space-around",
        alignItems: "center",
        gap: { xs: 3, md: 0 },
        bgcolor: darkMode ? "#16120F" : "var(--c-ffffff)",
      }}
    >
      {FEATURE_ICONS.map((src, index) => (
        <Reveal key={index} direction="zoom" delay={index * 130}>
          <Box
            component="img"
            src={src}
            alt=""
            sx={{
              display: "block",
              width: 64,
              height: 64,
              objectFit: "contain",
              transition: "transform .35s cubic-bezier(.3,1.6,.5,1)",
              "&:hover": { transform: "translateY(-6px) scale(1.12)" },
            }}
          />
        </Reveal>
      ))}
    </Box>
  );
}

// ---------- Page ----------
function Dashboard() {
  return (
    <Box
      className="fs-home"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden", // slide-in animations never cause a horizontal scrollbar
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />
      <Hero />

      <Box sx={{ order: { xs: 1, xl: 3 } }}>
        <Categories />
      </Box>
      <Box sx={{ order: { xs: 2, xl: 1 } }}>
        <NewProducts />
      </Box>
      <Box sx={{ order: { xs: 3, xl: 2 } }}>
        <Rooms />
      </Box>

      <Box sx={{ order: 4 }}>
        <VideoBanner />
      </Box>
      <Box sx={{ order: 5 }}>
        <Bestsellers />
      </Box>
      <Box sx={{ order: 6 }}>
        <Reviews />
      </Box>
      <Box sx={{ order: 7 }}>
        <Features />
      </Box>
      <Box sx={{ order: 8 }}>
        <Footer />
      </Box>
    </Box>
  );
}

export default Dashboard;
