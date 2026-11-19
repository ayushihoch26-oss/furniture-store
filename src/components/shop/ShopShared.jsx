import { useState } from "react";
import { Box, Typography, Button, ButtonBase, Checkbox, Slider, Collapse } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { BROWN, SIDE, H2, FILTER_TITLE, OPTION_TEXT, ROW_PY, DOTS, CATEGORY_ICONS, FALLBACK_CATEGORY_ICON, scrollToProducts } from "../../features/shop/shopConstants";
import { EASE } from "../../features/shop/shopMotionStyles";
import { onImgError } from "../../assets/furnitureImages";
import { Reveal } from "./ShopMotion";
import { stagger } from "../../features/shop/shopMotionStyles";

export function ColorDots({ sx = {} }) {
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

export function ProductImage({ src, alt = "", pad = "8%", fit = "contain" }) {
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

export function SectionHeader({ title }) {
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

export function CountPill({ value = 0 }) {
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

export function QuickCategories({ categories, onSelect }) {
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
                  src={CATEGORY_ICONS[name.toLowerCase()] || FALLBACK_CATEGORY_ICON}
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

export function CheckRow({ label, count, checked, onChange }) {
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

export function FilterGroup({
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

export function Sidebar({
  priceBounds,
  price,
  setPrice,
  commitPrice,
  categoryOptions,
  cats,
  toggleCat,
  colorOptions = [],
  colors = [],
  toggleColor,
  materialOptions = [],
  materials = [],
  toggleMaterial,
  brandOptions = [],
  brands = [],
  toggleBrand,
  visual = "",
  setVisual,
  filtersLoading,
  filtersError,
  bestSellers = [],
  collapsible = false,
}) {
  const groupMb = { xs: "28px", md: "32px", lg: "44px" };
  const visualOptions = ["Minimal", "Classic", "Modern"];

  return (
    <Box sx={{ width: "100%" }}>
      <FilterGroup
        title="Filter by Price"
        collapsible={collapsible}
        defaultOpen
        mb={groupMb}
      >
        {filtersLoading ? (
          <Typography sx={OPTION_TEXT}>Loading price range...</Typography>
        ) : filtersError ? (
          <Typography sx={OPTION_TEXT}>{filtersError}</Typography>
        ) : priceBounds[1] > priceBounds[0] ? (
          <>
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
          </>
        ) : (
          <Typography sx={OPTION_TEXT}>No price range available.</Typography>
        )}
      </FilterGroup>

      <FilterGroup
        title="Filter by Categories"
        collapsible={collapsible}
        defaultOpen
        mb={groupMb}
      >
        {filtersLoading ? (
          <Typography sx={OPTION_TEXT}>Loading categories...</Typography>
        ) : filtersError ? (
          <Typography sx={OPTION_TEXT}>{filtersError}</Typography>
        ) : categoryOptions.length > 0 ? (
          categoryOptions.map(({ name, count }) => (
            <CheckRow
              key={name}
              label={name}
              count={count}
              checked={cats.includes(name)}
              onChange={() => toggleCat(name)}
            />
          ))
        ) : (
          <Typography sx={OPTION_TEXT}>No categories available.</Typography>
        )}
      </FilterGroup>

      <FilterGroup
        title="Filter by Color"
        collapsible={collapsible}
        defaultOpen
        mb={groupMb}
      >
        {colorOptions.length > 0 ? colorOptions.map((name) => (
          <CheckRow
            key={name}
            label={name}
            count={0}
            checked={colors.includes(name)}
            onChange={() => toggleColor(name)}
          />
        )) : (
          <Typography sx={OPTION_TEXT}>No colors available.</Typography>
        )}
      </FilterGroup>

      <FilterGroup
        title="Filter by Material"
        collapsible={collapsible}
        defaultOpen
        mb={groupMb}
      >
        {materialOptions.length > 0 ? materialOptions.map((name) => (
          <CheckRow
            key={name}
            label={name}
            count={0}
            checked={materials.includes(name)}
            onChange={() => toggleMaterial(name)}
          />
        )) : (
          <Typography sx={OPTION_TEXT}>No materials available.</Typography>
        )}
      </FilterGroup>

      <FilterGroup
        title="Filter by Brand"
        collapsible={collapsible}
        defaultOpen
        mb={groupMb}
      >
        {brandOptions.length > 0 ? brandOptions.map((name) => (
          <CheckRow
            key={name}
            label={name}
            count={0}
            checked={brands.includes(name)}
            onChange={() => toggleBrand(name)}
          />
        )) : (
          <Typography sx={OPTION_TEXT}>No brands available.</Typography>
        )}
      </FilterGroup>

      <FilterGroup
        title="Visual"
        collapsible={collapsible}
        defaultOpen
        mb={groupMb}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {visualOptions.map((name) => (
            <Button
              key={name}
              onClick={() => setVisual((current) => (current === name ? "" : name))}
              variant="outlined"
              disableRipple
              sx={{
                minWidth: "auto",
                height: { xs: 30, lg: 34 },
                px: { xs: "10px", lg: "12px" },
                borderRadius: 0,
                borderColor:
                  visual === name ? BROWN : "var(--c-d8d8d8)",
                bgcolor:
                  visual === name ? BROWN : "var(--c-ffffff)",
                color:
                  visual === name ? "#fff" : "var(--c-777777)",
                fontSize: { xs: 10, lg: 12 },
                fontWeight: 400,
                textTransform: "none",
                "&:hover": {
                  borderColor: BROWN,
                  bgcolor: visual === name ? BROWN : "var(--c-f8f8f8)",
                },
              }}
            >
              {name}
            </Button>
          ))}
        </Box>
      </FilterGroup>

      {bestSellers.length > 0 && (
        <FilterGroup
          title="Best Sellers"
          collapsible={collapsible}
          defaultOpen
          mb={0}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {bestSellers.slice(0, 3).map((product) => (
              <Box
                key={product.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "62px minmax(0, 1fr)",
                  alignItems: "center",
                  gap: "10px",
                  minHeight: 62,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 62,
                    height: 62,
                    bgcolor: "var(--c-f5f5f5)",
                    overflow: "hidden",
                  }}
                >
                  <ProductImage src={product.img} alt={product.name} pad="5%" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 13 },
                      fontWeight: 600,
                      color: "var(--c-222222)",
                      lineHeight: 1.25,
                      mb: "5px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: 12, lg: 13 },
                      fontWeight: 500,
                      color: "var(--c-777777)",
                    }}
                  >
                    ${Number(product.price).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </FilterGroup>
      )}
    </Box>
  );
}
