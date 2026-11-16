import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  InputBase,
  Checkbox,
  MenuItem,
  TextField,
  Popover,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  ChevronLeft,
  ChevronRight,
  FilterList,
  SwapVert,
  Search,
  VisibilityOutlined,
  DeleteOutlined,
  MarkEmailUnreadOutlined,
  DraftsOutlined,
  ReplyOutlined,
  PersonOutlined,
} from "@mui/icons-material";

const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const RED = "#E5484D";
const GREEN = "#2E9E5B";
const YELLOW = "#F5B301";

const SUBJECTS = [
  "General Question",
  "Order Support",
  "Product Information",
  "Returns & Refunds",
  "Partnership",
];

const TABS = ["All message", "New", "Read", "Replied"];

const STATUS = {
  New: [RED, MarkEmailUnreadOutlined],
  Read: [YELLOW, DraftsOutlined],
  Replied: [GREEN, ReplyOutlined],
};

const COLUMNS = "70px 110px minmax(200px, 2.2fr) 1.4fr 110px 1fr 100px";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (number) => String(number).padStart(2, "0");

const makeIso = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

const showDate = (value) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

function Card({ children, sx = {}, theme }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function IconBox({ children, size = 44, theme }) {
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
      }}
    >
      {children}
    </Box>
  );
}

function SquareIconButton({ children, label, onClick, theme }) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        border: `1px solid ${theme.border}`,
        color: theme.iconButton,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      {children}
    </IconButton>
  );
}

function RangeCalendar({ from, to, onChange, theme }) {
  const [view, setView] = useState(() => {
    const date = from ? new Date(`${from}T00:00:00`) : new Date();

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  });

  const [hover, setHover] = useState("");

  const firstWeekday = new Date(view.year, view.month, 1).getDay();

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const changeMonth = (step) => {
    setView((previous) => {
      const date = new Date(previous.year, previous.month + step, 1);

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
      };
    });
  };

  const pickDay = (value) => {
    if (!from || to) {
      onChange(value, "");
    } else if (value < from) {
      onChange(value, from);
    } else {
      onChange(from, value);
    }
  };

  const previewEnd = to || (from && hover > from ? hover : from);

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          mb: 0.5,
        }}
      >
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
          if (!day) {
            return <Box key={`empty-${index}`} />;
          }

          const value = makeIso(view.year, view.month, day);
          const isStart = value === from;
          const isEnd = value === to;
          const isEdge = isStart || isEnd;

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
                  "&:hover": {
                    bgcolor: isEdge ? BROWN_DARK : theme.dayHover,
                  },
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

