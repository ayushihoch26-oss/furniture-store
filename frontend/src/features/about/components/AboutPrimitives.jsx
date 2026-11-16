import { memo, useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { prefersReducedMotion, BROWN, EASE, REVEAL_FROM } from "../../../styles/aboutStyles";
import { useInView } from "../../../hooks/useInView";

export const Photo = memo(function Photo({ img, alt = "", eager = false }) {
  const [source, setSource] = useState(() => img.src);

  const handleError = () => {
    setSource((current) => (current === img.fallback ? current : img.fallback));
  };

  return (
    <Box
      component="img"
      src={source}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={handleError}
      sx={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        bgcolor: "var(--c-d9d2ca)",
      }}
    />
  );
});

export const Reveal = memo(function Reveal({
  children,
  delay = 0,
  direction = "up",
  sx,
  ...rest
}) {
  const [ref, seen] = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : REVEAL_FROM[direction],
        transition: `opacity .7s ease ${delay}ms, transform .8s ${EASE} ${delay}ms`,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

export function BrownButton({ children, sx = {}, ...rest }) {
  return (
    <Button
      variant="contained"
      disableElevation
      {...rest}
      sx={{
        bgcolor: BROWN,
        color: "#fff",
        borderRadius: 0,
        textTransform: "none",
        fontSize: 11,
        fontWeight: 400,
        minWidth: 93,
        height: 26,
        px: 2,
        transition: "transform .25s ease, background-color .25s ease",
        "&:hover": {
          bgcolor: "#7d6149",
          transform: "translateY(-3px)",
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

export function CountUp({ value, duration = 1600 }) {
  const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";

  const [ref, seen] = useInView(0.4);
  const reducedMotion = prefersReducedMotion();
  const [current, setCurrent] = useState(() =>
    reducedMotion ? target : 0,
  );

  useEffect(() => {
    if (!seen || reducedMotion) return undefined;

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [seen, target, duration, reducedMotion]);

  if (!match) return <span ref={ref}>{value}</span>;

  const displayValue = reducedMotion ? target : current;

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}
