import { Box } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { BROWN } from "../constants/invoice.constants";

// Clickable column title with an arrow for the active sort
export default function SortHead({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  const Arrow = sortOrder === "asc" ? ArrowUpward : ArrowDownward;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        p: 0,
        border: 0,
        bgcolor: "transparent",
        color: "inherit",
        font: "inherit",
        cursor: "pointer",
        "&:hover": { color: BROWN },
      }}
    >
      {label}
      <Arrow sx={{ fontSize: 14, opacity: active ? 1 : 0.25 }} />
    </Box>
  );
}
