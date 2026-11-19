import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { EASE, prefersReducedMotion } from "../../features/shop/shopMotionStyles";

// Share observers between elements using the same options.
// Automatically disconnect observers when they have no remaining elements.
const observers = new Map();

function observeOnce(element, onVisible, threshold, rootMargin) {
  if (typeof IntersectionObserver === "undefined") {
    onVisible();
    return () => { };
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
