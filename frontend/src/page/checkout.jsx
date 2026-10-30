import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Radio,
  Collapse,
  Badge,
  Divider,
  Stepper,
  Step,
  StepButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";

import {
  KeyboardArrowDown,
  LockOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { Link, useNavigate, useLocation } from "react-router-dom";

import profileService from "../service/profile.service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getOrderNumber } from "../page/invoice";
import { onImgError } from "../assets/furnitureImages";

import {
  placeOrder as createOrder,
  getOrderError,
} from "../service/order.service";

// Lazy-load the invoice dialog.
const InvoiceDialog = lazy(() => import("../page/invoicedemo"));

const BROWN = "#947458";
const GRAY_BG = "var(--c-f4f2f0)";
const LIGHT_BG = "var(--c-f8f8f8)";
const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };

const CART_KEY = "furniture_cart";
const TAX_RATE = 0.08;
const COUPONS = { SAVE10: 0.1 };

const STEPS = ["Contact", "Address", "Shipping", "Payment"];
const LAST_STEP = STEPS.length - 1;

const STEP_FIELDS = [
  ["email", "phone"],
  ["firstName", "lastName", "address", "city", "state", "zip"],
  [],
  ["cardNumber", "cardName", "expiry", "cvc"],
];

const SHIPPING = [
  {
    id: "standard",
    title: "Standard delivery",
    note: "5 - 7 business days",
    price: 0,
  },
  {
    id: "express",
    title: "Express delivery",
    note: "1 - 2 business days",
    price: 25,
  },
];

const PAYMENTS = [
  {
    id: "card",
    title: "Credit / Debit card",
    note: "Visa, Mastercard, Amex",
  },
  {
    id: "cod",
    title: "Cash on delivery",
    note: "Pay when your order arrives",
  },
];

const COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
];

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const loadCart = () => {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    bgcolor: "var(--c-ffffff)",
    fontSize: { xs: 14, lg: 15 },
    "& fieldset": { borderColor: "var(--c-d9d4cf)" },
    "&:hover fieldset": { borderColor: BROWN },
    "&.Mui-focused fieldset": {
      borderColor: BROWN,
      borderWidth: 1,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: 14, lg: 15 },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: BROWN,
  },
};

const stepperSx = {
  "& .MuiStepIcon-root": {
    color: "#d6cfc8",
    fontSize: { xs: 26, lg: 30 },
  },
  "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
    color: BROWN,
  },
  "& .MuiStepLabel-label": {
    fontSize: { xs: 12, lg: 14 },
    color: "var(--c-888888)",
  },
  "& .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
    color: "var(--c-111111)",
    fontWeight: 600,
  },
  "& .MuiStepConnector-line": {
    borderColor: "var(--c-d6cfc8)",
    borderTopWidth: 2,
  },
  "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
    {
      borderColor: BROWN,
    },
};

const Field = memo(function Field({ error, sx, ...props }) {
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
});

const Section = memo(function Section({ number, title, children }) {
  return (
    <Box sx={{ mb: { xs: "28px", lg: "36px" } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: BROWN,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {number}
        </Box>

        <Typography
          sx={{
            fontSize: { xs: 18, md: 20, lg: 22 },
            fontWeight: 600,
            color: "var(--c-111111)",
          }}
        >
          {title}
        </Typography>
      </Box>

      {children}
    </Box>
  );
});

const OptionCard = memo(function OptionCard({
  selected,
  onClick,
  title,
  note,
  right,
}) {
  return (
    <Box
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: { xs: 1.5, lg: 2 },
        py: { xs: "10px", lg: "14px" },
        border: `1px solid ${selected ? BROWN : "var(--c-d9d4cf)"}`,
        bgcolor: selected ? "var(--c-fbf8f5)" : "var(--c-ffffff)",
        cursor: "pointer",
        transition: "border-color .2s, background-color .2s",
        "&:hover": { borderColor: BROWN },
        "&:focus-visible": {
          outline: `2px solid ${BROWN}`,
          outlineOffset: 2,
        },
      }}
    >
      <Radio
        checked={selected}
        tabIndex={-1}
        disableRipple
        sx={{
          p: "4px",
          color: "var(--c-9a9a9a)",
          "&.Mui-checked": { color: BROWN },
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: { xs: 14, lg: 15 },
            fontWeight: 600,
            color: "var(--c-111111)",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 12, lg: 13 },
            color: "var(--c-777777)",
          }}
        >
          {note}
        </Typography>
      </Box>

      {right}
    </Box>
  );
});

