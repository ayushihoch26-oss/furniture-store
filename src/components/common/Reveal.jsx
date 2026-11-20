import { Box } from "@mui/material";
import { useInView } from "../../hooks/useInView";

const EASE = "cubic-bezier(.2,.7,.2,1)";
const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
  zoom: "scale(.92)",
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
        transition: `opacity .7s ease ${delay}ms, transform .8s ${EASE} ${delay}ms`,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
