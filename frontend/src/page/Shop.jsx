import {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Typography,
  Button,
  ButtonBase,
  IconButton,
  Slider,
  Checkbox,
  Select,
  MenuItem,
  Badge,
  Fab,
  Drawer,
  Collapse,
  Snackbar,
  Alert,
  InputBase,
  Skeleton,
  GlobalStyles,
} from "@mui/material";
import {
  FavoriteBorder,
  KeyboardArrowDown,
  ChevronRight,
  CreditCardOutlined,
  Inventory2Outlined,
  ContactSupportOutlined,
  ShoppingBagOutlined,
  TuneOutlined,
  Close,
  Favorite,
  SearchOutlined,
} from "@mui/icons-material";
import { Link, useSearchParams } from "react-router-dom";

import shopService, { PAGE_LIMIT } from "../service/shop.service";
import Navbar from "../components/Navbar";
import ProductModal, {
  getWishlist,
  toggleWishlist,
} from "../components/ProductModal";

import Armchairs from "../assets/shop-icon1.png";
import Cabinets from "../assets/shop-icon2.png";
import Sofa from "../assets/shop-icon3.png";
import Chair from "../assets/shop-icon4.png";
import Decor from "../assets/shop-icon5.png";
import { onImgError } from "../assets/furnitureImages";

// Load the footer JavaScript only when the footer is needed.
const Footer = lazy(() => import("../components/Footer"));

// ---------------------------------------------------------------------------
// Layout and colors
// ---------------------------------------------------------------------------
const BROWN = "#947458";
const GRAY_BG = "var(--c-f4f2f0)";
const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };
const SECTION_PY = { xs: "56px", md: "80px", lg: "118px" };

const H2 = {
  fontSize: { xs: 26, md: 34, lg: 40 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.2,
};

const FILTER_TITLE = {
  fontSize: { xs: 16, md: 17, lg: 20 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.3,
  mb: { xs: "10px", lg: "12px" },
};

const OPTION_TEXT = {
  fontSize: { xs: 13, md: 14, lg: 16 },
  color: "var(--c-222222)",
};

const ROW_PY = { xs: "4px", lg: "6px" };
const DOTS = ["#BDBDBD", "#A79186", "#9A9AAE"];

const CATEGORY_ICONS = {
  armchairs: Armchairs,
  armchair: Armchairs,
  cabinets: Cabinets,
  cabinet: Cabinets,
  sofas: Sofa,
  sofa: Sofa,
  chairs: Chair,
  chair: Chair,
  decor: Decor,
};

const BADGE_COLORS = {
  SALE: "#FF5252",
  NEW: "#1a1a1a",
  "SOLD OUT": "#8a8a8a",
};

const SERVICES = [
  {
    Icon: CreditCardOutlined,
    title: "Secure Payments",
    text: "Feugiat mi gravida vestibulum orci ac volutpat non",
  },
  {
    Icon: Inventory2Outlined,
    title: "Return Within 14 Days",
    text: "Urna elementum eget quam facilisi vulputate",
  },
  {
    Icon: ContactSupportOutlined,
    title: "24/7 Support",
    text: "Semper turpis sed maecenas vivamus vel scelerisque",
  },
];

const PAGE_SIZE = PAGE_LIMIT;
const SALE = "Sale";
const SEARCH_DEBOUNCE_MS = 400;

const SORTS = [
  { value: "latest", label: "Sort by latest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A to Z" },
];

const log = () => {};

const scrollToProducts = () =>
  document
    .getElementById("shop-products")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const EASE = "cubic-bezier(.2,.7,.2,1)";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ANIMATION_STYLES = {
  "@keyframes fs-fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes fs-popIn": {
    from: { opacity: 0, transform: "translateY(10px) scale(.8)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes fs-heartPop": {
    "0%": { transform: "scale(.4)" },
    "60%": { transform: "scale(1.35)" },
    "100%": { transform: "scale(1)" },
  },
  "@keyframes fs-bump": {
    "0%": { transform: "scale(1)" },
    "35%": { transform: "scale(1.35) rotate(-8deg)" },
    "70%": { transform: "scale(.92) rotate(4deg)" },
    "100%": { transform: "scale(1)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".fs-shop *, .fs-shop *::before, .fs-shop *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important",
      transitionDelay: "0s !important",
    },
  },
};

// Share observers between elements using the same options.
// Automatically disconnect observers when they have no remaining elements.
const observers = new Map();

function observeOnce(element, onVisible, threshold, rootMargin) {
  if (typeof IntersectionObserver === "undefined") {
    onVisible();
    return () => {};
  }

  const key = `${threshold}|${rootMargin}`;
  let shared = observers.get(key);

  if (!shared) {
    const callbacks = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const callback = callbacks.get(entry.target);

          observer.unobserve(entry.target);
          callbacks.delete(entry.target);
          callback?.();
        });

        if (callbacks.size === 0) {
          observer.disconnect();
          observers.delete(key);
        }
      },
      { threshold, rootMargin },
    );

    shared = { observer, callbacks };
    observers.set(key, shared);
  }

  shared.callbacks.set(element, onVisible);
  shared.observer.observe(element);

  return () => {
    const current = observers.get(key);
    if (!current) return;

    current.callbacks.delete(element);
    current.observer.unobserve(element);

    if (current.callbacks.size === 0) {
      current.observer.disconnect();
      observers.delete(key);
    }
  };
}

