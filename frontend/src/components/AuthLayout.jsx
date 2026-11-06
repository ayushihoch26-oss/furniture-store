import { Box, Typography } from "@mui/material";

import { U, ROOM } from "../assets/furnitureImages";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          minHeight: { md: 640 },
          bgcolor: "var(--c-f4f2f0)",
        }}
      >
        {/* Image side */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "flex-end",
            background: `
              linear-gradient(rgba(22,18,15,.25), rgba(22,18,15,.55)),
              url(${U(ROOM.interior, 1000, 900)}) center/cover no-repeat
            `,
            color: "#fff",
            p: "56px",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 600,
                lineHeight: 1.2,
                mb: "12px",
              }}
            >
              Where Traditional
              <br />
              Meets Modern
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                lineHeight: 1.7,
                color: "rgba(255,255,255,.8)",
                maxWidth: 360,
              }}
            >
              Create an account to save your favourites, track orders and get
              25% off custom-made furniture.
            </Typography>
          </Box>
        </Box>

        {/* Form side */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 4 },
            py: { xs: 6, md: 8 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Typography
              sx={{
                fontSize: { xs: 26, md: 32 },
                fontWeight: 600,
                color: "var(--c-111111)",
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{ fontSize: 14, color: "var(--c-777777)", mt: "8px", mb: "32px" }}
            >
              {subtitle}
            </Typography>

            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
