import { ArrowForward } from "@mui/icons-material";
import { Box } from "@mui/material";
import { U, ROOM } from "../../assets/furnitureImages";
import { stagger } from "../../utils/dashboardUtils";
import { SECTION_PY, SIDE, zoomOnHover } from "../../styles/dashboardStyles";
import { Reveal } from "./Reveal";

// ---------- Rooms ----------
export function Rooms() {
  const tiles = [
    {
      name: "Bedroom",
      img: U(ROOM.bedroom, 1000, 600),
      grid: { gridColumn: { xs: "1 / 3", md: "1 / 3" }, gridRow: { md: 1 } },
      bg: "var(--c-dedbd5)",
    },
    {
      name: "Kitchen",
      img: U(ROOM.dining, 600, 900),
      grid: { gridColumn: { md: 3 }, gridRow: { md: "1 / 3" } },
      bg: "#c9b8a8",
    },
    {
      name: "Living room",
      img: U(ROOM.living, 600, 500),
      grid: { gridColumn: { md: 1 }, gridRow: { md: 2 } },
      bg: "var(--c-e8e0d6)",
    },
    {
      name: "Hallway",
      img: U(ROOM.interior, 600, 500),
      grid: { gridColumn: { md: 2 }, gridRow: { md: 2 } },
      bg: "#a99b8d",
    },
  ];

  return (
    <Box sx={{ px: SIDE, py: SECTION_PY }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gridTemplateRows: { md: "1fr 1fr" },
          aspectRatio: { md: "1296 / 637" },
          gap: { xs: 2, md: "17px" },
        }}
      >
        {tiles.map((item, index) => (
          <Reveal
            key={item.name}
            direction="zoom"
            delay={stagger(index, 140)}
            sx={{
              display: "flex",
              minHeight: { xs: 170, md: 0 },
              ...item.grid,
            }}
          >
            <Box
              sx={{
                position: "relative",
                flex: 1,
                overflow: "hidden",
                background: item.bg,
                cursor: "pointer",
                ...zoomOnHover,
                "&:hover .fs-room-label": { pl: "20px" },
                "&:hover .fs-room-arrow": { transform: "translateX(5px)" },
              }}
            >
              <Box
                component="img"
                src={item.img}
                alt={item.name}
                loading="lazy"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                className="fs-room-label"
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  bgcolor: "rgba(72,68,66,.92)",
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 1,
                  px: "14px",
                  py: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "padding-left .3s ease",
                }}
              >
                {item.name}
                <ArrowForward
                  className="fs-room-arrow"
                  sx={{ fontSize: 14, transition: "transform .3s ease" }}
                />
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