// Detect when an element enters the viewport.
function useInView(threshold = 0.12, rootMargin = "0px 0px -30px 0px") {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (seen) return undefined;

    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }

    return observeOnce(element, () => setSeen(true), threshold, rootMargin);
  }, [seen, threshold, rootMargin]);

  return [ref, seen];
}

// Render content only when the user scrolls near it.
function LazySection({ children, minHeight = 300, margin = "400px 0px" }) {
  const [ref, seen] = useInView(0, margin);

  return (
    <Box ref={ref} sx={{ minHeight: seen ? undefined : minHeight }}>
      {seen ? children : null}
    </Box>
  );
}

const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-40px)",
  right: "translateX(40px)",
  zoom: "scale(.94)",
  none: "none",
};

function Reveal({ children, delay = 0, direction = "up", sx, ...rest }) {
  const [ref, seen] = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : REVEAL_FROM[direction],
        transition: `opacity .6s ease ${delay}ms, transform .7s ${EASE} ${delay}ms`,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

const stagger = (index, step = 90, max = 6) => Math.min(index, max) * step;

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------
const splitList = (value) =>
  String(value || "")
    .split(/[,/&]/)
    .map((value) => value.trim())
    .filter(Boolean);

const titleCase = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const normalizeProduct = (item) => {
  const price = Number(item.finalPrice ?? item.price ?? 0);
  const onSale = Boolean(item.onSale);
  const stock = item.stock == null ? null : Number(item.stock);
  const soldOut = item.stockStatus === "out_of_stock" || stock === 0;

  const category =
    typeof item.category === "object" ? item.category?.name : item.category;

  const materials = splitList(item.details?.material).map(titleCase);

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
    img: item.image || "",
    cats: category ? [category] : [],
    materials,
    isSale: onSale,
    soldOut,
    badge,
  };
};

const errorMessage = (err) =>
  err?.response?.data?.message || "Unable to load products. Please try again.";

// ---------------------------------------------------------------------------
// Sidebar filters
// ---------------------------------------------------------------------------
function useShopFilters() {
  const [categories, setCategories] = useState([]);
  const [priceBounds, setPriceBounds] = useState([0, 0]);
  const [saleCount, setSaleCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const [filters, sale, categoryList] = await Promise.all([
          shopService.getFilters(),
          shopService.getProducts({ onSale: true, limit: 1 }),
          shopService.getCategories(),
        ]);

        if (cancelled) return;

        setCategories(
          categoryList.map((category) => ({
            name: category.name,
            count: Number(category.count) || 0,
          })),
        );

        setPriceBounds([
          Math.floor(Number(filters?.price?.min) || 0),
          Math.ceil(Number(filters?.price?.max) || 0),
        ]);

        setSaleCount(Number(sale?.total) || 0);
      } catch (err) {
        if (!cancelled) {
          console.error("[Shop] could not load filters:", err.message);
        }
      }
    }

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, priceBounds, saleCount };
}

// Fetch newest products for the sidebar and featured section.
function useShopExtras() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadExtras() {
      try {
        const data = await shopService.getProducts({
          sort: "latest",
          page: 1,
          limit: 12,
        });

        if (!cancelled) {
          setItems((data?.products || []).map(normalizeProduct));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[Shop] could not load latest products:", err.message);
        }
      }
    }

    loadExtras();

    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}

// Fetch a page, cancel outdated requests, and prefetch the next page.

