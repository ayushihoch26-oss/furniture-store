import { useEffect, useRef, useState } from "react";

// Load the map only when it approaches the viewport.

export default function useLazyMap() {
  const ref = useRef(null);

  const [shouldLoad, setShouldLoad] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (shouldLoad) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return [ref, shouldLoad];
}
