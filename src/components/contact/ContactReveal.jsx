import { memo } from "react";
import { Box } from "@mui/material";
import { useInView } from "../../hooks/useInView";
import { EASE, REVEAL_FROM } from "../../styles/contactStyles";

const Reveal = memo(function Reveal({
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

export default Reveal;
