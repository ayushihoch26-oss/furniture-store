import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../features/about/aboutStyles";

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(prefersReducedMotion);

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
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}
