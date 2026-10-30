import { memo, useEffect, useRef, useState } from "react";
import { Box, Typography, Button, GlobalStyles } from "@mui/material";
import {
  ArrowForward,
  PlayArrow,
  Person,
  Chair,
  Kitchen,
  Weekend,
  EventSeat,
} from "@mui/icons-material";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import bg1 from "../assets/aboutus-bg.jpg";
import sofa from "../assets/banner.jpg";
import featureleft from "../assets/aboutpage-fea.png";
import images from "../assets/images.jpg";

import { U, ROOM } from "../assets/furnitureImages";

// ---------- Constants ----------
const BROWN = "#947458";
const GREY_BG = "var(--c-f4f3f1)";
const SIDE = { xs: 2, md: "16.4%" };
const GAP = { xs: "12px", md: "13px" };
const EASE = "cubic-bezier(.2,.7,.2,1)";

const heading = {
  fontSize: { xs: 24, md: 30 },
  fontWeight: 600,
  color: "var(--c-111111)",
  lineHeight: 1.2,
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const anim = (name, delay = 0, duration = 800) =>
  `${name} ${duration}ms ${EASE} ${delay}ms both`;

const stagger = (index, step = 100, max = 6) => Math.min(index, max) * step;

const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
  zoom: "scale(.92)",
  none: "none",
};

const zoomOnHover = {
  overflow: "hidden",
  "& img": { transition: `transform .7s ${EASE}` },
  "&:hover img": { transform: "scale(1.07)" },
};

const ANIMATION_STYLES = {
  "@keyframes fs-fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes fs-kenburns": {
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.1)" },
  },
  "@keyframes fs-pulse": {
    "0%": { transform: "scale(1)", opacity: 0.6 },
    "100%": { transform: "scale(1.9)", opacity: 0 },
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".fs-about *, .fs-about *::before, .fs-about *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important",
      transitionDelay: "0s !important",
    },
  },
};

// ---------- Image helpers ----------
const image = (id) => ({
  src: U(id, 1200, 800),
  fallback: U(ROOM.showroom, 1200, 800),
});

const IMAGES = {
  hero: { src: bg1, fallback: bg1 },
  banner: { src: sofa, fallback: sofa },
  featureLeft: { src: featureleft, fallback: featureleft },
  featureRight: { src: images, fallback: images },
  video: image("photo-1600607687939-ce8a6c25118c"),

  collections: [
    image("photo-1530018607912-eff2daa1bac4"),
    image("photo-1615066390971-03e4e1c36ddf"),
  ],

  instagram: [
    image("photo-1616486338812-3dadae4b4ace"),
    image("photo-1600607687920-4e2a09cf159d"),
    image("photo-1555041469-a586c61ea9bc"),
    image("photo-1600210492486-724fe5c67fb0"),
    image("photo-1586023492125-27b2c045efd7"),
  ],
};

const STATS = [
  { icon: Chair, value: "860+", label: "Armchairs" },
  { icon: Kitchen, value: "1800", label: "Cabinets" },
  { icon: Weekend, value: "2k+", label: "Sofas" },
  { icon: EventSeat, value: "2500", label: "Chairs" },
];

const TEAM = [
  { name: "Ian Dyer", role: "Consultant" },
  { name: "Brianna Fitzgerald", role: "Manager" },
  { name: "Heath Barry", role: "Consultant" },
];

const COLLECTIONS = [
  {
    title: "New Collection Quisque Libero",
    text: "Est nulla tincidunt commodo massa. Nunc interdum cras id augue. Tortor cras pharetra ac dignissim hendrerit fames fermentum.",
  },
  {
    title: "New Collection Nisi Imperdiet",
    text: "Ultrices porttitor lacus sed condimentum nulla viverra. Maecenas sed nisi imperdiet sed lorem sed quis sagittis in.",
  },
];

// ---------- Scroll reveal hook ----------
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(prefersReducedMotion);

  useEffect(() => {
    if (seen) return undefined;

    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}

// ---------- Reusable components ----------
const Photo = memo(function Photo({ img, alt = "", eager = false }) {
  const [source, setSource] = useState(img.src);

  useEffect(() => {
    setSource(img.src);
  }, [img.src]);

  const handleError = () => {
    setSource((current) => (current === img.fallback ? current : img.fallback));
  };

  return (
    <Box
      component="img"
      src={source}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={handleError}
      sx={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        bgcolor: "var(--c-d9d2ca)",
      }}
    />
  );
});

