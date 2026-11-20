import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { H2 } from "../dashboardStyles";
import { Reveal } from "../../../components/common/Reveal";

export function SectionHeader({ title }) {
  const navigate = useNavigate();

  return (
    <Reveal>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 3, md: "48px" },
        }}
      >
        <Typography sx={H2}>{title}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/Shop")}
          sx={{
            width: 120,
            height: 40,
            borderRadius: 0,
            borderColor: "var(--c-111111)",
            color: "var(--c-111111)",
            fontSize: 14,
            fontWeight: 400,
            textTransform: "none",
            transition: "background-color .25s ease, color .25s ease",
            "&:hover": {
              borderColor: "var(--c-111111)",
              bgcolor: "var(--c-111111)",
              color: "#fff",
            },
          }}
        >
          View all
        </Button>
      </Box>
    </Reveal>
  );
}
