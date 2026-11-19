import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography, Button, IconButton, Drawer, InputBase, Select, MenuItem } from "@mui/material";
import { Close, SearchOutlined, TuneOutlined, KeyboardArrowDown } from "@mui/icons-material";
import { BROWN, PAGE_SIZE, SALE, SEARCH_DEBOUNCE_MS, SIDE, SORTS, scrollToProducts } from "../../features/shop/shopConstants";
import { useShopFilters, useProductPage } from "../../hooks/shop/useShopProducts";
import { QuickCategories, Sidebar } from "./ShopShared";
import { ProductCard, ProductSkeletons, Pagination } from "./ShopProductGrid";
import { Reveal } from "./ShopMotion";
import { stagger } from "../../features/shop/shopMotionStyles";

export default function ShopMain({ latest, onDetail }) {
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
      setSearch(term);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const categoryOptions = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  if (saleCount > 0) {
    categoryOptions.push({ name: SALE, count: saleCount });
  }

  const quickCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Keep the request options stable so the products hook fetches only on filter changes.
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

  const gridKey = `${page}|${sort}|${cats.join(",")}|${search}|${priceRange ? priceRange.join("-") : ""
    }`;

  function toggleCat(value) {
    setCats((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
    setPage(1);
  }

  function commitPrice(value) {
    const changed =
      value[0] !== priceBounds[0] || value[1] !== priceBounds[1];

    setPriceRange(changed ? value : null);
    setPage(1);
  }

  function goToPage(nextPage) {
    setPage(nextPage);
    scrollToProducts();
  }

  const activeFilters = cats.length + (priceRange ? 1 : 0) + (search ? 1 : 0);

  function clearAll() {
    setPrice(priceBounds);
    setPriceRange(null);
    setCats([]);
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function selectQuickCategory(name) {
    setCats([name]);
    setPage(1);
    scrollToProducts();
  }

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
