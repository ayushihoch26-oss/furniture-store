import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  GlobalStyles,
} from "@mui/material";

import {
  PlaceOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@mui/icons-material";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import { sendContactMessage } from "../service/contact.service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bg from "../assets/contactus-bg.jpg";

const BROWN = "#947458";
const SIDE = { xs: 2, sm: 4, md: "max(5%, calc((100% - 1296px) / 2))" };

const HERO_HEIGHT = { xs: 180, sm: 260, md: 360, lg: 486 };
const HERO_OVERLAP = { xs: "-70px", sm: "-90px", md: "-120px", lg: "-200px" };

const ADDRESS = "60 Fremont Ave. Hamden, CT 06514";

const MAP_URL =
  "https://maps.google.com/maps?q=60%20Fremont%20Ave%2C%20Hamden%2C%20CT%2006514&z=15&output=embed";

const CONTACT_INFO = [
  { Icon: PlaceOutlined, label: "Physical address", value: ADDRESS },
  { Icon: PhoneOutlined, label: "Phone number", value: "+437 402-2459" },
  { Icon: MailOutlined, label: "Email address", value: "fStore@email.com" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

const EASE = "cubic-bezier(.2,.7,.2,1)";

const anim = (name, delay = 0, duration = 800) =>
  `${name} ${duration}ms ${EASE} ${delay}ms both`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ANIMATION_STYLES = {
  "@keyframes fs-fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes fs-kenburns": {
    from: { transform: "scale(1)" },
    to: { transform: "scale(1.1)" },
  },
  "@keyframes fs-popIn": {
    from: { opacity: 0, transform: "translateY(10px) scale(.9)" },
    to: { opacity: 1, transform: "none" },
  },
  "@keyframes fs-shake": {
    "0%, 100%": { transform: "translateX(0)" },
    "20%": { transform: "translateX(-6px)" },
    "40%": { transform: "translateX(6px)" },
    "60%": { transform: "translateX(-4px)" },
    "80%": { transform: "translateX(4px)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    ".fs-contact *, .fs-contact *::before, .fs-contact *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important",
      transitionDelay: "0s !important",
    },
  },
};

// Reveal an element once it enters the viewport.
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => prefersReducedMotion());

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
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [seen, threshold]);

  return [ref, seen];
}

// Load the map only when it approaches the viewport.

function useLazyMap() {
  const ref = useRef(null);

  const [shouldLoad, setShouldLoad] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (shouldLoad) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return [ref, shouldLoad];
}

const REVEAL_FROM = {
  up: "translateY(32px)",
  left: "translateX(-48px)",
  right: "translateX(48px)",
  zoom: "scale(.94)",
  none: "none",
};

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

const HERO_BACKGROUND = [
  "radial-gradient(ellipse 28% 55% at 28% 105%, rgba(58,45,33,0.75) 0%, transparent 70%)",
  "radial-gradient(ellipse 22% 60% at 100% 0%, rgba(198,181,157,0.55) 0%, transparent 70%)",
  "radial-gradient(ellipse 25% 50% at 0% 15%, rgba(171,148,121,0.5) 0%, transparent 70%)",
  "radial-gradient(ellipse 30% 45% at 60% 40%, rgba(95,75,55,0.6) 0%, transparent 75%)",
  "linear-gradient(180deg, rgba(140,116,89,0.5) 0%, rgba(112,90,67,0.65) 100%)",
  `url(${bg}) center / cover no-repeat`,
].join(", ");

