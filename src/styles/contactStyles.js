export const BROWN = "#947458";
export const SIDE = { xs: 2, sm: 4, md: "max(5%, calc((100% - 1296px) / 2))" };

export const HERO_HEIGHT = { xs: 180, sm: 260, md: 360, lg: 486 };
export const HERO_OVERLAP = { xs: "-70px", sm: "-90px", md: "-120px", lg: "-200px" };
export const EASE = "cubic-bezier(.2,.7,.2,1)";

export const anim = (name, delay = 0, duration = 800) =>
  `${name} ${duration}ms ${EASE} ${delay}ms both`;
export const ANIMATION_STYLES = {
  "@keyframes fs-fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes fs-kenburns": {
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.1)" },
  },
  "@keyframes fs-popIn": {
    from: { opacity: 0, transform: "translateY(10px) scale(.9)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes fs-shake": {
    "0%, 100%": { transform: "translateX(0)" },
    "20%": { transform: "translateX(-6px)" },
    "40%": { transform: "translateX(6px)" },
    "60%": { transform: "translateX(-4px)" },
    "80%": { transform: "translateX(4px)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".fs-contact *, .fs-contact *::before, .fs-contact *::after": {
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
  zoom: "scale(.94)",
  none: "none",
};
