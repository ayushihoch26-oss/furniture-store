import { Box } from "@mui/material";
import { useInView } from "../../../hooks/useInView";
import { EASE, REVEAL_FROM } from "../contactStyles";

export default function Reveal({ children, delay = 0, direction = "up" }) {
  const [elementRef, isVisible] = useInView();

  return (
    <Box
      ref={elementRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : REVEAL_FROM[direction],
        transition: `opacity .7s ease ${delay}ms, transform .8s ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </Box>
  );
}
