// components/OrderPagination.jsx
// Previous | 1 2 3 | Next
import { Box, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { COLORS } from "../constants/orderConstants";

export default function OrderPagination({ page, totalPages, loading, onChange, theme }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const outlined = { height: 36, textTransform: "none", color: theme.text, borderColor: theme.border };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mt: 4 }}>
      <Button variant="outlined" startIcon={<ArrowBack />} disabled={loading || page <= 1}
        onClick={() => onChange(page - 1)} sx={outlined}>Previous</Button>

      <Box sx={{ display: "flex", gap: 1 }}>
        {pages
          .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
          .map((n) => (
            <Button key={n} disabled={loading} onClick={() => onChange(n)}
              sx={{
                minWidth: 0, width: 36, height: 36, fontSize: 13, border: "1px solid",
                borderColor: page === n ? theme.pageActive : theme.border,
                bgcolor: page === n ? theme.pageActive : "transparent",
                color: page === n ? COLORS.brown : theme.text,
                fontWeight: page === n ? 700 : 400,
              }}>
              {n}
            </Button>
          ))}
      </Box>

      <Button variant="outlined" endIcon={<ArrowForward />} disabled={loading || page >= totalPages}
        onClick={() => onChange(page + 1)} sx={outlined}>Next</Button>
    </Box>
  );
}
