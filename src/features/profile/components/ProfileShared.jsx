import { Box, Typography, Button, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import { LIGHT_BG } from "../profileStyles";
import { brownBtn, fieldSx } from "../profileStyles";

export function Field({ error, sx, ...props }) {
  return (
    <TextField
      size="small"
      fullWidth
      error={Boolean(error)}
      helperText={error}
      sx={{ ...fieldSx, ...sx }}
      {...props}
    />
  );
}

export function PanelTitle({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: { xs: 3, lg: 4 },
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 22, md: 26, lg: 30 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: { xs: 13, lg: 14 },
              color: "var(--c-777777)",
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

export function EmptyState({ Icon, title, text, to, button }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: { xs: 6, lg: 10 },
        bgcolor: LIGHT_BG,
        color: "var(--c-777777)",
      }}
    >
      <Icon sx={{ fontSize: 56 }} />
      <Typography
        sx={{
          fontSize: { xs: 18, md: 20 },
          fontWeight: 600,
          color: "var(--c-111111)",
          mt: 1,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 14, mt: 0.5 }}>{text}</Typography>
      {to && (
        <Button component={Link} to={to} sx={{ ...brownBtn, mt: 3 }}>
          {button}
        </Button>
      )}
    </Box>
  );
}
