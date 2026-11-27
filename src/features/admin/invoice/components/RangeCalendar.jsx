import { Box, Button, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  BROWN,
  BROWN_DARK,
  MONTHS,
  WEEKDAYS,
} from "../constants/invoice.constants";
import useRangeCalendar from "../hooks/useRangeCalendar";
import { makeIso, showDate } from "../utils/invoice.utils";

export default function RangeCalendar({ from, to, onChange, theme }) {
  const { view, cells, changeMonth, pickDay, setHover, previewEnd } =
    useRangeCalendar({ from, to, onChange });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          bgcolor: theme.soft,
          borderRadius: 2,
          py: 1,
          mb: 1.5,
          fontSize: 13,
          fontWeight: 600,
          color: from ? theme.text : theme.muted,
        }}
      >
        <span>{from ? showDate(from) : "Start date"}</span>
        <span>→</span>
        <span>{to ? showDate(to) : "End date"}</span>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <IconButton
          size="small"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
          sx={{ color: theme.text }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Typography fontSize={14} fontWeight={700}>
          {MONTHS[view.month]} {view.year}
        </Typography>
        <IconButton
          size="small"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
          sx={{ color: theme.text }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 0.5 }}>
        {WEEKDAYS.map((day) => (
          <Typography
            key={day}
            sx={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: theme.muted,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          rowGap: 0.25,
        }}
        onMouseLeave={() => setHover("")}
      >
        {cells.map((day, index) => {
          if (!day) return <Box key={`empty-${index}`} />;

          const value = makeIso(view.year, view.month, day);
          const isEdge = value === from || value === to;
          const inRange =
            Boolean(from && previewEnd) && value >= from && value <= previewEnd;

          return (
            <Box
              key={value}
              sx={{
                bgcolor: inRange && !isEdge ? theme.rangeBg : "transparent",
                borderRadius: 2,
              }}
            >
              <Button
                onClick={() => pickDay(value)}
                onMouseEnter={() => setHover(value)}
                disableElevation
                sx={{
                  minWidth: 0,
                  width: "100%",
                  height: 34,
                  p: 0,
                  fontSize: 13,
                  borderRadius: "50%",
                  fontWeight: isEdge ? 700 : 400,
                  bgcolor: isEdge ? BROWN : "transparent",
                  color: isEdge ? "#fff" : theme.text,
                  "&:hover": { bgcolor: isEdge ? BROWN_DARK : theme.dayHover },
                }}
              >
                {day}
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
