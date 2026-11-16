import { memo } from "react";

import { Box, Typography, IconButton, Checkbox } from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

// Colors
const BROWN = "#947458";
const GREEN = "#2E9E5B";
const RED = "#E5484D";
const YELLOW = "#F5B301";

// Status colors
const STATUS_COLOR = {
  Active: GREEN,
  Inactive: RED,
  VIP: YELLOW,
};

// Table headings
const HEADERS = [
  "Customer Id",
  "Name",
  "Phone",
  "Email",
  "Gender",
  "Status",
  "Action",
];

const COLUMNS = "repeat(7, minmax(0, 1fr))";

// Memo prevents re-rendering when props have not changed
function CustomerTable({
  customers = [],
  selected = [],
  message = "No customers found",
  theme,
  darkMode = false,
  onToggle,
  onToggleAll,
  onView,
  onDelete,
}) {
  const allSelected =
    customers.length > 0 &&
    customers.every((customer) => selected.includes(customer.id));

  const someSelected = customers.some((customer) =>
    selected.includes(customer.id),
  );

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ minWidth: 800 }}>
        {/* Table Header */}
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
            textAlign: "center",
          }}
        >
          {HEADERS.map((header) => (
            <Box
              key={header}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {header === "Customer Id" && (
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={onToggleAll}
                  sx={{
                    p: 0.25,
                    ...(darkMode && { color: theme.muted }),
                    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                      color: BROWN,
                    },
                  }}
                />
              )}

              {header}
            </Box>
          ))}
        </Box>

        {/* Customer Rows */}
        {customers.map((customer) => (
          <Box
            key={customer.id}
            sx={{
              display: "grid",
              gridTemplateColumns: COLUMNS,
              gap: 1,
              alignItems: "center",
              px: 1.5,
              py: 2,
              fontSize: 13,
              textAlign: "center",
              borderBottom: `1px solid ${theme.divider}`,
            }}
          >
            {/* Customer ID and checkbox */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.25,
              }}
            >
              <Checkbox
                size="small"
                checked={selected.includes(customer.id)}
                onChange={() => onToggle(customer.id)}
                sx={{
                  p: 0.25,
                  ...(darkMode && { color: theme.muted }),
                  "&.Mui-checked": { color: BROWN },
                }}
              />

              <span>{customer.code || "-"}</span>
            </Box>

            {/* Customer Information */}
            <span>{customer.name || "-"}</span>
            <span>{customer.phone || "-"}</span>
            <span>{customer.email || "-"}</span>
            <span>{customer.gender || "-"}</span>

            {/* Customer Status */}
            <span
              style={{
                color: STATUS_COLOR[customer.status] || theme.muted,
              }}
            >
              ● {customer.status || "-"}
            </span>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <IconButton
                size="small"
                aria-label="Message"
                onClick={() => onView(customer)}
                sx={{
                  color: theme.headText,
                  "&:hover": {
                    backgroundColor: theme.headerHover,
                  },
                }}
              >
                <ChatOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>

              <IconButton
                size="small"
                title="Delete"
                aria-label="Delete customer"
                onClick={() => onDelete(customer)}
                sx={{ color: RED }}
              >
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}

        {/* Empty or Loading Message */}
        {customers.length === 0 && (
          <Typography
            sx={{
              py: 4,
              textAlign: "center",
              fontSize: 13,
              color: theme.muted,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default memo(CustomerTable);
