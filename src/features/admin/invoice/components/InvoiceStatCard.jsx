import { Box, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { BROWN, GREEN, RED } from "../constants/invoice.constants";

function Card({ children, sx, darkMode = false }) {
  return (
    <Box
      sx={{
        bgcolor: darkMode ? "#292421" : "#FFFFFF",
        color: darkMode ? "#F5F0EB" : "#222222",
        border: `1px solid ${darkMode ? "#403832" : "#EEEEEE"}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: darkMode
          ? "0 2px 8px rgba(0,0,0,.25)"
          : "0 1px 4px rgba(0,0,0,.06)",
        transition: "background-color 0.25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default function InvoiceStatCard({ title, value, change, darkMode = false }) {
  const up = change > 0 ? true : change < 0 ? false : undefined;
  const color = up === false ? RED : GREEN;

  return (
    <Card
      darkMode={darkMode}
      sx={{
        borderRadius: "12px",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,.35)"
            : "0 10px 25px rgba(15,23,42,.15)",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: darkMode ? "#F5F0EB" : "#0F172A",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ mt: 1.5 }}>
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.2,
            color: darkMode ? "#D8B89A" : BROWN,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 12,
            color,
          }}
        >
          {up === true && <ArrowUpward sx={{ fontSize: 14 }} />}
          {up === false && <ArrowDownward sx={{ fontSize: 14 }} />}
          {Math.abs(change || 0)}%
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 12, color: darkMode ? "#B8AAA0" : "#777", mt: 1 }}>
        vs previous 7 days
      </Typography>
    </Card>
  );
}
