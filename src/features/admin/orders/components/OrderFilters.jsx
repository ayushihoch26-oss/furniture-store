// components/OrderFilters.jsx
// Tabs + search box + filter popup + sort button.
import { useState } from "react";
import { Box, Button, IconButton, InputBase, MenuItem, Popover, TextField, Typography } from "@mui/material";
import { FilterList, Search, SwapVert } from "@mui/icons-material";
import { COLORS, TABS, PAYMENT_OPTIONS } from "../constants/orderConstants";

export default function OrderFilters({ orders, theme }) {
  const [anchor, setAnchor] = useState(null);
  const o = orders; // everything comes from the useOrders() hook

  const squareBtn = {
    width: 40, height: 40, borderRadius: 2,
    border: `1px solid ${theme.border}`, color: theme.text,
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 0.5, bgcolor: theme.soft, p: 0.5, borderRadius: 2, overflowX: "auto" }}>
        {TABS.map((name) => (
          <Button
            key={name}
            onClick={() => o.setTab(name)}
            sx={{
              textTransform: "none", whiteSpace: "nowrap", fontSize: 13,
              bgcolor: o.tab === name ? COLORS.brown : "transparent",
              color: o.tab === name ? "#fff" : theme.muted,
              "&:hover": { bgcolor: o.tab === name ? COLORS.brown : "rgba(0,0,0,.04)" },
            }}
          >
            {name} {name === "All order" && `(${o.totalOrders})`}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        {/* Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: theme.soft, borderRadius: 2, px: 1.5, height: 40, width: { xs: 160, sm: 240 } }}>
          <InputBase
            value={o.search}
            onChange={(e) => o.setSearch(e.target.value)}
            placeholder="Search order report"
            sx={{ flex: 1, fontSize: 13, color: theme.text }}
          />
          <Search sx={{ fontSize: 20, color: theme.muted }} />
        </Box>

        <IconButton title="Filter" onClick={(e) => setAnchor(e.currentTarget)} sx={squareBtn}>
          <FilterList fontSize="small" />
        </IconButton>
        <IconButton title="Sort by price" onClick={o.toggleSort} sx={squareBtn}>
          <SwapVert fontSize="small" />
        </IconButton>

        {/* Filter popup */}
        <Popover
          open={Boolean(anchor)}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: { sx: { p: 2.5, width: 290, mt: 1 } } }}
        >
          <Typography fontWeight={700} sx={{ mb: 2 }}>Filter Orders</Typography>

          <TextField select fullWidth size="small" label="Payment Status" value={o.paymentFilter}
            onChange={(e) => o.setPaymentFilter(e.target.value)} sx={{ mb: 2 }}>
            <MenuItem value="All">All Payments</MenuItem>
            {PAYMENT_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>

          <TextField type="date" fullWidth size="small" label="From Date" value={o.fromDate}
            onChange={(e) => o.setFromDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 2 }} />
          <TextField type="date" fullWidth size="small" label="To Date" value={o.toDate}
            onChange={(e) => o.setToDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />

          <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={o.clearFilters} sx={{ textTransform: "none", color: COLORS.brown, borderColor: COLORS.brown }}>Clear</Button>
            <Button fullWidth variant="contained" onClick={() => setAnchor(null)} sx={{ textTransform: "none", bgcolor: COLORS.brown }}>Done</Button>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}