// Contact information
const ContactInfo = memo(function ContactInfo() {
  return (
    <Box sx={{ pt: { xs: 0, lg: "27px" }, minWidth: 0 }}>
      <Reveal direction="left">
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 34, md: 44, lg: 52 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: 1.2,
            mb: "6px",
          }}
        >
          Contact Us
        </Typography>
      </Reveal>

      <Reveal direction="left" delay={120}>
        <Typography
          sx={{
            fontSize: { xs: 14, lg: 16 },
            lineHeight: { xs: "24px", lg: "28px" },
            color: "var(--c-111111)",
            maxWidth: 560,
          }}
        >
          Suspendisse leo et cursus pharetra tellus tincidunt. Risus nulla
          penatibus donec elementum nulla
        </Typography>
      </Reveal>

      <Box sx={{ mt: { xs: "36px", md: "48px", lg: "68px" } }}>
        {CONTACT_INFO.map(({ Icon, label, value }, index) => (
          <Reveal key={label} direction="left" delay={250 + index * 150}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "34px 1fr", lg: "44px 1fr" },
                alignItems: "center",
                mb: { xs: "22px", lg: "28px" },
                cursor: "default",
                "&:hover .fs-info-icon": {
                  color: BROWN,
                  transform: "translateY(-4px) scale(1.2)",
                },
                "&:hover .fs-info-value": { color: BROWN },
              }}
            >
              <Icon
                className="fs-info-icon"
                sx={{
                  fontSize: { xs: 22, lg: 26 },
                  color: "var(--c-8a8a8a)",
                  transition:
                    "transform .35s cubic-bezier(.3,1.6,.5,1), color .25s ease",
                }}
              />

              <Typography
                sx={{
                  fontSize: { xs: 18, md: 20, lg: 24 },
                  fontWeight: 500,
                  color: "var(--c-8a8a8a)",
                  lineHeight: "32px",
                }}
              >
                {label}
              </Typography>

              <Typography
                className="fs-info-value"
                sx={{
                  gridColumn: 2,
                  mt: "16px",
                  maxWidth: 380,
                  fontSize: { xs: 20, md: 24, lg: 28 },
                  fontWeight: 600,
                  color: "var(--c-111111)",
                  lineHeight: { xs: "28px", lg: "36px" },
                  wordBreak: "break-word",
                  transition: "color .25s ease",
                }}
              >
                {value}
              </Typography>
            </Box>
          </Reveal>
        ))}
      </Box>
    </Box>
  );
});

// Reusable input field
const Field = memo(function Field({
  label,
  error,
  multiline = false,
  ...props
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        animation: error ? "fs-shake .4s ease" : "none",
        "&:focus-within label": { color: BROWN },
      }}
    >
      <Typography
        component="label"
        htmlFor={props.id}
        sx={{
          display: "block",
          fontSize: { xs: 14, lg: 16 },
          fontWeight: 500,
          color: "var(--c-111111)",
          lineHeight: "24px",
          mb: "6px",
          transition: "color .25s ease",
        }}
      >
        {label}
      </Typography>

      <TextField
        {...props}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 4 : undefined}
        error={Boolean(error)}
        helperText={error || undefined}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
            bgcolor: "var(--c-ffffff)",
            fontSize: { xs: 14, lg: 16 },
            color: "var(--c-111111)",
            transition: "box-shadow .25s ease",
            ...(multiline
              ? {
                  p: 0,
                  alignItems: "flex-start",
                  minHeight: { xs: 120, lg: 134 },
                }
              : { height: { xs: 44, lg: 48 } }),
            "& fieldset": {
              borderColor: "var(--c-e2e2e2)",
              transition: "border-color .25s ease",
            },
            "&:hover fieldset": { borderColor: "#BDBDBD" },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(148,116,88,.18)",
            },
            "&.Mui-focused fieldset": { borderColor: BROWN },
            "&.Mui-error fieldset": { borderColor: "#d32f2f" },
          },
          "& input": {
            px: "16px",
            py: 0,
            height: "100%",
            boxSizing: "border-box",
          },
          "& textarea": { px: "16px", py: "14px" },
          "& ::placeholder": { color: "#A8A8A8", opacity: 1 },
          "& .MuiFormHelperText-root": {
            mx: 0,
            mt: "4px",
            fontSize: 12,
          },
        }}
      />
    </Box>
  );
});

