export const BROWN = "#947458";
export const GREY_BG = "var(--c-f4f3f1)";
export const SIDE = { xs: 2, md: "16.4%" };
export const GAP = { xs: "12px", md: "13px" };
export const EASE = "cubic-bezier(.2,.7,.2,1)";

export const heading = {
  fontSize: { xs: 24, md: 30 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.2,
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const anim = (name, delay = 0, duration = 800) =>
  `${name} ${duration}ms ${EASE} ${delay}ms both`;

export const stagger = (index, step = 100, max = 6) => Math.min(index, max) * step;

export const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
  zoom: "scale(.92)",
  none: "none",
};

export const zoomOnHover = {
  overflow: "hidden",
  "& img": { transition: `transform .7s ${EASE}` },
  "&:hover img": { transform: "scale(1.07)" },
};

export const ANIMATION_STYLES = {
  "@keyframes fs-fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes fs-kenburns": {
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.1)" },
  },
  "@keyframes fs-pulse": {
    "0%": { transform: "scale(1)", opacity: 0.6 },
    "100%": { transform: "scale(1.9)", opacity: 0 },
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".fs-about *, .fs-about *::before, .fs-about *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important",
      transitionDelay: "0s !important",
    },
  },
};
