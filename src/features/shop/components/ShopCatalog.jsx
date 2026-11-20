import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  Close,
  KeyboardArrowDown,
  SearchOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import {
  PAGE_SIZE,
  SIDE,
  BROWN,
  scrollToProducts,
} from "../shopConstants";
import {
  useProductPage,
  useShopFilters,
} from "../hooks/useShopProducts";
import { QuickCategories, Sidebar } from "./ShopShared";
import {
  Pagination,
  ProductCard,
  ProductSkeletons,
} from "./ShopProductGrid";

export default function ShopMain({ onDetail }) {
  const [searchParams] = useSearchParams();

  const [searchText, setSearchText] = useState(
    searchParams.get("search") || "",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categories, setCategories] = useState(
    searchParams.get("categories")
      ? [searchParams.get("categories")]
      : [],
  );
  const [price, setPrice] = useState([0, 0]);
  const [priceFilter, setPriceFilter] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [visual, setVisual] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    categories: categoryList,
    priceBounds,
    saleCount,
    colorOptions,
    materialOptions,
    brandOptions,
    loading: filtersLoading,
    error: filtersError,
  } = useShopFilters();

  useEffect(() => {
    const timer = setTimeout(() => setPrice(priceBounds), 0);
    return () => clearTimeout(timer);
  }, [priceBounds]);

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("categories") || "";

    const timer = setTimeout(() => {
      setSearchText(urlSearch);
      setSearch(urlSearch);
      setCategories(urlCategory ? [urlCategory] : []);
      setPage(Math.max(1, Number(searchParams.get("page")) || 1));
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);

  const query = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort,
      search: search || undefined,
      categories: categories.length > 0 ? categories : undefined,
      minPrice: priceFilter ? priceFilter[0] : undefined,
      maxPrice: priceFilter ? priceFilter[1] : undefined,
    }),
    [sort, search, categories, priceFilter],
  );

  const { products: apiProducts, loading, error } = useProductPage(query);

  const products = useMemo(() => {
    return apiProducts.filter((product) => {
      const colors = String(product.color || product.colors || "")
        .split(/[,/&]/)
        .map((value) => value.trim())
        .filter(Boolean);
      const materials = product.materials || [];
      const brands = String(product.brand || "")
        .split(/[,/&]/)
        .map((value) => value.trim())
        .filter(Boolean);

      const colorMatches =
        selectedColors.length === 0 ||
        selectedColors.some((color) =>
          colors.some(
            (productColor) =>
              productColor.toLowerCase() === color.toLowerCase(),
          ),
        );
      const materialMatches =
        selectedMaterials.length === 0 ||
        selectedMaterials.some((material) =>
          materials.some(
            (productMaterial) =>
              productMaterial.toLowerCase() === material.toLowerCase(),
          ),
        );
      const brandMatches =
        selectedBrands.length === 0 ||
        selectedBrands.some((brand) =>
          brands.some(
            (productBrand) =>
              productBrand.toLowerCase() === brand.toLowerCase(),
          ),
        );
      const searchText = [
        product.name,
        product.description,
        product.category,
      ]
        .join(" ")
        .toLowerCase();
      const visualMatches =
        visual === "" || searchText.includes(visual.toLowerCase());

      return (
        colorMatches &&
        materialMatches &&
        brandMatches &&
        visualMatches
      );
    });
  }, [
    apiProducts,
    selectedColors,
    selectedMaterials,
    selectedBrands,
    visual,
  ]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleProducts = products.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  function goToPage(nextPage) {
    setPage(nextPage);

    const shopProducts = document.getElementById("shop-products");
    if (shopProducts) {
      shopProducts.scrollIntoView({ behavior: "smooth" });
    }
  }

  function clearFilters() {
    setSearchText("");
    setSearch("");
    setCategories([]);
    setPrice(priceBounds);
    setPriceFilter(null);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    setVisual("");
    setSort("latest");
    setPage(1);
  }

  function toggleCategory(categoryName) {
    setPage(1);
    setCategories((oldCategories) => {
      if (oldCategories.includes(categoryName)) {
        return oldCategories.filter((name) => name !== categoryName);
      }
      return [...oldCategories, categoryName];
    });
  }

  function toggleFilter(value, oldValues, setValues) {
    setPage(1);
    if (oldValues.includes(value)) {
      setValues(oldValues.filter((item) => item !== value));
    } else {
      setValues([...oldValues, value]);
    }
  }

  function setSelectedPrice(newPrice) {
    setPage(1);
    const isFullRange =
      newPrice[0] === priceBounds[0] &&
      newPrice[1] === priceBounds[1];

    setPriceFilter(isFullRange ? null : newPrice);
  }

  const categoryOptions = [...categoryList];
  if (saleCount > 0) {
    categoryOptions.push({ name: "Sale", count: saleCount });
  }

  const quickCategories = [...categoryList]
    .sort((first, second) => second.count - first.count)
    .slice(0, 5);

  function sidebar() {
    return (
      <Sidebar
        priceBounds={priceBounds}
        price={price}
        setPrice={setPrice}
        commitPrice={setSelectedPrice}
        categoryOptions={categoryOptions}
        cats={categories}
        toggleCat={toggleCategory}
        colorOptions={colorOptions}
        colors={selectedColors}
        toggleColor={(value) =>
          toggleFilter(value, selectedColors, setSelectedColors)
        }
        materialOptions={materialOptions}
        materials={selectedMaterials}
        toggleMaterial={(value) =>
          toggleFilter(value, selectedMaterials, setSelectedMaterials)
        }
        brandOptions={brandOptions}
        brands={selectedBrands}
        toggleBrand={(value) =>
          toggleFilter(value, selectedBrands, setSelectedBrands)
        }
        visual={visual}
        setVisual={(value) => {
          setPage(1);
          setVisual(value);
        }}
        filtersLoading={filtersLoading}
        filtersError={filtersError}
        collapsible={showMobileFilters}
      />
    );
  }

  return (
    <>
      <QuickCategories
        categories={quickCategories}
        onSelect={(name) => {
          setPage(1);
          setCategories([name]);
          scrollToProducts();
        }}
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
          {sidebar()}
        </Box>

        <Box
          id="shop-products"
          sx={{ order: { xs: 1, md: 2 }, minWidth: 0 }}
        >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr auto",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 40,
            px: 1.5,
            border: `1px solid ${BROWN}`,
          }}
        >
          <SearchOutlined sx={{ mr: 1, color: BROWN }} />
          <InputBase
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search products"
            sx={{ flex: 1 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setShowMobileFilters(true)}
            startIcon={<TuneOutlined />}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              borderColor: BROWN,
              color: "var(--c-555555)",
              textTransform: "none",
            }}
          >
            Filter
          </Button>

          <Select
            value={sort}
            onChange={(event) => {
              setPage(1);
              setSort(event.target.value);
            }}
            IconComponent={KeyboardArrowDown}
            size="small"
            sx={{ minWidth: 175 }}
          >
            <MenuItem value="latest">Sort by latest</MenuItem>
            <MenuItem value="price_asc">Price: low to high</MenuItem>
            <MenuItem value="price_desc">Price: high to low</MenuItem>
            <MenuItem value="name_asc">Name: A to Z</MenuItem>
          </Select>
        </Box>
      </Box>

      {loading ? (
        <ProductSkeletons />
      ) : error ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography sx={{ mb: 2, color: "var(--c-777777)" }}>
            {error}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{ borderColor: BROWN, color: BROWN }}
          >
            Try again
          </Button>
        </Box>
      ) : visibleProducts.length > 0 ? (
        <>
          <Typography sx={{ mb: 2, color: "var(--c-777777)" }}>
            {products.length} product{products.length === 1 ? "" : "s"} found
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2, md: 3 },
            }}
          >
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetail={onDetail}
              />
            ))}
          </Box>

          {totalPages > 1 && (
            <Pagination
              page={page}
              pages={totalPages}
              onChange={goToPage}
            />
          )}
        </>
      ) : (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography sx={{ mb: 2, color: "var(--c-777777)" }}>
            No products match your search.
          </Typography>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ borderColor: BROWN, color: BROWN }}
          >
            Clear filters
          </Button>
        </Box>
      )}
        </Box>

        <Drawer
          anchor="left"
          open={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
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
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              Filters
            </Typography>
            <IconButton
              onClick={() => setShowMobileFilters(false)}
              aria-label="Close filters"
            >
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 1 }}>
            {sidebar()}
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, p: 2 }}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{
                flex: 1,
                borderColor: BROWN,
                color: "var(--c-555555)",
                textTransform: "none",
              }}
            >
              Clear all
            </Button>
            <Button
              onClick={() => setShowMobileFilters(false)}
              sx={{
                flex: 1.4,
                bgcolor: BROWN,
                color: "#fff",
                textTransform: "none",
                "&:hover": { bgcolor: "#7d6048" },
              }}
            >
              Show {products.length} results
            </Button>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