// Contact form
const ContactForm = memo(function ContactForm() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSent(false);
    setSubmitError("");
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (loading) return;

      const newErrors = {};

      if (!values.name.trim()) {
        newErrors.name = "Please enter your name";
      }

      if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
        newErrors.email = "Please enter a valid email";
      }

      if (!values.message.trim()) {
        newErrors.message = "Please enter a message";
      }

      setErrors(newErrors);
      setSent(false);
      setSubmitError("");

      if (Object.keys(newErrors).length > 0) return;

      setLoading(true);

      try {
        await sendContactMessage({
          name: values.name,
          email: values.email,
          phone: values.phone,
          message: values.message,
        });

        setSent(true);
        setValues({ ...EMPTY_FORM });
        setErrors({});
      } catch (error) {
        setSubmitError(
          error.response?.data?.message ||
            "Unable to send your message. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, values],
  );

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{
        bgcolor: "var(--c-ffffff)",
        p: {
          xs: "24px 20px 28px",
          md: "30px 32px 36px",
          lg: "36px 40px 40px",
        },
        minWidth: 0,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        transition: "box-shadow .4s ease",
        "&:hover": {
          boxShadow: "0 18px 40px rgba(0,0,0,.08)",
        },
      }}
    >
      <Reveal delay={200}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 22, lg: 28 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: "36px",
            mb: { xs: "20px", lg: "28px" },
          }}
        >
          Get in touch
        </Typography>
      </Reveal>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "24px",
        }}
      >
        <Reveal delay={300}>
          <Field
            id="name"
            name="name"
            label="Name"
            placeholder="Your name..."
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            disabled={loading}
          />
        </Reveal>

        <Reveal delay={400}>
          <Field
            id="phone"
            name="phone"
            label="Phone"
            type="tel"
            placeholder="Your phone number..."
            value={values.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </Reveal>

        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <Reveal delay={500}>
            <Field
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Your email address..."
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
            />
          </Reveal>
        </Box>

        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <Reveal delay={600}>
            <Field
              id="message"
              name="message"
              label="Message"
              multiline
              placeholder="Your message..."
              value={values.message}
              onChange={handleChange}
              error={errors.message}
              disabled={loading}
            />
          </Reveal>
        </Box>
      </Box>

      <Reveal delay={700}>
        <Box
          sx={{
            mt: { xs: "28px", lg: "40px" },
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={loading}
            sx={{
              width: { xs: "100%", sm: 200 },
              height: { xs: 46, lg: 50 },
              bgcolor: BROWN,
              borderRadius: 0,
              textTransform: "none",
              fontSize: { xs: 16, lg: 18 },
              fontWeight: 500,
              transition:
                "transform .25s ease, background-color .25s ease, box-shadow .25s ease",
              "&:hover": {
                bgcolor: "#7d6149",
                transform: "translateY(-3px)",
                boxShadow: "0 10px 20px rgba(125,97,73,.35)",
              },
              "&:active": {
                transform: "translateY(0) scale(.97)",
              },
              "&.Mui-disabled": {
                bgcolor: BROWN,
                color: "#fff",
                opacity: 0.7,
              },
            }}
          >
            {loading ? "Sending..." : "Send message"}
          </Button>

          {sent && (
            <Box
              role="status"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#2e7d32",
                animation: "fs-popIn .5s ease both",
              }}
            >
              <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: 14, color: "inherit" }}>
                Thanks! Your message has been sent.
              </Typography>
            </Box>
          )}

          {submitError && (
            <Typography
              role="alert"
              sx={{
                width: "100%",
                color: "#d32f2f",
                fontSize: 14,
              }}
            >
              {submitError}
            </Typography>
          )}
        </Box>
      </Reveal>
    </Box>
  );
});

// Hero section
const Hero = memo(function Hero() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: HERO_HEIGHT,
        backgroundColor: "#705a43",
        animation: anim("fs-fadeIn", 0, 900),
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background: HERO_BACKGROUND,
          backgroundColor: "#705a43",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          animation: "fs-kenburns 22s ease-in-out infinite alternate",
        }}
      />
    </Box>
  );
});

// Contact information and form layout
const ContactCard = memo(function ContactCard() {
  return (
    <Box sx={{ position: "relative", px: SIDE, mt: HERO_OVERLAP }}>
      <Reveal delay={150}>
        <Box
          sx={{
            bgcolor: "var(--c-f4f2f0)",
            p: { xs: 2.5, sm: 4, md: "40px", lg: "60px" },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "596fr 580fr" },
            columnGap: { md: "24px", lg: 0 },
            rowGap: { xs: 4, md: 0 },
            alignItems: "start",
          }}
        >
          <ContactInfo />
          <ContactForm />
        </Box>
      </Reveal>
    </Box>
  );
});

// Google Maps — the iframe src is added only near the viewport.
const MapSection = memo(function MapSection() {
  const [mapRef, shouldLoadMap] = useLazyMap();

  return (
    <Box
      ref={mapRef}
      sx={{
        px: SIDE,
        py: { xs: "56px", md: "80px", lg: "120px" },
      }}
    >
      <Reveal direction="zoom">
        <Box
          sx={{
            width: "100%",
            height: { xs: 260, md: 360, lg: 460 },
            bgcolor: "var(--c-f4f2f0)",
            overflow: "hidden",
          }}
        >
          {shouldLoadMap && (
            <Box
              component="iframe"
              title="Furniture Store location"
              src={MAP_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                border: 0,
                filter: "grayscale(0.25)",
                transition: "filter .5s ease",
                "&:hover": { filter: "grayscale(0)" },
              }}
            />
          )}
        </Box>
      </Reveal>
    </Box>
  );
});

// Main page
export default function Contact() {
  return (
    <Box
      className="fs-contact"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        overflowX: "clip",
      }}
    >
      <GlobalStyles styles={ANIMATION_STYLES} />

      <Navbar />
      <Hero />
      <ContactCard />
      <MapSection />
      <Footer />
    </Box>
  );
}
