import { Box } from "@mui/material";
import { EASE, REVEAL_FROM } from "../../styles/dashboardStyles";
import { useInView } from "../../hooks/useInView";

// Fades + slides its children in when they scroll into view
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
