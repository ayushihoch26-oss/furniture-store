export const EASE = "cubic-bezier(.2,.7,.2,1)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ANIMATION_STYLES = {
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

export const stagger = (index, step = 90, max = 6) => Math.min(index, max) * step;