export default function ContactTable({
  messages = [],
  selected = [],
  setSelected,
  page = 1,
  setPage,
  onView,
  onDelete,
  darkMode = false,
  totalPages = 1,
  totalMessages,
  onQueryChange,
}) {
  const [tab, setTab] = useState("All message");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [subject, setSubject] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const theme = {
    card: darkMode ? "#292421" : "#fff",
    text: darkMode ? "#F5F0EB" : "#222",
    headText: darkMode ? "#F5F0EB" : "#333",
    muted: darkMode ? "#B8AAA0" : "#777",
    iconButton: darkMode ? "#F5F0EB" : "#444",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : BROWN_LIGHT,
    tabsBg: darkMode ? "#332D28" : BG,
    tabText: darkMode ? "#B8AAA0" : "#555",
    tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
    pageActive: darkMode ? "#403832" : BROWN_LIGHT,
    rangeBg: darkMode ? "#403832" : BROWN_LIGHT,
    dayHover: darkMode ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)",
    rowDivider: darkMode ? "#403832" : "#eee",
  };

  const paperSx = darkMode
    ? {
        bgcolor: theme.card,
        color: theme.text,
        backgroundImage: "none",
      }
    : {};

  const fieldSx = {
    "& .MuiInputBase-root": {
      color: theme.text,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.border,
    },
    "& .MuiSvgIcon-root": {
      color: theme.muted,
    },
  };

  const menuProps = {
    slotProps: {
      paper: { sx: paperSx },
    },
  };

  const resetPage = () => setPage(1);

  // Send all filters to the parent. The parent must call the API.
  const query = useMemo(
    () => ({
      page: Math.max(1, Number(page) || 1),
      limit: 10,
      search: search.trim(),
      status: tab === "All message" ? "" : tab,
      subject: subject === "All" ? "" : subject,
      fromDate,
      toDate: toDate || fromDate,
      sortOrder,
    }),
    [page, search, tab, subject, fromDate, toDate, sortOrder],
  );

  useEffect(() => {
    if (typeof onQueryChange !== "function") return undefined;

    const timer = setTimeout(() => {
      onQueryChange(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onQueryChange]);

  const allSelected =
    messages.length > 0 && messages.every((item) => selected.includes(item.id));

  const someSelected = messages.some((item) => selected.includes(item.id));

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const toggleAll = () => {
    setSelected((previous) => {
      if (allSelected) {
        return previous.filter(
          (id) => !messages.some((item) => item.id === id),
        );
      }

      return [...new Set([...previous, ...messages.map((item) => item.id)])];
    });
  };

  const safeTotalPages = Math.max(1, Number(totalPages) || 1);

  const pageNumbers = Array.from(
    { length: safeTotalPages },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 || number === safeTotalPages || Math.abs(number - page) <= 2,
  );

  const visiblePages = pageNumbers.reduce((result, number, index) => {
    if (index > 0 && number - pageNumbers[index - 1] > 1) {
      result.push("...");
    }

    result.push(number);
    return result;
  }, []);

  return (
    <Card theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            bgcolor: theme.tabsBg,
            p: 0.5,
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          {TABS.map((name) => (
            <Button
              key={name}
              onClick={() => {
                setTab(name);
                resetPage();
              }}
              disableElevation
              sx={{
                minWidth: 0,
                height: 34,
                px: 2,
                fontSize: 13,
                textTransform: "none",
                whiteSpace: "nowrap",
                borderRadius: 1.5,
                bgcolor: tab === name ? BROWN : "transparent",
                color: tab === name ? "#fff" : theme.tabText,
                "&:hover": {
                  bgcolor: tab === name ? BROWN : theme.tabHover,
                },
              }}
            >
              {name}
              {name === "All message" && (
                <Box component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                  ({totalMessages ?? messages.length})
                </Box>
              )}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: theme.soft,
              borderRadius: 2,
              px: 1.5,
              height: 40,
              width: { xs: 160, sm: 240 },
            }}
          >
            <InputBase
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder="Search message"
              inputProps={{ "aria-label": "Search messages" }}
              sx={{
                flex: 1,
                fontSize: 13,
                color: theme.text,
                "& input::placeholder": {
                  color: theme.muted,
                  opacity: 1,
                },
              }}
            />
            <Search sx={{ fontSize: 20, color: theme.muted }} />
          </Box>

          <SquareIconButton
            label="Filter messages"
            theme={theme}
            onClick={(event) => setFilterAnchor(event.currentTarget)}
          >
            <FilterList fontSize="small" />
          </SquareIconButton>

          <Popover
            open={Boolean(filterAnchor)}
            anchorEl={filterAnchor}
            onClose={() => setFilterAnchor(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
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
              Filter Messages
            </Typography>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Subject
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                resetPage();
              }}
              slotProps={{ select: { MenuProps: menuProps } }}
              sx={{ mb: 2.5, ...fieldSx }}
            >
              <MenuItem value="All">All Subjects</MenuItem>
              {SUBJECTS.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Date Range
            </Typography>

            {filterAnchor && (
              <RangeCalendar
                from={fromDate}
                to={toDate}
                theme={theme}
                onChange={(start, end) => {
                  setFromDate(start);
                  setToDate(end);
                  resetPage();
                }}
              />
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSubject("All");
                  setFromDate("");
                  setToDate("");
                  resetPage();
                }}
                sx={{
                  color: BROWN,
                  borderColor: BROWN,
                  textTransform: "none",
                }}
              >
                Clear
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterAnchor(null)}
                sx={{
                  bgcolor: BROWN,
                  textTransform: "none",
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Done
              </Button>
            </Box>
          </Popover>

          <SquareIconButton
            label={`Sort by date: ${sortOrder === "desc" ? "newest first" : "oldest first"}`}
            theme={theme}
            onClick={() => {
              setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
              resetPage();
            }}
          >
            <SwapVert fontSize="small" />
          </SquareIconButton>
        </Box>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 900 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: COLUMNS,
              gap: 1,
              alignItems: "center",
              p: 1.5,
              bgcolor: theme.header,
              borderRadius: 2,
              fontSize: 13,
              fontWeight: 600,
              color: theme.headText,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
                sx={{
                  p: 0.5,
                  mr: 1,
                  color: theme.muted,
                  "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                    color: BROWN,
                  },
                }}
              />
              <span>No.</span>
            </Box>

            <span>Message Id</span>
            <span>Customer</span>
            <span>Subject</span>
            <span>Date</span>
            <span>Status</span>
            <span>Actions</span>
          </Box>

          {messages.map((item, index) => {
            const [statusColor, StatusIcon] =
              STATUS[item.status] || STATUS.Read;

            return (
              <Box
                key={item.dbId ?? item.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: COLUMNS,
                  gap: 1,
                  alignItems: "center",
                  px: 1,
                  py: 1.25,
                  fontSize: 13,
                  borderBottom: `1px solid ${theme.rowDivider}`,
                  fontWeight: item.status === "New" ? 700 : 400,
                  color: theme.text,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    size="small"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    sx={{
                      p: 0.5,
                      mr: 1,
                      color: theme.muted,
                      "&.Mui-checked": { color: BROWN },
                    }}
                  />
                  <span>{(page - 1) * 10 + index + 1}</span>
                </Box>

                <span>{item.id}</span>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <IconBox size={36} theme={theme}>
                    <PersonOutlined sx={{ fontSize: 20 }} />
                  </IconBox>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: "inherit",
                        color: theme.text,
                      }}
                      noWrap
                    >
                      {item.name}
                    </Typography>

                    <Typography
                      sx={{ fontSize: 11, color: theme.muted }}
                      noWrap
                    >
                      {item.email}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  component="span"
                  sx={{
                    fontSize: 13,
                    color: theme.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={item.subject}
                >
                  {item.subject}
                </Typography>

                <span>{item.date}</span>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: statusColor,
                    fontWeight: 400,
                  }}
                >
                  <StatusIcon sx={{ fontSize: 20 }} />
                  <span>{item.status}</span>
                </Box>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    title="View message"
                    aria-label="View message"
                    onClick={() => onView?.(item)}
                    sx={{ color: BROWN }}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    title="Delete message"
                    aria-label="Delete message"
                    onClick={() => onDelete?.(item)}
                    sx={{ color: RED }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          {messages.length === 0 && (
            <Typography
              sx={{
                py: 4,
                textAlign: "center",
                fontSize: 13,
                color: theme.muted,
              }}
            >
              No messages found
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          disabled={page <= 1}
          onClick={() => setPage((previous) => Math.max(1, previous - 1))}
          sx={{
            height: 36,
            color: theme.text,
            borderColor: theme.border,
            textTransform: "none",
            "&:hover": {
              borderColor: BROWN,
              bgcolor: theme.soft,
            },
          }}
        >
          Previous
        </Button>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {visiblePages.map((number, index) => (
            <Button
              key={`${number}-${index}`}
              disabled={number === "..."}
              onClick={() => {
                if (typeof number === "number") setPage(number);
              }}
              sx={{
                minWidth: 0,
                width: 36,
                height: 36,
                fontSize: 13,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: page === number ? theme.pageActive : theme.border,
                bgcolor: page === number ? theme.pageActive : "transparent",
                color: page === number ? BROWN : theme.text,
                fontWeight: page === number ? 700 : 400,
              }}
            >
              {number}
            </Button>
          ))}
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={page >= safeTotalPages}
          onClick={() =>
            setPage((previous) => Math.min(safeTotalPages, previous + 1))
          }
          sx={{
            height: 36,
            color: theme.text,
            borderColor: theme.border,
            textTransform: "none",
            "&:hover": {
              borderColor: BROWN,
              bgcolor: theme.soft,
            },
          }}
        >
          Next
        </Button>
      </Box>
    </Card>
  );
}
