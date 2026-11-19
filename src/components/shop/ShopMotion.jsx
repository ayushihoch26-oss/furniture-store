import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { EASE, prefersReducedMotion } from "../../features/shop/shopMotionStyles";

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [seen, threshold, rootMargin]);

  return [ref, seen];
}

export function LazySection({ children, minHeight = 300, margin = "400px 0px" }) {
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

export function Reveal({ children, delay = 0, direction = "up", sx, ...rest }) {
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


// ---------------------------------------------------------------------------