function useProductPage(query) {
  const [data, setData] = useState({
    products: [],
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const params = JSON.parse(queryKey);

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await shopService.getProducts(params, {
          signal: controller.signal,
        });

        if (!active) return;

        // Support common API response shapes.
        const result = response?.data ?? response;
        const payload = result?.data ?? result;

        const products = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.products)
            ? payload.products
            : Array.isArray(payload?.rows)
              ? payload.rows
              : [];

        const total =
          Number(
            payload?.total ??
              payload?.count ??
              result?.total ??
              products.length,
          ) || 0;

        const totalPages =
          Number(
            payload?.totalPages ??
              payload?.pages ??
              result?.totalPages ??
              Math.ceil(total / PAGE_SIZE),
          ) || 0;

        setData({
          products: products.map(normalizeProduct),
          total,
          totalPages,
        });
      } catch (err) {
        if (
          !active ||
          controller.signal.aborted ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("[Shop] Product fetch failed:", err);

        setData({
          products: [],
          total: 0,
          totalPages: 0,
        });

        setError(errorMessage(err));
      } finally {
        if (active && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [queryKey]);

  return { ...data, loading, error };
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------
function ColorDots({ sx = {} }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: "4px", lg: "6px" },
        alignItems: "center",
        ...sx,
      }}
    >
      {DOTS.map((color) => (
        <Box
          key={color}
          sx={{
            width: { xs: 9, lg: 13 },
            height: { xs: 9, lg: 13 },
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

function ProductImage({ src, alt = "", pad = "8%", fit = "contain" }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: pad,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        onError={onImgError}
        loading="lazy"
        decoding="async"
        sx={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: fit,
          objectPosition: "center",
          display: "block",
          border: "none",
          transition: `transform .6s ${EASE}`,
        }}
      />
    </Box>
  );
}

function SectionHeader({ title }) {
  return (
    <Reveal>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 3, md: "52px", lg: "77px" },
        }}
      >
        <Typography sx={H2}>{title}</Typography>
        <Button
          variant="outlined"
          onClick={scrollToProducts}
          sx={{
            width: { xs: 100, md: 130, lg: 160 },
            height: { xs: 40, md: 44, lg: 50 },
            borderRadius: 0,
            borderColor: "var(--c-111111)",
            color: "var(--c-111111)",
            fontSize: { xs: 14, lg: 16 },
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

function CountPill({ value = 0 }) {
  return (
    <Box
      sx={{
        minWidth: { xs: 22, lg: 34 },
        height: { xs: 14, lg: 18 },
        px: "4px",
        border: "1px solid #999",
        borderRadius: "10px",
        fontSize: { xs: 9, lg: 11 },
        lineHeight: { xs: "12px", lg: "16px" },
        color: "var(--c-777777)",
        textAlign: "center",
        flexShrink: 0,
        transition: "border-color .25s ease, color .25s ease",
      }}
    >
      {value}
    </Box>
  );
}

function QuickCategories({ categories, onSelect }) {
  if (!categories.length) return null;

  return (
    <Box sx={{ bgcolor: "var(--c-f8f8f8)", px: SIDE }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: { xs: "wrap", md: "nowrap" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 2.5, md: 2 },
          minHeight: { xs: "auto", md: 130, lg: 184 },
          py: { xs: 3, md: 0 },
        }}
      >
        {categories.map(({ name, count }, index) => (
          <Reveal
            key={name}
            delay={stagger(index, 100)}
            sx={{ flex: { xs: "1 1 40%", md: "0 0 auto" } }}
          >
            <ButtonBase
              onClick={() => onSelect(name)}
              disableRipple
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: "12px", lg: "16px" },
                justifyContent: "flex-start",
                textAlign: "left",
                "&:hover .fs-quick-icon": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 18px rgba(0,0,0,.1)",
                },
                "&:hover .fs-quick-icon img": {
                  transform: "scale(1.12)",
                },
                "&:hover .fs-quick-name": { color: BROWN },
              }}
            >
              <Box
                className="fs-quick-icon"
                sx={{
                  width: { xs: 44, md: 48, lg: 64 },
                  height: { xs: 44, md: 48, lg: 64 },
                  bgcolor: "var(--c-ffffff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: { xs: "8px", lg: "12px" },
                  transition: `transform .35s ${EASE}, box-shadow .35s ease`,
                }}
              >
                <Box
                  component="img"
                  src={CATEGORY_ICONS[name.toLowerCase()] || Decor}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    transition: `transform .35s ${EASE}`,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  className="fs-quick-name"
                  sx={{
                    fontSize: { xs: 14, md: 15, lg: 18 },
                    fontWeight: 600,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                    transition: "color .25s ease",
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 11, md: 12, lg: 14 },
                    color: "var(--c-777777)",
                    lineHeight: 1.5,
                  }}
                >
                  {count} {count === 1 ? "product" : "products"}
                </Typography>
              </Box>
            </ButtonBase>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

function CheckRow({ label, count, checked, onChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: ROW_PY,
        "&:hover .fs-check-label": {
          color: BROWN,
          transform: "translateX(3px)",
        },
        "&:hover .fs-pill": { borderColor: BROWN, color: BROWN },
      }}
    >
      <Box
        component="label"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: "8px", lg: "10px" },
          cursor: "pointer",
        }}
      >
        <Checkbox
          checked={checked}
          onChange={onChange}
          disableRipple
          sx={{
            p: 0,
            color: "var(--c-9a9a9a)",
            transition: "transform .2s ease",
            "&:active": { transform: "scale(.85)" },
            "&.Mui-checked": { color: BROWN },
            "& .MuiSvgIcon-root": { fontSize: { xs: 16, lg: 18 } },
          }}
        />
        <Typography
          className="fs-check-label"
          sx={{
            ...OPTION_TEXT,
            transition: "color .25s ease, transform .25s ease",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box className="fs-pill" sx={{ display: "contents" }}>
        <CountPill value={count} />
      </Box>
    </Box>
  );
}

function FilterGroup({
  title,
  collapsible,
  defaultOpen = false,
  mb,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <Box sx={{ mb }}>
        <Typography sx={FILTER_TITLE}>{title}</Typography>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: "1px solid var(--c-eeeeee)" }}>
      <ButtonBase
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        disableRipple
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: "14px",
          textAlign: "left",
        }}
      >
        <Typography sx={{ ...FILTER_TITLE, mb: 0 }}>{title}</Typography>
        <KeyboardArrowDown
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </ButtonBase>
      <Collapse in={open}>
        <Box sx={{ pb: 2 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

function Sidebar({
  priceBounds,
  price,
  setPrice,
  commitPrice,
  categoryOptions,
  cats,
  toggleCat,
  latest,
  onDetail,
  collapsible = false,
}) {
  const groupMb = { xs: "28px", md: "32px", lg: "44px" };

  return (
    <Box sx={{ width: "100%" }}>
      {priceBounds[1] > priceBounds[0] && (
        <FilterGroup
          title="Filter by Price"
          collapsible={collapsible}
          defaultOpen
          mb={groupMb}
        >
          <Slider
            value={price}
            min={priceBounds[0]}
            max={priceBounds[1]}
            onChange={(_, value) => setPrice(value)}
            onChangeCommitted={(_, value) => commitPrice(value)}
            disableSwap
            sx={{
              color: BROWN,
              height: 3,
              py: "10px",
              display: "block",
              width: "calc(100% - 16px)",
              mx: "8px",
              "& .MuiSlider-rail": { opacity: 1, bgcolor: BROWN },
              "& .MuiSlider-track": { border: "none", bgcolor: BROWN },
              "& .MuiSlider-thumb": {
                width: { xs: 12, lg: 16 },
                height: { xs: 12, lg: 16 },
                bgcolor: "var(--c-ffffff)",
                border: `2px solid ${BROWN}`,
                boxShadow: "none",
                transition: "transform .2s ease, box-shadow .2s ease",
                "&:hover, &.Mui-focusVisible, &.Mui-active": {
                  transform: "translate(-50%, -50%) scale(1.3)",
                  boxShadow: "0 0 0 6px rgba(148,116,88,.18)",
                },
              },
            }}
          />
          <Typography
            sx={{
              fontSize: { xs: 13, md: 14, lg: 16 },
              color: "var(--c-777777)",
              mt: "8px",
            }}
          >
            Price:{" "}
            <b style={{ color: "var(--c-111111)", fontWeight: 600 }}>
              ${price[0]} - ${price[1]}
            </b>
          </Typography>
        </FilterGroup>
      )}

      {categoryOptions.length > 0 && (
        <FilterGroup
          title="Filter by Categories"
          collapsible={collapsible}
          defaultOpen
          mb={groupMb}
        >
          {categoryOptions.map(({ name, count }) => (
            <CheckRow
              key={name}
              label={name}
              count={count}
              checked={cats.includes(name)}
              onChange={() => toggleCat(name)}
            />
          ))}
        </FilterGroup>
      )}

      {latest.length > 0 && (
        <FilterGroup title="Latest Products" collapsible={collapsible}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: "10px", lg: "12px" },
            }}
          >
            {latest.map((item) => (
              <ButtonBase
                key={item.id}
                onClick={() => onDetail(item)}
                disableRipple
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  gap: { xs: "10px", lg: "14px" },
                  transition: "transform .3s ease",
                  "&:hover": { transform: "translateX(4px)" },
                  "&:hover img": { transform: "scale(1.1)" },
                  "&:hover .fs-latest-name": { color: BROWN },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 64, lg: 80 },
                    aspectRatio: "1 / 1",
                    flexShrink: 0,
                    bgcolor: GRAY_BG,
                    overflow: "hidden",
                  }}
                >
                  <ProductImage src={item.img} alt={item.name} pad="6%" />
                </Box>
                <Box>
                  <Typography
                    className="fs-latest-name"
                    sx={{
                      fontSize: { xs: 12, lg: 14 },
                      color: "var(--c-111111)",
                      lineHeight: 1.4,
                      transition: "color .25s ease",
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 14 },
                      fontWeight: 700,
                      color: "var(--c-111111)",
                      lineHeight: 1.4,
                    }}
                  >
                    ${item.price}
                  </Typography>
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </FilterGroup>
      )}
    </Box>
  );
}

