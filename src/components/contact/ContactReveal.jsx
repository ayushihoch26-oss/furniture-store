import { Box } from "@mui/material";
import { useInView } from "../../hooks/about/useInView";
import { EASE, REVEAL_FROM } from "../../styles/contactStyles";

export default function Reveal({ children, delay = 0, direction = "up" }) {
  const [ref, seen] = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : REVEAL_FROM[direction],
        transition: `opacity .7s ease ${delay}ms, transform .8s ${EASE} ${delay}ms`,
      }}
    >
      {children}
    </Box>
  );
}