const INITIAL = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  shipping: "standard",
  payment: "card",
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvc: "",
  notes: "",
};

function validate(form) {
  const errors = {};

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }

  if (form.phone.replace(/\D/g, "").length < 7) {
    errors.phone = "Enter a valid phone number";
  }

  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!form.address.trim()) errors.address = "Enter your street address";
  if (!form.city.trim()) errors.city = "Required";
  if (!form.state.trim()) errors.state = "Required";
  if (!form.zip.trim()) errors.zip = "Required";

  if (form.payment === "card") {
    const cardNumber = form.cardNumber.replace(/\s/g, "");

    if (!/^\d{13,19}$/.test(cardNumber)) {
      errors.cardNumber = "Enter a valid card number";
    }

    if (!form.cardName.trim()) errors.cardName = "Required";

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
      errors.expiry = "MM/YY";
    }

    if (!/^\d{3,4}$/.test(form.cvc)) {
      errors.cvc = "3 - 4 digits";
    }
  }

  return errors;
}

const Summary = memo(function Summary({
  items,
  totals,
  coupon,
  setCoupon,
  applied,
  applyCoupon,
  couponMsg,
}) {
  return (
    <Box sx={{ bgcolor: LIGHT_BG, p: { xs: 2.5, lg: 4 } }}>
      <Typography
        sx={{ fontSize: { xs: 18, lg: 22 }, fontWeight: 600, mb: 2.5 }}
      >
        Order summary
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item, index) => (
          <Box
            key={item.key ?? item.id ?? `${item.name}-${index}`}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <Badge
              badgeContent={item.qty}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#111",
                  color: "#fff",
                  fontSize: 11,
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 64, lg: 76 },
                  height: { xs: 64, lg: 76 },
                  bgcolor: GRAY_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="img"
                  src={item.img || item.image}
                  alt={item.name}
                  onError={onImgError}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    p: "6px",
                  }}
                />
              </Box>
            </Badge>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 14, lg: 15 },
                  color: "var(--c-111111)",
                }}
              >
                {item.name}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "var(--c-777777)" }}>
                {item.color}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: { xs: 14, lg: 15 }, fontWeight: 600 }}>
              {money(Number(item.price || 0) * Number(item.qty || 0))}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", gap: 1 }}>
        <Field
          label="Discount code"
          value={coupon}
          onChange={(event) => setCoupon(event.target.value)}
          disabled={Boolean(applied)}
        />

        <Button
          type="button"
          onClick={applyCoupon}
          sx={{
            flexShrink: 0,
            minWidth: 88,
            height: 40,
            borderRadius: 0,
            bgcolor: "#2b2b2b",
            color: "#fff",
            textTransform: "none",
            "&:hover": { bgcolor: "#111" },
          }}
        >
          {applied ? "Remove" : "Apply"}
        </Button>
      </Box>

      {couponMsg && (
        <Typography
          sx={{
            fontSize: 12.5,
            mt: 0.75,
            color: applied ? "#2e7d32" : "#c62828",
          }}
        >
          {couponMsg}
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      {[
        ["Subtotal", money(totals.subtotal)],
        applied && [`Discount (${applied})`, `-${money(totals.discount)}`],
        ["Shipping", totals.shipping === 0 ? "Free" : money(totals.shipping)],
        [`Estimated tax (${TAX_RATE * 100}%)`, money(totals.tax)],
      ]
        .filter(Boolean)
        .map(([label, value]) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1.25,
            }}
          >
            <Typography
              sx={{ fontSize: { xs: 14, lg: 15 }, color: "var(--c-555555)" }}
            >
              {label}
            </Typography>

            <Typography
              sx={{ fontSize: { xs: 14, lg: 15 }, color: "var(--c-111111)" }}
            >
              {value}
            </Typography>
          </Box>
        ))}

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Typography sx={{ fontSize: { xs: 16, lg: 18 }, fontWeight: 600 }}>
          Total
        </Typography>

        <Typography sx={{ fontSize: { xs: 20, lg: 24 }, fontWeight: 700 }}>
          <Box
            component="span"
            sx={{
              fontSize: 12,
              color: "var(--c-777777)",
              fontWeight: 400,
              mr: 1,
            }}
          >
            USD
          </Box>
          {money(totals.total)}
        </Typography>
      </Box>
    </Box>
  );
});