function ProductCardBase({ product, onDetail }) {
  const [active, setActive] = useState(false);

  const handlePointerEnter = useCallback((event) => {
    if (event.pointerType === "mouse") setActive(true);
  }, []);

  const handlePointerLeave = useCallback((event) => {
    if (event.pointerType === "mouse") setActive(false);
  }, []);

  const handleImageClick = useCallback((event) => {
    const type = event.nativeEvent.pointerType;
    if (type === "touch" || type === "pen") {
      setActive((previous) => !previous);
    }
  }, []);

  const handleDetailClick = useCallback(
    (event) => {
      event.stopPropagation();
      onDetail(product);
    },
    [onDetail, product],
  );

  return (
    <Box
      sx={{
        textAlign: "center",
        "&:hover .fs-card-name": { color: BROWN },
        "&:hover .fs-card-frame": {
          boxShadow: "0 14px 28px rgba(0,0,0,.1)",
        },
      }}
    >
      <Box
        className="fs-card-frame"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleImageClick}
        sx={{
          position: "relative",
          bgcolor: GRAY_BG,
          width: "100%",
          aspectRatio: "306 / 350",
          mb: { xs: "12px", lg: "20px" },
          overflow: "hidden",
          cursor: "pointer",
          transition: "box-shadow .4s ease",
        }}
      >
        <Box
          component="img"
          src={product.img}
          alt={product.name}
          onError={onImgError}
          loading="lazy"
          decoding="async"
          sx={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            p: { xs: "12px", md: "18px", lg: "24px" },
            boxSizing: "border-box",
            opacity: product.soldOut ? 0.55 : 1,
            transform: active ? "scale(1.04)" : "none",
            filter: active ? "blur(3px)" : "none",
            transition: "transform 0.3s ease, filter 0.3s ease",
          }}
        />

        {product.badge && (
          <Box
            sx={{
              position: "absolute",
              top: { xs: 10, lg: 22 },
              left: { xs: 10, lg: 22 },
              px: { xs: "10px", lg: "14px" },
              py: { xs: "3px", lg: "5px" },
              fontSize: { xs: 11, lg: 15 },
              lineHeight: 1.5,
              color: "#fff",
              bgcolor: BADGE_COLORS[product.badge] || "#1a1a1a",
              zIndex: 1,
              animation: `fs-popIn .5s ${EASE} .3s both`,
            }}
          >
            {product.badge}
          </Box>
        )}

        <Button
          onClick={handleDetailClick}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: active
              ? "translate(-50%, -50%)"
              : "translate(-50%, -40%)",
            opacity: active ? 1 : 0,
            pointerEvents: active ? "auto" : "none",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            zIndex: 2,
            minWidth: { xs: 96, lg: 130 },
            height: { xs: 36, lg: 44 },
            px: 2,
            borderRadius: 0,
            bgcolor: "var(--c-ffffff)",
            color: "var(--c-111111)",
            fontSize: { xs: 13, lg: 15 },
            fontWeight: 600,
            textTransform: "none",
            whiteSpace: "nowrap",
            boxShadow: "none",
            "&:hover": { bgcolor: BROWN, color: "#fff" },
          }}
        >
          View Details
        </Button>
      </Box>

      <Typography
        className="fs-card-name"
        sx={{
          fontSize: { xs: 14, md: 16, lg: 20 },
          fontWeight: 600,
          color: "var(--c-111111)",
          lineHeight: 1.4,
          transition: "color .25s ease",
        }}
      >
        {product.name}
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 13, md: 14, lg: 16 },
          color: "var(--c-555555)",
          lineHeight: 1.7,
        }}
      >
        ${product.price}{" "}
        {product.oldPrice && (
          <s style={{ color: "var(--c-888888)", marginLeft: 6 }}>
            ${product.oldPrice}
          </s>
        )}
      </Typography>
      <ColorDots sx={{ justifyContent: "center", mt: "6px" }} />
    </Box>
  );
}

