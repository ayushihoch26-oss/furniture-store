import { Box, Button, Popover, TextField, Typography } from "@mui/material";
import { BROWN, BROWN_DARK } from "../constants/invoice.constants";
import RangeCalendar from "./RangeCalendar";

export default function InvoiceFilterPopover({
  popover,
  fromDate,
  toDate,
  onFiltersChange,
  theme,
  paperSx,
  fieldSx,
}) {
  const { anchor, close, apply, clear, minText, setMinText, maxText, setMaxText } =
    popover;

  return (
    <Popover
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={close}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            p: 2.5,
            width: 320,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: 3,
            mt: 1,
            ...paperSx,
          },
        },
      }}
    >
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        Filter Invoices
      </Typography>

      <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
        Total amount ($)
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Min"
          value={minText}
          onChange={(e) => setMinText(e.target.value.replace(/[^\d.]/g, ""))}
          inputProps={{ inputMode: "decimal" }}
          sx={fieldSx}
        />
        <TextField
          size="small"
          placeholder="Max"
          value={maxText}
          onChange={(e) => setMaxText(e.target.value.replace(/[^\d.]/g, ""))}
          inputProps={{ inputMode: "decimal" }}
          sx={fieldSx}
        />
      </Box>

      <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
        Date Range
      </Typography>
      {anchor && (
        <RangeCalendar
          from={fromDate}
          to={toDate}
          theme={theme}
          onChange={(start, end) =>
            onFiltersChange({ fromDate: start, toDate: end })
          }
        />
      )}

      <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={clear}
          sx={{ color: BROWN, borderColor: BROWN, textTransform: "none" }}
        >
          Clear
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={apply}
          sx={{
            bgcolor: BROWN,
            textTransform: "none",
            "&:hover": { bgcolor: BROWN_DARK },
          }}
        >
          Apply
        </Button>
      </Box>
    </Popover>
  );
}