function Checkout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const stepperRef = useRef(null);

  const [items, setItems] = useState(loadCart);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [order, setOrder] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const sync = () => setItems(loadCart());

    window.addEventListener("storage", sync);
    window.addEventListener("cart:changed", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart:changed", sync);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [order]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true, state: { from: location } });
      return undefined;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const user = await profileService.getMyProfile();

        if (!active || !user) return;

        setForm((previous) => ({
          ...previous,
          email: previous.email || user.email || "",
          phone: previous.phone || user.phone || "",
          firstName: previous.firstName || user.firstName || "",
          lastName: previous.lastName || user.lastName || "",
          address: previous.address || user.street || "",
          apartment: previous.apartment || user.apartment || "",
          city: previous.city || user.city || "",
          state: previous.state || user.state || "",
          zip: previous.zip || user.zip || "",
          country: user.country || previous.country,
        }));
      } catch {
        // Users can enter their details if the profile request fails.
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate, location]);

  const set = useCallback(
    (name) => (event) => {
      const value = event.target.value;

      setForm((previous) => ({ ...previous, [name]: value }));

      setErrors((previous) =>
        previous[name] ? { ...previous, [name]: undefined } : previous,
      );

      setSubmitError("");
    },
    [],
  );

  const formatCard = useCallback(
    (value) =>
      value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim(),
    [],
  );

  const formatExpiry = useCallback((value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    return digits.length > 2
      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
      : digits;
  }, []);

  const formatCvc = useCallback(
    (value) => value.replace(/\D/g, "").slice(0, 4),
    [],
  );

  const setFormatted = useCallback(
    (name, formatter) => (event) => {
      const value = formatter(event.target.value);

      setForm((previous) => ({ ...previous, [name]: value }));

      setErrors((previous) =>
        previous[name] ? { ...previous, [name]: undefined } : previous,
      );

      setSubmitError("");
    },
    [],
  );

  const applyCoupon = useCallback(() => {
    if (applied) {
      setApplied("");
      setCoupon("");
      setCouponMsg("");
      return;
    }

    const code = coupon.trim().toUpperCase();

    if (Object.hasOwn(COUPONS, code)) {
      setApplied(code);
      setCouponMsg(`Code ${code} applied`);
    } else {
      setCouponMsg("Invalid discount code");
    }
  }, [applied, coupon]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0,
      ),
    [items],
  );

  const discount = useMemo(
    () => (applied ? subtotal * (COUPONS[applied] || 0) : 0),
    [applied, subtotal],
  );

  const shipping = useMemo(
    () => SHIPPING.find((option) => option.id === form.shipping)?.price ?? 0,
    [form.shipping],
  );

  const taxableSubtotal = Math.max(0, subtotal - discount);

  const tax = useMemo(() => taxableSubtotal * TAX_RATE, [taxableSubtotal]);

  const totals = useMemo(
    () => ({
      subtotal,
      discount,
      shipping,
      tax,
      total: taxableSubtotal + shipping + tax,
    }),
    [subtotal, discount, shipping, tax, taxableSubtotal],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    [items],
  );

  const scrollToStepper = useCallback(() => {
    requestAnimationFrame(() => {
      stepperRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const focusFirstError = useCallback(() => {
    requestAnimationFrame(() => {
      const element = document.querySelector('[aria-invalid="true"]');

      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus({ preventScroll: true });
    });
  }, []);

  const goBack = useCallback(() => {
    setActiveStep((previous) => Math.max(0, previous - 1));
    scrollToStepper();
  }, [scrollToStepper]);

  const goNext = useCallback(() => {
    const allErrors = validate(form);
    const stepErrors = {};

    STEP_FIELDS[activeStep].forEach((key) => {
      if (allErrors[key]) stepErrors[key] = allErrors[key];
    });

    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      focusFirstError();
      return;
    }

    setActiveStep((previous) => Math.min(LAST_STEP, previous + 1));
    scrollToStepper();
  }, [activeStep, form, focusFirstError, scrollToStepper]);

  const handlePlaceOrder = useCallback(async () => {
    if (submitting) return;

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    const foundErrors = validate(form);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      const badStep = STEP_FIELDS.findIndex((fields) =>
        fields.some((key) => foundErrors[key]),
      );

      setActiveStep(badStep === -1 ? LAST_STEP : badStep);
      focusFirstError();
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const orderData = {
        email: form.email.trim(),
        phone: form.phone.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        street: form.address.trim(),
        apartment: form.apartment.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        country: form.country,
        shippingMethod: form.shipping,
        paymentMethod: form.payment,

        // Send only the last four digits; never send/store the full card number.
        cardLast4:
          form.payment === "card"
            ? form.cardNumber.replace(/\D/g, "").slice(-4)
            : null,

        notes: form.notes.trim(),
        subtotal: Number(taxableSubtotal.toFixed(2)),
        shippingCost: Number(shipping.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(totals.total.toFixed(2)),

        items: items.map((item) => ({
          productId: item.productId ?? item.product?.id ?? item.id ?? null,
          name: item.name,
          color: item.color || null,
          image: item.img || item.image || null,
          price: Number(item.price || 0),
          quantity: Number(item.qty || 1),
        })),

        couponCode: applied || null,
        discount: Number(discount.toFixed(2)),
      };

      const result = await createOrder(orderData);
      const savedOrder = result?.order || result?.data || result;

      const returnedId =
        savedOrder?.orderId || savedOrder?.id || result?.orderId || result?.id;

      if (!returnedId) {
        throw new Error(
          "The server did not return an order ID. Check the order API response.",
        );
      }

      // Clear the cart only after the server confirms order creation.
      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("cart:changed"));
      setItems([]);

      setOrder({
        ...orderData,
        ...savedOrder,
        id: returnedId,
        email: savedOrder?.email || orderData.email,
        total: Number(savedOrder?.total ?? totals.total),
        items: savedOrder?.items?.length ? savedOrder.items : orderData.items,
        createdAt: savedOrder?.createdAt || new Date().toISOString(),
      });

      setInvoiceOpen(true);
    } catch (error) {
      setSubmitError(getOrderError(error));
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    items,
    form,
    focusFirstError,
    taxableSubtotal,
    shipping,
    tax,
    totals.total,
    applied,
    discount,
  ]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (activeStep < LAST_STEP) {
        goNext();
      } else {
        handlePlaceOrder();
      }
    },
    [activeStep, goNext, handlePlaceOrder],
  );

  const Hero = (
    <Box sx={{ bgcolor: LIGHT_BG, px: SIDE, py: { xs: 4, md: 5, lg: 7 } }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: 28, md: 34, lg: 40 },
          fontWeight: 600,
          color: "var(--c-111111)",
          lineHeight: 1.2,
        }}
      >
        Checkout
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 1,
          fontSize: { xs: 12, lg: 14 },
          color: "var(--c-777777)",
        }}
      >
        <Box
          component={Link}
          to="/Dashboard"
          sx={{
            color: "inherit",
            textDecoration: "none",
            "&:hover": { color: BROWN },
          }}
        >
          Home
        </Box>
        /
        <Box
          component={Link}
          to="/Shop"
          sx={{
            color: "inherit",
            textDecoration: "none",
            "&:hover": { color: BROWN },
          }}
        >
          Shop
        </Box>
        /<Box sx={{ color: "var(--c-111111)" }}>Checkout</Box>
      </Box>
    </Box>
  );

  if (order) {
    return (
      <Box
        sx={{ width: "100%", minHeight: "100vh", bgcolor: "var(--c-ffffff)" }}
      >
        <Navbar />
        {Hero}

        <Box sx={{ px: SIDE, py: { xs: 8, lg: 14 }, textAlign: "center" }}>
          <CheckCircleOutlinedIcon
            sx={{ fontSize: { xs: 64, lg: 80 }, color: BROWN }}
          />

          <Typography
            sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 600, mt: 2 }}
          >
            Thank you for your order!
          </Typography>

          <Typography
            sx={{
              color: "var(--c-555555)",
              mt: 1.5,
              fontSize: { xs: 14, lg: 16 },
            }}
          >
            Order <b>{getOrderNumber(order)}</b> for {money(order.total)} has
            been placed.
            <br />
            You can view it anytime in My Orders.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1.5,
              mt: 4,
            }}
          >
            <Button
              component={Link}
              to="/Shop"
              sx={{
                height: 48,
                px: 5,
                borderRadius: 0,
                bgcolor: BROWN,
                color: "#fff",
                textTransform: "none",
                fontSize: 15,
                "&:hover": { bgcolor: "#7d6048" },
              }}
            >
              Continue shopping
            </Button>

            <Button
              onClick={() => setInvoiceOpen(true)}
              sx={{
                height: 48,
                px: 4,
                borderRadius: 0,
                border: `1px solid ${BROWN}`,
                color: BROWN,
                textTransform: "none",
                fontSize: 15,
              }}
            >
              Download invoice
            </Button>
          </Box>
        </Box>

        {invoiceOpen && (
          <Suspense
            fallback={
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={28} sx={{ color: BROWN }} />
              </Box>
            }
          >
            <InvoiceDialog
              open={invoiceOpen}
              order={order}
              onClose={() => setInvoiceOpen(false)}
            />
          </Suspense>
        )}

        <Footer />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{ width: "100%", minHeight: "100vh", bgcolor: "var(--c-ffffff)" }}
      >
        <Navbar />
        {Hero}

        <Box
          sx={{
            px: SIDE,
            py: { xs: 8, lg: 14 },
            textAlign: "center",
            color: "var(--c-777777)",
          }}
        >
          <ShoppingBagOutlined sx={{ fontSize: 64 }} />

          <Typography
            sx={{
              fontSize: { xs: 20, md: 24 },
              fontWeight: 600,
              color: "var(--c-111111)",
              mt: 1,
            }}
          >
            Your cart is empty
          </Typography>

          <Typography sx={{ mt: 1 }}>
            Add some products to continue to checkout.
          </Typography>

          <Button
            component={Link}
            to="/Shop"
            sx={{
              mt: 4,
              height: 48,
              px: 5,
              borderRadius: 0,
              bgcolor: BROWN,
              color: "#fff",
              textTransform: "none",
              fontSize: 15,
              "&:hover": { bgcolor: "#7d6048" },
            }}
          >
            Go to shop
          </Button>
        </Box>

        <Footer />
      </Box>
    );
  }

  const isLast = activeStep === LAST_STEP;

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "var(--c-ffffff)" }}>
      <Navbar />
      {Hero}

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          px: SIDE,
          py: { xs: 3, md: "48px", lg: "72px" },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) 360px",
            lg: "minmax(0, 1fr) 440px",
          },
          columnGap: { md: "32px", lg: "64px" },
          rowGap: 3,
          alignItems: "start",
        }}
      >
        <Box
          ref={stepperRef}
          sx={{
            order: 0,
            gridColumn: "1 / -1",
            width: "100%",
            maxWidth: 900,
            mx: "auto",
            mb: { xs: 1, md: 2 },
            scrollMarginTop: "16px",
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={stepperSx}>
            {STEPS.map((label, index) => (
              <Step key={label} completed={index < activeStep}>
                <StepButton
                  type="button"
                  disableRipple
                  disabled={index > activeStep || submitting}
                  onClick={() => {
                    setActiveStep(index);
                    scrollToStepper();
                  }}
                >
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ order: { xs: 2, md: 1 }, minWidth: 0 }}>
          {activeStep === 0 && (
            <Section number={1} title="Contact information">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Field
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  error={errors.email}
                  autoComplete="email"
                />

                <Field
                  label="Phone number"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  error={errors.phone}
                  autoComplete="tel"
                />
              </Box>
            </Section>
          )}

          {activeStep === 1 && (
            <Section number={2} title="Shipping address">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Field
                  label="First name"
                  value={form.firstName}
                  onChange={set("firstName")}
                  error={errors.firstName}
                  autoComplete="given-name"
                />

                <Field
                  label="Last name"
                  value={form.lastName}
                  onChange={set("lastName")}
                  error={errors.lastName}
                  autoComplete="family-name"
                />

                <Field
                  sx={{ gridColumn: { sm: "1 / -1" } }}
                  label="Street address"
                  value={form.address}
                  onChange={set("address")}
                  error={errors.address}
                  autoComplete="street-address"
                />

                <Field
                  sx={{ gridColumn: { sm: "1 / -1" } }}
                  label="Apartment, suite, etc. (optional)"
                  value={form.apartment}
                  onChange={set("apartment")}
                />

                <Field
                  label="City"
                  value={form.city}
                  onChange={set("city")}
                  error={errors.city}
                  autoComplete="address-level2"
                />

                <Field
                  label="State / Province"
                  value={form.state}
                  onChange={set("state")}
                  error={errors.state}
                  autoComplete="address-level1"
                />

                <Field
                  label="ZIP / Postal code"
                  value={form.zip}
                  onChange={set("zip")}
                  error={errors.zip}
                  autoComplete="postal-code"
                />

                <Field
                  select
                  label="Country"
                  value={form.country}
                  onChange={set("country")}
                  SelectProps={{
                    IconComponent: KeyboardArrowDown,
                    MenuProps: { disableScrollLock: true },
                  }}
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Field>
              </Box>
            </Section>
          )}

          {activeStep === 2 && (
            <Section number={3} title="Shipping method">
              <Box
                role="radiogroup"
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                {SHIPPING.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={form.shipping === option.id}
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        shipping: option.id,
                      }))
                    }
                    title={option.title}
                    note={option.note}
                    right={
                      <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                        {option.price === 0 ? "Free" : money(option.price)}
                      </Typography>
                    }
                  />
                ))}
              </Box>
            </Section>
          )}

          {activeStep === 3 && (
            <>
              <Section number={4} title="Payment method">
                <Box
                  role="radiogroup"
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {PAYMENTS.map((payment) => (
                    <OptionCard
                      key={payment.id}
                      selected={form.payment === payment.id}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          payment: payment.id,
                        }))
                      }
                      title={payment.title}
                      note={payment.note}
                    />
                  ))}
                </Box>

                <Collapse in={form.payment === "card"} unmountOnExit>
                  <Box
                    sx={{
                      mt: 2,
                      p: { xs: 2, lg: 3 },
                      bgcolor: LIGHT_BG,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <Field
                      sx={{ gridColumn: "1 / -1" }}
                      label="Card number"
                      value={form.cardNumber}
                      onChange={setFormatted("cardNumber", formatCard)}
                      error={errors.cardNumber}
                      inputProps={{ inputMode: "numeric" }}
                      autoComplete="cc-number"
                    />

                    <Field
                      sx={{ gridColumn: "1 / -1" }}
                      label="Name on card"
                      value={form.cardName}
                      onChange={set("cardName")}
                      error={errors.cardName}
                      autoComplete="cc-name"
                    />

                    <Field
                      label="Expiry (MM/YY)"
                      value={form.expiry}
                      onChange={setFormatted("expiry", formatExpiry)}
                      error={errors.expiry}
                      inputProps={{ inputMode: "numeric" }}
                      autoComplete="cc-exp"
                    />

                    <Field
                      label="CVC"
                      value={form.cvc}
                      onChange={setFormatted("cvc", formatCvc)}
                      error={errors.cvc}
                      inputProps={{ inputMode: "numeric" }}
                      autoComplete="cc-csc"
                    />
                  </Box>
                </Collapse>
              </Section>

              <Section number={5} title="Order notes (optional)">
                <Field
                  multiline
                  minRows={3}
                  label="Notes about your order, e.g. delivery instructions"
                  value={form.notes}
                  onChange={set("notes")}
                />
              </Section>
            </>
          )}

          {submitError && (
            <Typography
              role="alert"
              sx={{ color: "#c62828", mb: 2, fontSize: 14 }}
            >
              {submitError}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mt: { xs: 1, lg: 2 },
            }}
          >
            {activeStep === 0 ? (
              <Button
                component={Link}
                to="/Shop"
                sx={{
                  color: "var(--c-555555)",
                  textTransform: "none",
                  fontSize: 15,
                  "&:hover": { color: BROWN, bgcolor: "transparent" },
                }}
              >
                ← Back to shop
              </Button>
            ) : (
              <Button
                type="button"
                variant="outlined"
                disabled={submitting}
                onClick={goBack}
                sx={{
                  height: { xs: 50, lg: 56 },
                  px: { xs: 3, lg: 5 },
                  borderRadius: 0,
                  borderColor: BROWN,
                  color: "var(--c-555555)",
                  textTransform: "none",
                  fontSize: { xs: 15, lg: 16 },
                  "&:hover": {
                    borderColor: BROWN,
                    bgcolor: "transparent",
                  },
                }}
              >
                ← Back
              </Button>
            )}

            <Button
              type="submit"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : isLast ? (
                  <LockOutlined sx={{ fontSize: 18 }} />
                ) : undefined
              }
              sx={{
                height: { xs: 50, lg: 56 },
                px: { xs: 3, lg: 6 },
                borderRadius: 0,
                bgcolor: BROWN,
                color: "#fff",
                textTransform: "none",
                fontSize: { xs: 15, lg: 16 },
                fontWeight: 600,
                "&:hover": { bgcolor: "#7d6048" },
                "&.Mui-disabled": {
                  bgcolor: "#B9A18D",
                  color: "#fff",
                },
              }}
            >
              {submitting
                ? "Placing order..."
                : isLast
                  ? `Place order • ${money(totals.total)}`
                  : "Continue →"}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            order: { xs: 1, md: 2 },
            position: { md: "sticky" },
            top: { md: 24 },
            minWidth: 0,
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => setShowSummary((previous) => !previous)}
            aria-expanded={showSummary}
            sx={{
              display: { xs: "flex", md: "none" },
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: "14px",
              border: 0,
              bgcolor: LIGHT_BG,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: BROWN,
                fontSize: 14,
              }}
            >
              <ShoppingBagOutlined sx={{ fontSize: 20 }} />
              {showSummary ? "Hide" : "Show"} order summary ({itemCount})
              <KeyboardArrowDown
                sx={{
                  fontSize: 20,
                  transform: showSummary ? "rotate(180deg)" : "none",
                  transition: "transform .2s",
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--c-111111)",
              }}
            >
              {money(totals.total)}
            </Typography>
          </Box>

          <Collapse in={isDesktop || showSummary}>
            <Summary
              items={items}
              totals={totals}
              coupon={coupon}
              setCoupon={setCoupon}
              applied={applied}
              applyCoupon={applyCoupon}
              couponMsg={couponMsg}
            />
          </Collapse>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default Checkout;