const ProductCard = memo(ProductCardBase);

function ProductSkeletons({ count = PAGE_SIZE }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
        columnGap: { xs: 1.5, md: "16px", lg: "24px" },
        rowGap: { xs: 3, md: "20px", lg: "34px" },
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box key={index}>
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{
              width: "100%",
              aspectRatio: "306 / 350",
              mb: 1.5,
            }}
          />
          <Skeleton animation="wave" width="70%" sx={{ mx: "auto" }} />
          <Skeleton animation="wave" width="30%" sx={{ mx: "auto" }} />
        </Box>
      ))}
    </Box>
  );
}

function Pagination({ page, pages, onChange }) {
  const boxSx = (active) => ({
    width: { xs: 30, lg: 42 },
    height: { xs: 30, lg: 42 },
    border: `1px solid ${BROWN}`,
    bgcolor: active ? BROWN : "var(--c-ffffff)",
    color: active ? "#fff" : BROWN,
    fontSize: { xs: 13, lg: 16 },
    fontWeight: 600,
    transition:
      "transform .25s ease, background-color .25s ease, color .25s ease",
    transform: active ? "scale(1.08)" : "none",
    "&:hover": {
      transform: "translateY(-3px)",
      bgcolor: active ? BROWN : "var(--c-f4f2f0)",
    },
  });

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: { xs: "center", md: "flex-end" },
        alignItems: "center",
        gap: "12px",
        mt: { xs: 4, md: "40px", lg: "50px" },
        minHeight: { xs: 30, lg: 42 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: "6px", lg: "8px" },
          position: { md: "absolute" },
          left: { md: "50%" },
          transform: { md: "translateX(-50%)" },
        }}
      >
        {Array.from({ length: pages }, (_, index) => index + 1).map(
          (number) => (
            <ButtonBase
              key={number}
              onClick={() => number !== page && onChange(number)}
              aria-label={`Page ${number}`}
              aria-current={number === page ? "page" : undefined}
              sx={boxSx(number === page)}
            >
              {number}
            </ButtonBase>
          ),
        )}
      </Box>

      <Button
        variant="outlined"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        endIcon={
          <ChevronRight
            sx={{ fontSize: 18, transition: "transform .25s ease" }}
          />
        }
        sx={{
          height: { xs: 30, lg: 40 },
          minWidth: { xs: 72, lg: 106 },
          borderRadius: 0,
          borderColor: BROWN,
          color: "var(--c-555555)",
          fontSize: { xs: 13, lg: 16 },
          fontWeight: 600,
          textTransform: "none",
          "&:hover": { borderColor: BROWN, bgcolor: "transparent" },
          "&:hover .MuiSvgIcon-root": { transform: "translateX(4px)" },
          "&.Mui-disabled": {
            borderColor: "var(--c-d8cfc6)",
            color: "var(--c-aaaaaa)",
          },
        }}
      >
        Next
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main shop section
// ---------------------------------------------------------------------------
function ShopMain({ latest, onDetail }) {
  const { categories, priceBounds, saleCount } = useShopFilters();
  const [price, setPrice] = useState([0, 0]);
  const [priceRange, setPriceRange] = useState(null);
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("categories") || "";
  const urlPage = Number(searchParams.get("page")) || 1;

  const [cats, setCats] = useState(() => (urlCategory ? [urlCategory] : []));
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [search, setSearch] = useState(urlSearch.trim());
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(urlPage);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const nextSearch = (searchParams.get("search") || "").trim();
    const nextCategory = searchParams.get("categories") || "";
    const nextPage = Math.max(1, Number(searchParams.get("page")) || 1);

    // eslint-disable-next-line
    setSearchInput(nextSearch);
    setSearch(nextSearch);
    setCats(nextCategory ? [nextCategory] : []);
    setPage(nextPage);
  }, [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line
    setPrice(priceBounds);
    setPriceRange(null);
  }, [priceBounds]);

  useEffect(() => {
    const term = searchInput.trim();
    if (term === search) return undefined;

    const timer = setTimeout(() => {
      log("search:", term || "(cleared)");
      setSearch(term);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const categoryOptions = useMemo(() => {
    const list = [...categories].sort((a, b) => a.name.localeCompare(b.name));

    if (saleCount > 0) list.push({ name: SALE, count: saleCount });
    return list;
  }, [categories, saleCount]);

  const quickCategories = useMemo(
    () => [...categories].sort((a, b) => b.count - a.count).slice(0, 5),
    [categories],
  );

  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sort,
      search: search || undefined,
      categories: cats.filter((category) => category !== SALE),
      onSale: cats.includes(SALE) || undefined,
      minPrice: priceRange ? priceRange[0] : undefined,
      maxPrice: priceRange ? priceRange[1] : undefined,
    }),
    [page, sort, search, cats, priceRange],
  );

  const {
    products: visible,
    total,
    totalPages: pages,
    loading,
    error: loadError,
  } = useProductPage(query);

  useEffect(() => {
    if (!loading && pages > 0 && page > pages) {
      // eslint-disable-next-line
      setPage(pages);
    }
  }, [loading, pages, page]);

  const start = (page - 1) * PAGE_SIZE;

  const gridKey = `${page}|${sort}|${cats.join(",")}|${search}|${
    priceRange ? priceRange.join("-") : ""
  }`;

  const toggleCat = useCallback((value) => {
    log("category toggled:", value);
    setCats((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
    setPage(1);
  }, []);

  const commitPrice = useCallback(
    (value) => {
      const changed =
        value[0] !== priceBounds[0] || value[1] !== priceBounds[1];

      log("price applied:", value);
      setPriceRange(changed ? value : null);
      setPage(1);
    },
    [priceBounds],
  );

  const goToPage = useCallback((nextPage) => {
    log("page clicked:", nextPage);
    setPage(nextPage);
    scrollToProducts();
  }, []);

  const activeFilters = cats.length + (priceRange ? 1 : 0) + (search ? 1 : 0);

  const clearAll = useCallback(() => {
    log("filters cleared");
    setPrice(priceBounds);
    setPriceRange(null);
    setCats([]);
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, [priceBounds]);

  const selectQuickCategory = useCallback((name) => {
    log("quick category:", name);
    setCats([name]);
    setPage(1);
    scrollToProducts();
  }, []);

  const renderSidebar = (collapsible) => (
    <Sidebar
      priceBounds={priceBounds}
      price={price}
      setPrice={setPrice}
      commitPrice={commitPrice}
      categoryOptions={categoryOptions}
      cats={cats}
      toggleCat={toggleCat}
      latest={latest}
      onDetail={onDetail}
      collapsible={collapsible}
    />
  );

  const statusText = loading
    ? "Loading products..."
    : loadError
      ? "Products unavailable"
      : total === 0
        ? "No results found"
        : `Showing ${start + 1}-${start + visible.length} of ${total} results`;

  return (
    <>
      <QuickCategories
        categories={quickCategories}
        onSelect={selectQuickCategory}
      />

      <Box
        sx={{
          px: SIDE,
          pt: { xs: 4, md: "44px", lg: "60px" },
          pb: { xs: 6, md: "48px", lg: "58px" },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "23.6% minmax(0, 1fr)",
          },
          columnGap: { md: "16px", lg: "22px" },
          rowGap: 5,
          alignItems: "start",
        }}
      >
        <Box sx={{ order: 1, display: { xs: "none", md: "block" } }}>
          <Reveal direction="left">{renderSidebar(false)}</Reveal>
        </Box>

        <Box
          id="shop-products"
          sx={{
            order: { xs: 1, md: 2 },
            minWidth: 0,
            scrollMarginTop: "20px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
              mb: { xs: 2, md: "20px", lg: "24px" },
            }}
          >
            <Typography
              key={statusText}
              sx={{
                width: { xs: "100%", md: "auto" },
                fontSize: { xs: 13, md: 16, lg: 20 },
                fontWeight: 500,
                color: "var(--c-777777)",
                animation: "fs-fadeIn .4s ease both",
              }}
            >
              {statusText}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: { xs: "wrap", md: "nowrap" },
                gap: 1.5,
                width: { xs: "100%", md: "auto" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  height: { xs: 34, lg: 40 },
                  border: `1px solid ${BROWN}`,
                  width: { xs: "100%", md: 200, lg: 220 },
                  transition: "box-shadow .25s ease, width .3s ease",
                  "&:focus-within": {
                    boxShadow: "0 0 0 3px rgba(148,116,88,.2)",
                    width: { md: 240, lg: 270 },
                  },
                }}
              >
                <SearchOutlined sx={{ fontSize: 18, color: BROWN }} />
                <InputBase
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search products"
                  inputProps={{ "aria-label": "Search products" }}
                  sx={{ flex: 1, fontSize: { xs: 13, lg: 15 } }}
                />
              </Box>

              <Button
                variant="outlined"
                onClick={() => setFilterOpen(true)}
                startIcon={<TuneOutlined sx={{ fontSize: 18 }} />}
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  flex: 1,
                  height: 34,
                  borderRadius: 0,
                  borderColor: BROWN,
                  color: "var(--c-555555)",
                  fontSize: 13,
                  textTransform: "none",
                }}
              >
                Filter{activeFilters > 0 ? ` (${activeFilters})` : ""}
              </Button>

              <Select
                value={sort}
                onChange={(event) => {
                  log("sort changed:", event.target.value);
                  setSort(event.target.value);
                  setPage(1);
                }}
                size="small"
                IconComponent={KeyboardArrowDown}
                MenuProps={{ disableScrollLock: true }}
                sx={{
                  flex: { xs: 1, md: "none" },
                  minWidth: { xs: 0, md: 150, lg: 175 },
                  height: { xs: 34, lg: 40 },
                  borderRadius: 0,
                  fontSize: { xs: 13, lg: 16 },
                  color: "var(--c-555555)",
                  "& fieldset": { borderColor: BROWN, borderWidth: 1 },
                }}
              >
                {SORTS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {loading ? (
            <ProductSkeletons />
          ) : loadError ? (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
                animation: "fs-fadeIn .5s ease both",
              }}
            >
              <Typography sx={{ color: "var(--c-777777)", mb: 2 }}>
                {loadError}
              </Typography>
            </Box>
          ) : visible.length > 0 ? (
            <Box
              key={gridKey}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  md: "repeat(3, 1fr)",
                },
                columnGap: { xs: 1.5, md: "16px", lg: "24px" },
                rowGap: { xs: 3, md: "20px", lg: "34px" },
              }}
            >
              {visible.map((product, index) => (
                <Reveal key={product.id} delay={stagger(index % 3, 110)}>
                  <ProductCard product={product} onDetail={onDetail} />
                </Reveal>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
                animation: "fs-fadeIn .5s ease both",
              }}
            >
              <Typography sx={{ color: "var(--c-777777)", mb: 2 }}>
                {activeFilters > 0
                  ? "No products match your filters."
                  : "No products available right now."}
              </Typography>
              {activeFilters > 0 && (
                <Button
                  variant="outlined"
                  onClick={clearAll}
                  sx={{
                    borderRadius: 0,
                    borderColor: BROWN,
                    color: BROWN,
                    textTransform: "none",
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          )}

          {!loadError && pages > 1 && (
            <Pagination page={page} pages={pages} onChange={goToPage} />
          )}
        </Box>

        <Drawer
          anchor="left"
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          sx={{ display: { md: "none" } }}
          PaperProps={{
            sx: {
              width: { xs: "88%", sm: 360 },
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              height: 60,
              borderBottom: "1px solid var(--c-eeeeee)",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              Filters
            </Typography>
            <IconButton
              onClick={() => setFilterOpen(false)}
              aria-label="Close filters"
              sx={{
                transition: "transform .3s ease",
                "&:hover": { transform: "rotate(90deg)" },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 1 }}>
            {renderSidebar(true)}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              p: 2,
              borderTop: "1px solid var(--c-eeeeee)",
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              onClick={clearAll}
              sx={{
                flex: 1,
                height: 44,
                borderRadius: 0,
                borderColor: BROWN,
                color: "var(--c-555555)",
                textTransform: "none",
              }}
            >
              Clear all
            </Button>

            <Button
              onClick={() => setFilterOpen(false)}
              sx={{
                flex: 1.4,
                height: 44,
                borderRadius: 0,
                bgcolor: BROWN,
                color: "#fff",
                textTransform: "none",
                "&:hover": { bgcolor: "#7d6048" },
              }}
            >
              Show {total} results
            </Button>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}

// ---------------------------------------------------------------------------
// Services section
// ---------------------------------------------------------------------------
function Services() {
  return (
    <Box sx={{ bgcolor: "var(--c-f8f8f8)", px: SIDE }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: { xs: 3, md: 2 },
          minHeight: { xs: "auto", md: 130, lg: 187 },
          py: { xs: 4, md: 0 },
        }}
      >
        {SERVICES.map(({ Icon, title, text }, index) => (
          <Reveal key={title} delay={stagger(index, 150)}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: "14px", lg: "20px" },
                "&:hover .fs-service-icon": {
                  color: BROWN,
                  transform: "translateY(-6px) scale(1.12)",
                },
              }}
            >
              <Icon
                className="fs-service-icon"
                sx={{
                  fontSize: { xs: 38, md: 42, lg: 56 },
                  color: "var(--c-111111)",
                  flexShrink: 0,
                  transition:
                    "transform .35s cubic-bezier(.3,1.6,.5,1), color .25s ease",
                }}
              />
              <Box sx={{ maxWidth: { xs: 260, lg: 300 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: 15, md: 16, lg: 20 },
                    fontWeight: 600,
                    color: "var(--c-111111)",
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 11, md: 12, lg: 14 },
                    color: "var(--c-777777)",
                    lineHeight: 1.6,
                  }}
                >
                  {text}
                </Typography>
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Featured products
// ---------------------------------------------------------------------------
function Featured({ products, onDetail }) {
  const [wishlistVersion, setWishlistVersion] = useState(0);
  const wishedIds = useMemo(
    () => getWishlist().map((item) => String(item.id)),
    // eslint-disable-next-line
    [wishlistVersion],
  );

  const featured = useMemo(() => {
    const highlighted = products.filter(
      (product) => product.isSale || product.isNew,
    );
    const highlightedIds = new Set(highlighted.map((product) => product.id));
    const rest = products.filter((product) => !highlightedIds.has(product.id));

    return [...highlighted, ...rest].slice(0, 3);
  }, [products]);

  const handleWishlistToggle = useCallback((event, product) => {
    event.stopPropagation();
    toggleWishlist(product);
    setWishlistVersion((version) => version + 1);
  }, []);

  if (!featured.length) return null;

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <SectionHeader title="Featured Products" />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: { xs: 3, md: "16px", lg: "24px" },
        }}
      >
        {featured.map((product, index) => {
          const wished = wishedIds.includes(String(product.id));

          return (
            <Reveal key={product.id} delay={stagger(index, 150)}>
              <Box
                sx={{
                  "&:hover .fs-feat-frame": {
                    boxShadow: "0 16px 32px rgba(0,0,0,.12)",
                  },
                  "&:hover .fs-feat-frame img": {
                    transform: "scale(1.07)",
                  },
                  "&:hover .fs-feat-name": { color: BROWN },
                }}
              >
                <Box
                  className="fs-feat-frame"
                  onClick={() => onDetail(product)}
                  sx={{
                    position: "relative",
                    bgcolor: GRAY_BG,
                    aspectRatio: "1 / 1.15",
                    mb: { xs: "14px", lg: "18px" },
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow .4s ease",
                  }}
                >
                  <ProductImage
                    src={product.img}
                    alt={product.name}
                    pad={{ xs: "12px", md: "20px", lg: "20px" }}
                    fit="contain"
                  />

                  <IconButton
                    size="small"
                    aria-label="Add to wishlist"
                    onClick={(event) => handleWishlistToggle(event, product)}
                    sx={{
                      position: "absolute",
                      right: { xs: 10, lg: 14 },
                      bottom: { xs: 10, lg: 14 },
                      width: { xs: 32, lg: 44 },
                      height: { xs: 32, lg: 44 },
                      bgcolor: "var(--c-ffffff)",
                      color: wished ? "#FF5252" : "var(--c-333333)",
                      transition: "transform .25s ease",
                      "&:hover": {
                        bgcolor: "var(--c-ffffff)",
                        transform: "scale(1.12)",
                      },
                    }}
                  >
                    {wished ? (
                      <Favorite
                        sx={{
                          fontSize: { xs: 17, lg: 22 },
                          animation: "fs-heartPop .45s ease both",
                        }}
                      />
                    ) : (
                      <FavoriteBorder sx={{ fontSize: { xs: 17, lg: 22 } }} />
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
                    className="fs-feat-name"
                    sx={{
                      fontSize: { xs: 15, md: 17, lg: 22 },
                      fontWeight: 700,
                      color: "var(--c-111111)",
                      transition: "color .25s ease",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <ColorDots />
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: 13, md: 14, lg: 16 },
                    color: "var(--c-111111)",
                    mt: "6px",
                  }}
                >
                  ${product.price}{" "}
                  {product.oldPrice && (
                    <s style={{ color: "var(--c-888888)", marginLeft: 6 }}>
                      ${product.oldPrice}
                    </s>
                  )}
                </Typography>
              </Box>
            </Reveal>
          );
        })}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Shop page
// ---------------------------------------------------------------------------
export default function Shop() {
  const extras = useShopExtras();
  const latest = useMemo(() => extras.slice(0, 4), [extras]);

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("furniture_cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("furniture_cart", JSON.stringify(cart));
    } catch {
      // Ignore unavailable storage.
    }
  }, [cart]);

  const openDetail = useCallback((product) => {
    log("open product:", product.id, product.name);
    setSelected(product);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const addToCart = useCallback((product, color, qty) => {
    const key = `${product.id}-${color}`;
    log("add to cart:", product.id, color, qty);

    setCart((previous) => {
      const exists = previous.find((item) => item.key === key);

      if (exists) {
        return previous.map((item) =>
          item.key === key ? { ...item, qty: item.qty + qty } : item,
        );
      }

      return [
        ...previous,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img,
          color,
          qty,
        },
      ];
    });

    setModalOpen(false);
    setSnackbarOpen(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart],
  );

  return (
    <Box
      className="fs-shop"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        overflowX: "clip",
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />

      <ShopMain latest={latest} onDetail={openDetail} />

      <Services />

      {extras.length > 0 && (
        <LazySection minHeight={480}>
          <Featured products={extras} onDetail={openDetail} />
        </LazySection>
      )}

      <LazySection minHeight={200}>
        <Suspense fallback={<Box sx={{ minHeight: 200 }} />}>
          <Footer />
        </Suspense>
      </LazySection>

      <ProductModal
        product={selected}
        open={modalOpen}
        onClose={closeModal}
        onAddToCart={addToCart}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%", bgcolor: BROWN }}
        >
          Product successfully added to cart!
        </Alert>
      </Snackbar>

      <Fab
        component={Link}
        to="/cart"
        aria-label="Open cart"
        sx={{
          position: "fixed",
          right: { xs: 16, md: 28 },
          bottom: { xs: 16, md: 28 },
          bgcolor: BROWN,
          color: "#fff",
          animation: `fs-popIn .6s ${EASE} .8s backwards`,
          "&:hover": { bgcolor: "#7d6048" },
        }}
      >
        <Box
          key={cartCount}
          sx={{
            display: "flex",
            animation: cartCount > 0 ? "fs-bump .5s ease" : "none",
          }}
        >
          <Badge badgeContent={cartCount} color="error" showZero={false}>
            <ShoppingBagOutlined sx={{ color: "#fff" }} />
          </Badge>
        </Box>
      </Fab>
    </Box>
  );
}
