import { Box, Typography } from "@mui/material";

export default function HighlightCard({ title, text }) {
  return (
    <Box sx={{ p: 3, bgcolor: "#f7f5f2" }}>
      <Typography component="h3" sx={{ fontSize: 20, fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
        {text}
      </Typography>
    </Box>
  );
}
