import { useState } from "react";
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
  CircularProgress,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  FilterList,
  SwapVert,
  Search,
  CategoryOutlined,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

const BROWN = "#947458";
const BROWN_DARK = "#7D6149";
const BROWN_LIGHT = "#F3ECE5";
const GREEN = "#2E9E5B";
const RED = "#E5484D";
const GRAY = "#9A9A9A";

const CALENDAR_BG = "#28231F";
const CALENDAR_SURFACE = "#342D27";
const CALENDAR_BORDER = "#443A32";
const CALENDAR_TEXT = "#F5F0EB";
const CALENDAR_MUTED = "#B7AAA0";

const TABS = [
  { label: "All category", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const STATUS = {
  Active: [GREEN, CheckCircleOutlinedIcon],
  Inactive: [GRAY, PauseCircleOutlinedIcon],
};

const COLUMNS = "70px 110px minmax(200px, 2.2fr) 100px 1fr 130px 130px";

// eslint-disable-next-line
export const getStatus = (isActive) =>
  isActive
    ? { label: "Active", color: GREEN }
    : { label: "Inactive", color: GRAY };

// eslint-disable-next-line
export const categoryCode = (category) =>
  category.code || `CAT${String(category.id).padStart(4, "0")}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCalendarDate = (value) => {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Card({ children, theme }) {
  return (
    <Box
      sx={{
        bgcolor: theme.card,
        color: theme.text,
        borderRadius: "10px",
        p: 2.5,
        minWidth: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      }}
    >
      {children}
    </Box>
  );
}

function IconBox({ src, theme, size = 36 }) {
  const box = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: 2,
  };

  if (src) {
    return (
      <Box
        component="img"
        src={src}
        alt=""
        onError={(event) => {
          event.currentTarget.style.visibility = "hidden";
        }}
        sx={{
          ...box,
          objectFit: "cover",
          border: `1px solid ${theme.border}`,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        ...box,
        bgcolor: theme.soft,
        color: BROWN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CategoryOutlined sx={{ fontSize: 20 }} />
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
        color: theme.iconButton || theme.text,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      {children}
    </IconButton>
  );
}

function DateRangeCalendar({ startDate, endDate, setStartDate, setEndDate }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = startDate
      ? new Date(`${startDate}T12:00:00`)
      : new Date();

    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  });

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const makeDateValue = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const changeMonth = (offset) => {
    setVisibleMonth(new Date(year, month + offset, 1));
  };

  const chooseDate = (date) => {
    if (!startDate || endDate || date < startDate) {
      setStartDate(date);
      setEndDate("");
      return;
    }

    setEndDate(date);
  };

  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: CALENDAR_TEXT,
          mb: 1.25,
        }}
      >
        Date Range
      </Typography>

      {/* Selected range display */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          minHeight: 36,
          px: 1,
          mb: 1.5,
          borderRadius: 2,
          bgcolor: CALENDAR_SURFACE,
          color: CALENDAR_MUTED,
          fontSize: 12,
        }}
      >
        <Box
          component="span"
          sx={{ color: startDate ? CALENDAR_TEXT : CALENDAR_MUTED }}
        >
          {formatCalendarDate(startDate) || "Start date"}
        </Box>

        <Box component="span">→</Box>

        <Box
          component="span"
          sx={{ color: endDate ? CALENDAR_TEXT : CALENDAR_MUTED }}
        >
          {formatCalendarDate(endDate) || "End date"}
        </Box>
      </Box>

      {/* Month navigation */}
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
          sx={{ color: CALENDAR_MUTED }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: CALENDAR_TEXT,
          }}
        >
          {monthLabel}
        </Typography>

        <IconButton
          size="small"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
          sx={{ color: CALENDAR_MUTED }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      {/* Weekday headings */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          textAlign: "center",
          mb: 0.5,
        }}
      >
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <Typography
            key={day}
            sx={{
              py: 0.5,
              fontSize: 10,
              fontWeight: 600,
              color: CALENDAR_MUTED,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "3px 0",
        }}
      >
        {days.map((day, index) => {
          if (day === null) {
            return <Box key={`blank-${index}`} sx={{ height: 32 }} />;
          }

          const date = makeDateValue(day);
          const isStart = date === startDate;
          const isEnd = date === endDate;
          const isSelected = isStart || isEnd;

          const isInRange =
            Boolean(startDate && endDate) &&
            date >= startDate &&
            date <= endDate;

          return (
            <Box
              key={date}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 32,
                bgcolor: isSelected
                  ? BROWN
                  : isInRange
                    ? "rgba(148,116,88,0.28)"
                    : "transparent",
                borderRadius: isSelected ? "50%" : 0,
              }}
            >
              <Button
                onClick={() => chooseDate(date)}
                aria-label={date}
                sx={{
                  minWidth: 0,
                  width: 30,
                  height: 30,
                  p: 0,
                  borderRadius: "50%",
                  fontSize: 12,
                  color: isSelected ? "#FFFFFF" : CALENDAR_TEXT,
                  "&:hover": {
                    bgcolor: isSelected ? BROWN_DARK : "rgba(148,116,88,0.3)",
                  },
                }}
              >
                {day}
              </Button>
            </Box>
          );
        })}
      </Box>

      <Typography
        sx={{
          mt: 1,
          minHeight: 18,
          fontSize: 11,
          color: CALENDAR_MUTED,
          textAlign: "center",
        }}
      >
        {!startDate
          ? "Select a start date"
          : !endDate
            ? "Select an end date"
            : `${formatCalendarDate(startDate)} → ${formatCalendarDate(endDate)}`}
      </Typography>
    </Box>
  );
}

export default function CategoryTable({
  categories = [],
  loading = false,
  theme,
  selected = [],
  setSelected,
  page,
  setPage,
  pageSize = 10,
  totalPages = 1,
  totalCategories = 0,
  search,
  setSearch,
  status,
  setStatus,
  sort,
  setSort,
  startDate: controlledStartDate,
  setStartDate: setControlledStartDate,
  endDate: controlledEndDate,
  setEndDate: setControlledEndDate,
  onClear,
  onView,
  onEdit,
  onDelete,
}) {
  const [filterAnchor, setFilterAnchor] = useState(null);

  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  const startDate = controlledStartDate ?? localStartDate;
  const endDate = controlledEndDate ?? localEndDate;

  const updateStartDate = setControlledStartDate ?? setLocalStartDate;
  const updateEndDate = setControlledEndDate ?? setLocalEndDate;

  const sortOrder = sort === "oldest" ? "oldest" : "latest";

  const checkboxSx = {
    p: 0.5,
    mr: 1,
    color: theme.muted,
    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
      color: BROWN,
    },
    "&.Mui-disabled": {
      opacity: 0.35,
    },
  };

  const navButtonSx = {
    height: 36,
    color: theme.text,
    borderColor: theme.border,
    textTransform: "none",
    "&:hover": {
      borderColor: BROWN,
      bgcolor: theme.soft,
    },
    "&.Mui-disabled": {
      color: theme.muted,
      borderColor: theme.border,
      opacity: 0.6,
    },
  };

  const deletable = categories.filter(
    (category) => !Number(category.productCount),
  );

  const allSelected =
    deletable.length > 0 &&
    deletable.every((category) => selected.includes(category.id));

  const someSelected = categories.some((category) =>
    selected.includes(category.id),
  );

  const hasFilters =
    Boolean(search) ||
    status !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate);

  const resetPage = () => setPage(1);

  const toggleOne = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const toggleAll = () => {
    const deletableIds = deletable.map((category) => category.id);

    setSelected((previous) =>
      allSelected
        ? previous.filter((id) => !deletableIds.includes(id))
        : [...new Set([...previous, ...deletableIds])],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    updateStartDate("");
    updateEndDate("");
    resetPage();
    setFilterAnchor(null);
    onClear?.();
  };

  const applyFilters = () => {
    resetPage();
    setFilterAnchor(null);
  };

  const pageNumbers = Array.from(
    { length: Math.max(0, totalPages) },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 || number === totalPages || Math.abs(number - page) <= 2,
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
      {/* Toolbar */}
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
        {/* Status tabs */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            bgcolor: theme.tabsBg || theme.soft,
            p: 0.5,
            borderRadius: 2,
            overflowX: "auto",
            maxWidth: "100%",
          }}
        >
          {TABS.map((tab) => (
            <Button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
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
                bgcolor: status === tab.value ? BROWN : "transparent",
                color:
                  status === tab.value
                    ? "#FFFFFF"
                    : theme.tabText || theme.muted,
                "&:hover": {
                  bgcolor:
                    status === tab.value
                      ? BROWN
                      : theme.tabHover || "rgba(0,0,0,.04)",
                },
              }}
            >
              {tab.label}
              {tab.value === "all" && (
                <Box component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                  ({totalCategories})
                </Box>
              )}
            </Button>
          ))}
        </Box>

        {/* Search, filter and sorting */}
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
              placeholder="Search category"
              inputProps={{ "aria-label": "Search category" }}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                color: theme.text,
                "& input::placeholder": {
                  color: theme.placeholder || theme.muted,
                  opacity: 1,
                },
              }}
            />

            <Search
              sx={{
                fontSize: 20,
                color: theme.searchIcon || theme.muted,
              }}
            />
          </Box>

          <SquareIconButton
            label="Filter"
            theme={theme}
            onClick={(event) => setFilterAnchor(event.currentTarget)}
          >
            <FilterList fontSize="small" />
          </SquareIconButton>

          {/* Dark filter popover with calendar */}
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
                  width: 300,
                  borderRadius: 1,
                  mt: 1,
                  bgcolor: CALENDAR_BG,
                  color: CALENDAR_TEXT,
                  backgroundImage: "none",
                  border: `1px solid ${CALENDAR_BORDER}`,
                },
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: CALENDAR_TEXT,
                mb: 2,
              }}
            >
              Filter Categories
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                mb: 1,
                color: CALENDAR_TEXT,
              }}
            >
              Status
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              sx={{
                mb: 1,
                "& .MuiInputBase-root": {
                  color: CALENDAR_TEXT,
                  bgcolor: CALENDAR_BG,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: CALENDAR_BORDER,
                },
                "& .MuiSvgIcon-root": {
                  color: CALENDAR_MUTED,
                },
              }}
              slotProps={{
                select: {
                  MenuProps: {
                    slotProps: {
                      paper: {
                        sx: {
                          bgcolor: CALENDAR_BG,
                          color: CALENDAR_TEXT,
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            <DateRangeCalendar
              startDate={startDate}
              endDate={endDate}
              setStartDate={updateStartDate}
              setEndDate={updateEndDate}
            />

            {/* Clear and Done */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 2.5,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStatus("all");
                  updateStartDate("");
                  updateEndDate("");
                  resetPage();
                }}
                sx={{
                  height: 38,
                  color: BROWN,
                  borderColor: BROWN,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#B18D6D",
                    bgcolor: "rgba(148,116,88,.08)",
                  },
                }}
              >
                Clear
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={applyFilters}
                sx={{
                  height: 38,
                  bgcolor: BROWN,
                  color: "#FFFFFF",
                  textTransform: "none",
                  "&:hover": { bgcolor: BROWN_DARK },
                }}
              >
                Done
              </Button>
            </Box>
          </Popover>

          <SquareIconButton
            label={
              sortOrder === "latest"
                ? "Newest first — click for oldest"
                : "Oldest first — click for newest"
            }
            theme={theme}
            onClick={() => {
              setSort(sortOrder === "latest" ? "oldest" : "latest");
              resetPage();
            }}
          >
            <SwapVert fontSize="small" />
          </SquareIconButton>

          {hasFilters && (
            <Button
              onClick={clearFilters}
              sx={{
                textTransform: "none",
                color: BROWN,
                height: 40,
              }}
            >
              Clear all
            </Button>
          )}
        </Box>
      </Box>

      {/* Category table */}
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
              color: theme.headText || theme.text,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                disabled={deletable.length === 0 || loading}
                onChange={toggleAll}
                sx={checkboxSx}
              />
              <span>No.</span>
            </Box>

            <span>Category Id</span>
            <span>Category</span>
            <span>Products</span>
            <span>Status</span>
            <span>Created</span>
            <span>Actions</span>
          </Box>

          {loading ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress size={28} sx={{ color: BROWN }} />
            </Box>
          ) : (
            categories.map((category, index) => {
              const inUse = Number(category.productCount) > 0;

              const [statusColor, StatusIcon] = category.isActive
                ? STATUS.Active
                : STATUS.Inactive;

              return (
                <Box
                  key={category.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: COLUMNS,
                    gap: 1,
                    alignItems: "center",
                    px: 1,
                    py: 1.25,
                    fontSize: 13,
                    borderBottom: `1px solid ${
                      theme.rowDivider || theme.border
                    }`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      size="small"
                      checked={selected.includes(category.id)}
                      disabled={inUse}
                      onChange={() => toggleOne(category.id)}
                      title={
                        inUse
                          ? `${category.productCount} product(s) use this category`
                          : "Select category"
                      }
                      sx={checkboxSx}
                    />

                    <span>{(page - 1) * pageSize + index + 1}</span>
                  </Box>

                  <span>{categoryCode(category)}</span>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    <IconBox src={category.image} theme={theme} />

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13 }} noWrap>
                        {category.name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,
                          color: theme.muted,
                        }}
                        noWrap
                      >
                        {category.description || "No description"}
                      </Typography>
                    </Box>
                  </Box>

                  <span>{category.productCount ?? 0}</span>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      color: statusColor,
                    }}
                  >
                    <StatusIcon sx={{ fontSize: 20 }} />
                    <span>{category.isActive ? "Active" : "Inactive"}</span>
                  </Box>

                  <span>{formatDate(category.createdAt)}</span>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      title="View"
                      aria-label={`View ${category.name}`}
                      onClick={() => onView?.(category)}
                      sx={{ color: BROWN }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      title="Edit"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => onEdit?.(category)}
                      sx={{ color: GREEN }}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      title={
                        inUse
                          ? `${category.productCount} product(s) use this category`
                          : "Delete"
                      }
                      aria-label={`Delete ${category.name}`}
                      disabled={inUse}
                      onClick={() => onDelete?.(category)}
                      sx={{
                        color: RED,
                        "&.Mui-disabled": {
                          color: theme.muted,
                          opacity: 0.4,
                        },
                      }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })
          )}

          {!loading && categories.length === 0 && (
            <Typography
              sx={{
                py: 4,
                textAlign: "center",
                fontSize: 13,
                color: theme.muted,
              }}
            >
              No categories found
            </Typography>
          )}
        </Box>
      </Box>

      {/* Pagination */}
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
          disabled={loading || page <= 1}
          onClick={() => setPage((previous) => Math.max(1, previous - 1))}
          sx={navButtonSx}
        >
          Previous
        </Button>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {visiblePages.map((number, index) => (
            <Button
              key={`${number}-${index}`}
              disabled={number === "..." || loading}
              onClick={() => setPage(number)}
              sx={{
                minWidth: 0,
                width: 36,
                height: 36,
                fontSize: 13,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor:
                  page === number
                    ? theme.pageActive || BROWN_LIGHT
                    : theme.border,
                bgcolor:
                  page === number
                    ? theme.pageActive || BROWN_LIGHT
                    : "transparent",
                color: page === number ? BROWN : theme.text,
                fontWeight: page === number ? 700 : 400,
                "&:hover": { bgcolor: theme.soft },
                "&.Mui-disabled": {
                  color: page === number ? BROWN : theme.muted,
                },
              }}
            >
              {number}
            </Button>
          ))}
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={loading || page >= totalPages}
          onClick={() =>
            setPage((previous) => Math.min(totalPages, previous + 1))
          }
          sx={navButtonSx}
        >
          Next
        </Button>
      </Box>
    </Card>
  );
}
