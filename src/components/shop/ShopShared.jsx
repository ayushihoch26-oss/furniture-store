import { useState } from "react";
import { Box, Typography, Button, ButtonBase, Checkbox, Slider, Collapse } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { BROWN, GRAY_BG, SIDE, H2, FILTER_TITLE, OPTION_TEXT, ROW_PY, DOTS, CATEGORY_ICONS, FALLBACK_CATEGORY_ICON, scrollToProducts } from "../../features/shop/shopConstants";
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
