import { useEffect, useState } from "react";
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
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  BlockOutlined,
} from "@mui/icons-material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

// ---------- Colors ----------
const BROWN = "#947458";
const BROWN_DARK = "#7d6149";
const BROWN_LIGHT = "#F3ECE5";
const BG = "#F7F7F7";
const GREEN = "#2E9E5B";
const RED = "#E5484D";

export const ROLES = ["Super Admin", "Manager", "Editor", "Support"]; //eslint-disable-line

const TABS = ["All member", "Active", "Inactive"];

const STATUS = {
  Active: [GREEN, CheckCircleOutlined],
  Inactive: [RED, BlockOutlined],
};

const COLUMNS = "70px 110px minmax(220px, 2.4fr) 1.1fr 1.1fr 1fr 120px";

const SEARCH_DELAY = 400; // ms to wait after typing before asking the server

// ---------- Reusable components ----------
function Card({ children, sx, theme }) {
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

function IconBox({ size = 44, children, theme }) {
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

function RoleTag({ role, theme }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.25,
        py: 0.25,
        fontSize: 12,
        borderRadius: 5,
        bgcolor: theme.roleBg,
        color: theme.roleText,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {role}
    </Box>
  );
}

// ---------- Authority table ----------
// Search, tab (status), role filter, sorting and pagination are done by the
// backend. This component only shows the current page and tells the parent
// (onQueryChange) what the user asked for.
export default function AuthorityTable({
  members = [],
  selected,
  setSelected,
  page,
  setPage,
  pageSize = 10,
  totalPages = 0,
  memberTotal = 0,
  loading = false,
  onQueryChange,
  onView,
  onEdit,
  onDelete,
  darkMode = false,
}) {
  const [tab, setTab] = useState("All member");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [role, setRole] = useState("All");

  // Same theme colors as CartTable
  const theme = {
    card: darkMode ? "#292421" : "#fff",
    text: darkMode ? "#F5F0EB" : "#222",
    headText: darkMode ? "#F5F0EB" : "#333",
    muted: darkMode ? "#B8AAA0" : "#777",
    searchIcon: darkMode ? "#B8AAA0" : "#666",
    iconButton: darkMode ? "#F5F0EB" : "#444",
    border: darkMode ? "#403832" : "#E8EDF3",
    soft: darkMode ? "#332D28" : BG,
    header: darkMode ? "#332D28" : BROWN_LIGHT,
    tabsBg: darkMode ? "#332D28" : BG,
    tabText: darkMode ? "#B8AAA0" : "#555",
    tabHover: darkMode ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)",
    pageActive: darkMode ? "#403832" : BROWN_LIGHT,
    rowDivider: darkMode ? "#403832" : "#eee",
    roleBg: darkMode ? "#40352C" : BROWN_LIGHT,
    roleText: darkMode ? "#D7B89A" : BROWN_DARK,
  };

  const paperSx = darkMode
    ? {
        bgcolor: theme.card,
        color: theme.text,
        backgroundImage: "none",
      }
    : {};

  const fieldSx = darkMode
    ? {
        "& .MuiInputBase-root": { color: theme.text },
        "& .MuiInputBase-input": { colorScheme: "dark" },
        "& .MuiInputLabel-root": { color: theme.muted },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.border,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.muted,
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: BROWN,
        },
        "& .MuiSvgIcon-root": { color: theme.muted },
      }
    : {};

  const closeFilter = () => setFilterAnchor(null);

  // Wait until the user stops typing, then search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [search]);

  // Tell the parent what to ask the server for
  useEffect(() => {
    onQueryChange?.({
      search: debouncedSearch.trim(),
      status: tab === "All member" ? "" : tab,
      role: role === "All" ? "" : role,
      sortOrder,
    });
  }, [debouncedSearch, tab, role, sortOrder, onQueryChange]);

  const rows = members;

  const toggleSelected = (id) =>
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );

  // "Select all" works on the rows of the current page
  const allSelected =
    rows.length > 0 && rows.every((item) => selected.includes(item.id));

  const someSelected = rows.some((item) => selected.includes(item.id));

  const toggleAll = () =>
    setSelected((previous) =>
      allSelected
        ? previous.filter((id) => !rows.some((item) => item.id === id))
        : [...new Set([...previous, ...rows.map((item) => item.id)])],
    );

  // 1 ... 4 5 6 ... 24
  const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (number) =>
        number === 1 || number === totalPages || Math.abs(number - page) <= 1,
    )
    .reduce((items, number, index, list) => {
      if (index > 0 && number - list[index - 1] > 1) {
        items.push(`ellipsis-${number}`);
      }
      items.push(number);
      return items;
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
        {/* Tabs */}
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
              onClick={() => setTab(name)}
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
              {name === "All member" && (
                <Box component="span" sx={{ ml: 0.5, opacity: 0.8 }}>
                  ({memberTotal})
                </Box>
              )}
            </Button>
          ))}
        </Box>

        {/* Search, filter and sort */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
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
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member"
              sx={{
                flex: 1,
                fontSize: 13,
                ...(darkMode && {
                  color: theme.text,
                  "& input::placeholder": {
                    color: theme.muted,
                    opacity: 1,
                  },
                }),
              }}
            />
            <Search sx={{ fontSize: 20, color: theme.searchIcon }} />
          </Box>

          <SquareIconButton
            label="Filter"
            theme={theme}
            onClick={(event) => setFilterAnchor(event.currentTarget)}
          >
            <FilterList fontSize="small" />
          </SquareIconButton>

          <Popover
            open={Boolean(filterAnchor)}
            anchorEl={filterAnchor}
            onClose={closeFilter}
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
                  width: 290,
                  borderRadius: 3,
                  mt: 1,
                  ...paperSx,
                },
              },
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              Filter Members
            </Typography>

            <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>
              Role
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              sx={fieldSx}
              slotProps={{
                select: {
                  MenuProps: {
                    slotProps: {
                      paper: { sx: paperSx },
                    },
                  },
                },
              }}
            >
              <MenuItem value="All">All Roles</MenuItem>
              {ROLES.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setRole("All")}
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
                onClick={closeFilter}
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
            label="Sort by last active"
            theme={theme}
            onClick={() =>
              setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"))
            }
          >
            <SwapVert fontSize="small" />
          </SquareIconButton>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 900 }}>
          {/* Header */}
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

            <span>Member Id</span>
            <span>Member</span>
            <span>Role</span>
            <span>Last Active</span>
            <span>Status</span>
            <span>Actions</span>
          </Box>

          {/* Rows */}
          {rows.map((item, i) => {
            const [statusColor, StatusIcon] = STATUS[item.status] || [
              theme.muted,
              PersonOutlinedIcon,
            ];

            const isOwner = item.role === "Super Admin";

            return (
              <Box
                key={item.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: COLUMNS,
                  gap: 1,
                  alignItems: "center",
                  px: 1,
                  py: 1.25,
                  fontSize: 13,
                  color: theme.text,
                  borderBottom: `1px solid ${theme.rowDivider}`,
                  opacity: loading ? 0.6 : 1,
                  transition: "opacity .15s ease",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    size="small"
                    checked={selected.includes(item.id)}
                    disabled={isOwner}
                    onChange={() => toggleSelected(item.id)}
                    sx={{
                      p: 0.5,
                      mr: 1,
                      color: theme.muted,
                      "&.Mui-checked": { color: BROWN },
                      "&.Mui-disabled": {
                        color: theme.border,
                      },
                    }}
                  />
                  <span>{(page - 1) * pageSize + i + 1}</span>
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
                    <PersonOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconBox>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, color: theme.text }} noWrap>
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

                <Box>
                  <RoleTag role={item.role} theme={theme} />
                </Box>

                <span>{item.lastActive}</span>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: statusColor,
                  }}
                >
                  <StatusIcon sx={{ fontSize: 20 }} />
                  <span>{item.status}</span>
                </Box>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    title="View"
                    onClick={() => onView(item)}
                    sx={{ color: BROWN }}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    title="Edit"
                    onClick={() => onEdit(item)}
                    sx={{ color: GREEN }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    title={isOwner ? "Super Admin cannot be deleted" : "Delete"}
                    disabled={isOwner}
                    onClick={() => onDelete(item)}
                    sx={{
                      color: RED,
                      "&.Mui-disabled": {
                        color: theme.border,
                      },
                    }}
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })}

          {rows.length === 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5,
                py: 4,
                color: theme.muted,
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: BROWN }} />
                  <Typography sx={{ fontSize: 13 }}>
                    Loading members…
                  </Typography>
                </>
              ) : (
                <Typography sx={{ fontSize: 13 }}>No members found</Typography>
              )}
            </Box>
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
          onClick={() => setPage((p) => Math.max(1, p - 1))}
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {pageItems.map((p) =>
            typeof p === "string" ? (
              <Typography key={p} sx={{ color: theme.muted }}>
                …
              </Typography>
            ) : (
              <Button
                key={p}
                disabled={loading}
                onClick={() => setPage(p)}
                sx={{
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: page === p ? theme.pageActive : theme.border,
                  bgcolor: page === p ? theme.pageActive : "transparent",
                  color: page === p ? BROWN : theme.text,
                  fontWeight: page === p ? 700 : 400,
                }}
              >
                {p}
              </Button>
            ),
          )}
        </Box>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          disabled={loading || page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
