import { Box, Typography, Button } from "@mui/material";
import { HERO_CARDS } from "../../features/dashboard/dashboardData";
import { anim, money } from "../../utils/dashboardUtils";
import { BROWN, zoomOnHover } from "../../styles/dashboardStyles";
import { useProducts } from "../../hooks/useDashboardData";

// ---------- Hero ----------
export function Hero() {
  const { items } = useProducts({ sort: "latest", limit: 3 });

  // Same 4 slots as before: product, promo, product, product
  let next = 0;
  const heroCards = HERO_CARDS.map((card) => {
    if (card.promo) return card;
    const product = items[next++];
    return product
      ? {
        price: `$${money(product.price)}`,
        img: product.img || card.img,
        name: product.name,
      }
      : card;
  });

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: { xs: 460, md: 480, xl: 583 },
        bgcolor: "#16131f",
        color: "#fff",
        px: { xs: 2, sm: 4, md: "10%" },
        py: { xs: 6, md: 0 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* Background image with a slow zoom (Ken Burns) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            `linear-gradient(90deg, rgba(22,18,15,.88) 0%, rgba(22,18,15,.6) 47%, rgba(22,18,15,.25) 100%), ` +
            `url("https://images.unsplash.com/photo-1679215805560-3c8236d86862?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D") center/cover no-repeat #16131f`,
          animation: "fs-kenburns 22s ease-in-out infinite alternate",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "inline-block",
            bgcolor: "#2b2927",
            px: "12px",
            py: "5px",
            fontSize: 12,
            mb: "22px",
            animation: anim("fs-fadeUp", 100),
          }}
        >
          Furniture
        </Box>

        <Typography
          sx={{
            fontSize: { xs: 36, md: 42, lg: 48, xl: 52 },
            fontWeight: 600,
            lineHeight: 1.15,
            animation: anim("fs-fadeUp", 250, 900),
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
            mt: "32px",
            mb: "44px",
            maxWidth: 380,
            animation: anim("fs-fadeUp", 450),
          }}
        >
          Mi tristique est nunc sapien orci tortor ac. Suspendisse leo et cursus
          pharetra tellus tincidunt.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: "8px",
            animation: anim("fs-fadeUp", 650),
          }}
        >
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: BROWN,
              borderRadius: 0,
              textTransform: "none",
              fontSize: 13,
              minWidth: 133,
              height: 45,
              transition: "transform .25s ease, background-color .25s ease",
              "&:hover": { bgcolor: "#7d6149", transform: "translateY(-3px)" },
            }}
          >
            Shop now
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderRadius: 0,
              color: "#fff",
              borderColor: "rgba(255,255,255,.55)",
              textTransform: "none",
              fontSize: 13,
              minWidth: 137,
              height: 45,
              transition: "transform .25s ease, border-color .25s ease",
              "&:hover": {
                borderColor: "#fff",
                bgcolor: "transparent",
                transform: "translateY(-3px)",
              },
            }}
          >
            Learn more
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          width: "100%",
          maxWidth: { xs: 360, md: 340, xl: 380 },
          justifySelf: { xs: "start", md: "end" },
        }}
      >
        {heroCards.map((item, index) => (
          // Outer box: pops in on load. Inner box: floats gently forever.
          <Box
            key={index}
            sx={{
              aspectRatio: "1",
              animation: anim("fs-popIn", 500 + index * 140, 800),
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                bgcolor: item.promo ? BROWN : "var(--c-f4f3f1)",
                color: item.promo ? "#fff" : BROWN,
                p: item.promo ? "12px" : 0,
                fontSize: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: item.promo ? "center" : "flex-start",
                justifyContent: item.promo ? "center" : "flex-start",
                textAlign: "center",
                overflow: "hidden",
                boxSizing: "border-box",
                animation: `fs-float ${5 + index * 0.7}s ease-in-out ${index * 0.5}s infinite`,
                transition: "box-shadow .3s ease",
                "&:hover": { boxShadow: "0 16px 32px rgba(0,0,0,.4)" },
                ...zoomOnHover,
              }}
            >
              {item.promo ? (
                <>
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}
                  >
                    25% OFF
                  </Typography>
                  <Typography sx={{ fontSize: 12, mt: "8px", lineHeight: 1.4 }}>
                    custom-made
                    <br />
                    furniture
                  </Typography>
                </>
              ) : (
                <>
                  {/* Whole product is shown (contain), centred, and kept clear
                      of the price tag, so every card looks the same size */}
                  <Box
                    component="img"
                    src={item.img}
                    alt={item.name || ""}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      boxSizing: "border-box",
                      p: "34px 12px 12px",
                      objectFit: "contain",
                      objectPosition: "center bottom",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      m: "10px",
                      px: "8px",
                      py: "2px",
                      bgcolor: "var(--c-f4f3f1)",
                      color: BROWN,
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      letterSpacing: ".02em",
                      boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                    }}
                  >
                    {item.price}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