const Reveal = memo(function Reveal({
  children,
  delay = 0,
  direction = "up",
  sx,
  ...rest
}) {
  const [ref, seen] = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : REVEAL_FROM[direction],
        transition: `opacity .7s ease ${delay}ms, transform .8s ${EASE} ${delay}ms`,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

function BrownButton({ children, sx = {}, ...rest }) {
  return (
    <Button
      variant="contained"
      disableElevation
      {...rest}
      sx={{
        bgcolor: BROWN,
        color: "#fff",
        borderRadius: 0,
        textTransform: "none",
        fontSize: 11,
        fontWeight: 400,
        minWidth: 93,
        height: 26,
        px: 2,
        transition: "transform .25s ease, background-color .25s ease",
        "&:hover": {
          bgcolor: "#7d6149",
          transform: "translateY(-3px)",
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

// ---------- Hero ----------
function PageHero() {
  return (
    <Box
      sx={{
        aspectRatio: { xs: "16 / 9", md: "1036 / 387" },
        overflow: "hidden",
        animation: anim("fs-fadeIn", 0, 1000),
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          animation: "fs-kenburns 20s ease-in-out infinite alternate",
        }}
      >
        <Photo img={IMAGES.hero} alt="Furniture showroom" eager />
      </Box>
    </Box>
  );
}

// ---------- Introduction ----------
function Intro() {
  const text = {
    fontSize: { xs: 13, md: 14 },
    lineHeight: { xs: "19px", md: "20px" },
    color: "var(--c-111111)",
  };

  return (
    <Box
      sx={{
        bgcolor: "var(--c-ffffff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: "40px", md: "60px", lg: "80px" },
        px: { xs: 2, sm: 4 },
        py: { xs: "56px", md: "80px", lg: "120px" },
      }}
    >
      <Reveal sx={{ width: "100%", maxWidth: 720 }}>
        <Typography
          component="h1"
          sx={{
            width: "100%",
            textAlign: "center",
            fontSize: { xs: 24, sm: 30, md: 36, lg: 40 },
            fontWeight: 700,
            lineHeight: 1.25,
            color: "var(--c-111111)",
          }}
        >
          Lectus morbi eget justo tellus facilisi orci venenatis aliquet.
          Egestas rutrum volutpat pretium curabitur scelerisque.
        </Typography>
      </Reveal>

      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          columnGap: "40px",
          rowGap: "16px",
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Reveal delay={100}>
            <Typography sx={text}>
              Mi tristique est nunc sapien orci tortor ac. Suspendisse leo et
              cursus pharetra tellus tincidunt. Risus nulla penatibus donec
              elementum nulla. Pellentesque ipsum consequat velit blandit vel
              ornare augue magna.
            </Typography>
          </Reveal>

          <Reveal delay={200}>
            <Typography sx={text}>
              Suspendisse leo et cursus pharetra tellus tincidunt. Risus nulla
              penatibus donec elementum nulla. Pellentesque ipsum consequat
              velit blandit vel ornare augue magna.
            </Typography>
          </Reveal>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Reveal delay={250}>
            <Typography sx={text}>
              Suspendisse leo et cursus pharetra tellus tincidunt. Risus nulla
              penatibus donec elementum nulla.
            </Typography>
          </Reveal>

          <Reveal delay={350}>
            <Typography sx={text}>
              Est nulla tincidunt commodo massa. Nunc interdum cras id augue.
              Tortor cras pharetra ac dignissim hendrerit fames fermentum.
            </Typography>
          </Reveal>

          <Reveal delay={450}>
            <Typography
              sx={{
                display: "inline-block",
                position: "relative",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.4px",
                color: "var(--c-111111)",
                cursor: "pointer",
                mt: "4px",
                transition: "color .25s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: -2,
                  height: "1px",
                  width: "100%",
                  bgcolor: BROWN,
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform .3s ease",
                },
                "&:hover": { color: BROWN },
                "&:hover::after": { transform: "scaleX(1)" },
              }}
            >
              READ MORE
            </Typography>
          </Reveal>
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Banner ----------
function Banner() {
  const [imageRef, imageSeen] = useInView(0.2);

  return (
    <>
      <Box
        ref={imageRef}
        sx={{
          width: "100%",
          height: { xs: "auto", md: 640 },
          aspectRatio: { xs: "16 / 9", md: "auto" },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            transform: imageSeen ? "scale(1)" : "scale(1.15)",
            transition: `transform 1.8s ${EASE}`,
          }}
        >
          <Photo img={IMAGES.banner} alt="Cozy living room" />
        </Box>
      </Box>

      <Box sx={{ bgcolor: GREY_BG, px: SIDE, py: { xs: 4, md: 0 } }}>
        <Box
          sx={{
            minHeight: { md: 154 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Reveal direction="left">
            <Typography sx={{ ...heading, fontSize: { xs: 24, md: 28 } }}>
              Live comfortably inside your home
            </Typography>
            <Typography sx={{ fontSize: 12.5, mt: 1 }}>
              Est nulla tincidunt commodo massa. Nunc interdum cras id augue.
            </Typography>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <BrownButton>Shop now</BrownButton>
          </Reveal>
        </Box>
      </Box>
    </>
  );
}

// ---------- Product statistics ----------
function CountUp({ value, duration = 1600 }) {
  const match = String(value).match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";

  const [ref, seen] = useInView(0.4);
  const [current, setCurrent] = useState(() =>
    prefersReducedMotion() ? target : 0,
  );

  useEffect(() => {
    if (!seen) return undefined;

    if (prefersReducedMotion()) {
      setCurrent(target);
      return undefined;
    }

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [seen, target, duration]);

  if (!match) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref}>
      {current}
      {suffix}
    </span>
  );
}

function Stats() {
  return (
    <Box
      sx={{
        px: SIDE,
        py: 6,
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 4,
        textAlign: "center",
      }}
    >
      {STATS.map(({ icon: Icon, value, label }, index) => (
        <Reveal key={label} delay={stagger(index, 120)}>
          <Box
            sx={{
              "&:hover .fs-stat-icon": {
                color: BROWN,
                transform: "translateY(-6px) scale(1.15)",
              },
            }}
          >
            <Icon
              className="fs-stat-icon"
              sx={{
                fontSize: 36,
                color: "var(--c-6b6b6b)",
                transition:
                  "transform .35s cubic-bezier(.3,1.6,.5,1), color .25s ease",
              }}
            />

            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <CountUp value={value} />
            </Typography>

            <Typography sx={{ fontSize: 9.5, color: "var(--c-555555)" }}>
              {label}
            </Typography>
          </Box>
        </Reveal>
      ))}
    </Box>
  );
}

// ---------- Feature cards ----------
function TextCard({ bg, title, text, button }) {
  return (
    <Box
      sx={{
        bgcolor: bg,
        p: { xs: 3, md: "26px 22px" },
        aspectRatio: { md: "342 / 273" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        transition: "box-shadow .4s ease",
        "&:hover": { boxShadow: "0 14px 30px rgba(0,0,0,.08)" },
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 20, md: 40 },
          fontWeight: 600,
          lineHeight: 1.4,
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          lineHeight: "14px",
          color: "var(--c-666666)",
          mb: 3,
        }}
      >
        {text}
      </Typography>

      <Box>
        <BrownButton sx={{ minWidth: 103, height: 25 }}>{button}</BrownButton>
      </Box>
    </Box>
  );
}

function Features() {
  const photoStyle = {
    aspectRatio: { xs: "4 / 5", md: "342 / 430" },
    ...zoomOnHover,
  };

  return (
    <Box sx={{ px: SIDE, pt: 3, pb: 8 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: GAP,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <Reveal direction="left">
            <Box sx={photoStyle}>
              <Photo img={IMAGES.featureLeft} alt="Living room furniture" />
            </Box>
          </Reveal>

          <Reveal direction="left" delay={150}>
            <TextCard
              bg={GREY_BG}
              title={
                <>
                  Furniture That Will Last
                  <br />A Lifetime
                </>
              }
              text="Tellus dui pharetra ut pellentesque posuere ut amet. Curabitur lectus viverra in sit tortor. Magnis tristique blandit nunc tincidunt et duis adipiscing ac."
              button="Learn more"
            />
          </Reveal>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: GAP }}>
          <Reveal direction="right" delay={100}>
            <TextCard
              bg="var(--c-f8f8f8)"
              title={
                <>
                  Live Comfortably
                  <br />
                  Inside Your Home
                </>
              }
              text="Ullamcorper sit lacus sed risus congue integer amet erat risus. Euismod lacus lectus a dignissim velit. Facilisi lorem vitae purus habitant ac neque scelerisque adipiscing."
              button="Shop now"
            />
          </Reveal>

          <Reveal direction="right" delay={250}>
            <Box sx={photoStyle}>
              <Photo img={IMAGES.featureRight} alt="Comfortable sofa" />
            </Box>
          </Reveal>
        </Box>
      </Box>
    </Box>
  );
}

// ---------- Team ----------
function Team() {
  return (
    <Box sx={{ px: SIDE, pt: 4, pb: 5 }}>
      <Reveal>
        <Typography sx={{ ...heading, textAlign: "center", mb: 3 }}>
          Our Team
        </Typography>
      </Reveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: GAP,
        }}
      >
        {TEAM.map((member, index) => (
          <Reveal key={member.name} delay={stagger(index, 150)}>
            <Box
              sx={{
                textAlign: "center",
                cursor: "pointer",
                "&:hover .fs-person": {
                  transform: "translateY(-10px) scale(1.05)",
                  color: BROWN,
                },
                "&:hover .fs-member": { color: BROWN },
              }}
            >
              <Box
                sx={{
                  bgcolor: GREY_BG,
                  aspectRatio: "223 / 252",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Person
                  className="fs-person"
                  sx={{
                    fontSize: { xs: 240, md: 270 },
                    color: "#ccc",
                    mb: "-14px",
                    transition: `transform .5s ${EASE}, color .3s ease`,
                  }}
                />
              </Box>

              <Typography
                className="fs-member"
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  mt: 1,
                  transition: "color .25s ease",
                }}
              >
                {member.name}
              </Typography>

              <Typography sx={{ fontSize: 11, color: "var(--c-8a8a8a)" }}>
                {member.role}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------- Video preview ----------
function Video() {
  return (
    <Box sx={{ px: SIDE, pt: 4, pb: 8 }}>
      <Reveal direction="zoom">
        <Box
          sx={{
            position: "relative",
            aspectRatio: { xs: "16 / 10", md: "696 / 333" },
            ...zoomOnHover,
          }}
        >
          <Photo img={IMAGES.video} alt="Furniture showroom video preview" />

          <Box
            component="button"
            type="button"
            aria-label="Play video"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              border: 0,
              borderRadius: "50%",
              bgcolor: "#000",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "transform .25s ease, background-color .25s ease",
              "&:hover": {
                bgcolor: "#222",
                transform: "translate(-50%, -50%) scale(1.15)",
              },
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.75)",
                animation: "fs-pulse 2.2s ease-out infinite",
                pointerEvents: "none",
              },
              "&::after": { animationDelay: "1.1s" },
            }}
          >
            <PlayArrow />
          </Box>
        </Box>
      </Reveal>
    </Box>
  );
}

// ---------- Collections ----------
function Collections() {
  return (
    <Box sx={{ bgcolor: GREY_BG, px: SIDE, py: 8 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: GAP,
        }}
      >
        {COLLECTIONS.map((item, index) => (
          <Reveal key={item.title} delay={stagger(index, 180)}>
            <Box
              sx={{
                "&:hover .fs-shop-arrow": { transform: "translateX(5px)" },
                "&:hover .fs-shop-link": { color: BROWN },
              }}
            >
              <Box sx={{ aspectRatio: "342 / 223", mb: 1, ...zoomOnHover }}>
                <Photo img={IMAGES.collections[index]} alt={item.title} />
              </Box>

              <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: 9,
                  lineHeight: "15px",
                  color: "var(--c-666666)",
                  mb: 1,
                }}
              >
                {item.text}
              </Typography>

              <Box
                className="fs-shop-link"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "color .25s ease",
                }}
              >
                Shop Now
                <ArrowForward
                  className="fs-shop-arrow"
                  sx={{ fontSize: 13, transition: "transform .3s ease" }}
                />
              </Box>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------- Instagram ----------
function Instagram() {
  return (
    <Box sx={{ px: SIDE, pt: 7, pb: 8 }}>
      <Reveal>
        <Typography sx={{ ...heading, fontSize: { xs: 24, md: 26 }, mb: 2 }}>
          Follow Us on Instagram
        </Typography>
      </Reveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
          gap: "12px",
        }}
      >
        {IMAGES.instagram.map((img, index) => (
          <Reveal key={img.src} direction="zoom" delay={stagger(index, 100)}>
            <Box
              sx={{
                position: "relative",
                aspectRatio: "1",
                cursor: "pointer",
                ...zoomOnHover,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(148,116,88,.35)",
                  opacity: 0,
                  transition: "opacity .35s ease",
                  pointerEvents: "none",
                },
                "&:hover::after": { opacity: 1 },
              }}
            >
              <Photo img={img} alt={`Instagram post ${index + 1}`} />
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}

// ---------- Main page ----------
function AboutUs() {
  return (
    <Box
      className="fs-about"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        overflowX: "clip",
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />
      <PageHero />
      <Intro />
      <Banner />
      <Stats />
      <Features />
      <Team />
      <Video />
      <Collections />
      <Instagram />
      <Footer />
    </Box>
  );
}

export default AboutUs;
