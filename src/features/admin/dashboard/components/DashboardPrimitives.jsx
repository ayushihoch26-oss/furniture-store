import { useContext } from "react";
import {
  ArrowDownward,
  ArrowUpward,
  MoreVert,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import {
  BROWN,
  GREEN,
  RED,
  formatPct,
} from "../features/dashboardHelpers";
import DashboardThemeContext from "./DashboardThemeContext";

export function Card({ children, sx }) {
  const theme = useContext(DashboardThemeContext);
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: theme.dark
          ? "0 2px 8px rgba(0,0,0,0.25)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "background-color 0.25s ease",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function CardHeader({ title, subtitle, action, mb = 2 }) {
  const theme = useContext(DashboardThemeContext);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 1,
        mb,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: theme.muted }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

export function MenuButton() {
  const theme = useContext(DashboardThemeContext);
  return (
    <IconButton
      size="small"
      aria-label="More"
      sx={{ mt: -0.5, mr: -0.5, ...(theme.dark && { color: theme.muted }) }}
    >
      <MoreVert fontSize="small" />
    </IconButton>
  );
}

export function IconBox({ size = 44, children }) {
  const theme = useContext(DashboardThemeContext);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: theme.soft,
        color: BROWN,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

export function SectionState({
  loading,
  error,
  empty,
  emptyText = "No data yet",
}) {
  const theme = useContext(DashboardThemeContext);
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={22} sx={{ color: BROWN }} />
      </Box>
    );
  }
  if (error) {
    return (
      <Typography sx={{ fontSize: 12, color: RED, py: 2 }}>{error}</Typography>
    );
  }
  if (empty) {
    return (
      <Typography
        sx={{ fontSize: 12, color: theme.muted, py: 2, textAlign: "center" }}
      >
        {emptyText}
      </Typography>
    );
  }
  return null;
}

function Change({ value }) {
  if (value == null) return null;
  const isPositive = value >= 0;
  return (
    <Typography
      sx={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        color: isPositive ? GREEN : RED,
      }}
    >
      {isPositive ? (
        <ArrowUpward sx={{ fontSize: 14 }} />
      ) : (
        <ArrowDownward sx={{ fontSize: 14 }} />
      )}
      {formatPct(value)}
    </Typography>
  );
}

export function StatCard({
  title,
  subtitle = "Last 7 days",
  items,
  loading,
  error,
}) {
  const theme = useContext(DashboardThemeContext);
  const divider = theme.dark ? "rgba(148,163,184,.12)" : "#E8EDF3";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
        borderRadius: "12px",
        bgcolor: theme.dark ? "#292421" : "#F7F7F7",
        boxShadow: theme.dark
          ? "0 25px 55px rgba(0,0,0,.35)"
          : "0 20px 45px rgba(15,23,42,.10)",
        transition: "0.3s",
        "&:hover": { transform: "translateY(-8px)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, mt: 0.5, color: theme.muted }}>
            {subtitle}
          </Typography>
        </Box>
        <MenuButton />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          py: 2,
        }}
      >
        {items.map((item, index) => (
          <Box
            key={item.label}
            sx={{
              minWidth: 0,
              pl: index > 0 ? 2 : 0,
              pr: index < items.length - 1 ? 2 : 0,
              borderRight:
                index < items.length - 1 ? `1px solid ${divider}` : "none",
            }}
          >
            <Typography sx={{ fontSize: 13, color: theme.muted }}>
              {item.label}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: theme.strong,
                }}
              >
                {loading ? "…" : error ? "—" : item.value}
              </Typography>
              {!loading && !error && <Change value={item.change} />}
            </Box>
            {!loading && !error && item.note && (
              <Typography sx={{ fontSize: 12, color: theme.muted, mt: 1 }}>
                {item.note} <b style={{ color: theme.strong }}>{item.noteValue}</b>
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
}
