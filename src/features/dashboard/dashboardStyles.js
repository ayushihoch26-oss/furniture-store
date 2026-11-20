// ---------- Layout (1440px Figma frame: 72px side padding, 1296px content) ----------
export const BROWN = "#947458";
export const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
export const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };
export const SECTION_PY = { xs: "56px", md: "80px", xl: "110px" };

export const H2 = {
  fontSize: { xs: 26, md: 32 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.2,
};
export const EASE = "cubic-bezier(.2,.7,.2,1)";

// Keyframes + reduced-motion safety, scoped to the home page
export const ANIMATION_STYLES = {
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
export const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
  zoom: "scale(.92)",
  none: "none",
};
// Image frame whose picture zooms in slowly on hover
export const zoomOnHover = {
  "& img": { transition: `transform .6s ${EASE}` },
  "&:hover img": { transform: "scale(1.07)" },
};
