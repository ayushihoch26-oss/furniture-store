import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  CircularProgress,
  Step,
  StepButton,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { KeyboardArrowDown, LockOutlined, ShoppingBagOutlined } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { placeOrder, getOrderError } from "../service/order.service";
import {
  BROWN,
  LAST_STEP,
  LIGHT_BG,
  SIDE,
  STEPS,
  STEP_FIELDS,
} from "../features/checkout/checkoutConstants";
import { STEPPER_STYLES } from "../styles/checkoutStyles";
import {
  calculateTotals,
  formatCardExpiry,
  formatCardNumber,
  formatCvc,
  formatMoney,
  validateCheckout,
} from "../utils/checkoutUtils";
import { useCheckoutCart } from "../hooks/checkout/useCheckoutCart";
import { useCheckoutForm } from "../hooks/checkout/useCheckoutForm";
import {
  AddressFields,
  ContactFields,
  PaymentFields,
  ShippingFields,
} from "../components/checkout/CheckoutFields";
import { CheckoutSummary } from "../components/checkout/CheckoutSummary";
import {
  CheckoutHero,
  EmptyCart,
  OrderSuccess,
} from "../components/checkout/CheckoutStates";

function Checkout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const stepperRef = useRef(null);

  const { cartItems, clearCart } = useCheckoutCart();
  const {
    form,
    setForm,
    errors,
    setErrors,
    coupon,
    setCoupon,
    appliedCoupon,
    couponMessage,
    updateField,
    updateFormattedField,
    applyCoupon,
  } = useCheckoutForm(navigate, location);
  const [activeStep, setActiveStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [order, setOrder] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [order]);

  const totals = useMemo(
    () => calculateTotals(cartItems, appliedCoupon, form.shipping),
    [cartItems, appliedCoupon, form.shipping],
  );

  function changeField(fieldName) {
    return (event) => {
      updateField(fieldName)(event);
      setSubmitError("");
    };
  }

  function changeFormattedField(fieldName, formatValue) {
    return (event) => {
      updateFormattedField(fieldName, formatValue)(event);
      setSubmitError("");
    };
  }

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (count, item) => count + Number(item.qty || 0),
        0,
      ),
    [cartItems],
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
      const field = document.querySelector('[aria-invalid="true"]');
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus({ preventScroll: true });
    });
  }, []);

  const goBack = useCallback(() => {
    setActiveStep((oldStep) => Math.max(0, oldStep - 1));
    scrollToStepper();
  }, [scrollToStepper]);

  const goNext = useCallback(() => {
    const foundErrors = validateCheckout(form);
    const stepErrors = {};

    STEP_FIELDS[activeStep].forEach((fieldName) => {
      if (foundErrors[fieldName]) {
        stepErrors[fieldName] = foundErrors[fieldName];
      }
    });

    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      focusFirstError();
      return;
    }

    setActiveStep((oldStep) => Math.min(LAST_STEP, oldStep + 1));
    scrollToStepper();
  }, [activeStep, form, setErrors, focusFirstError, scrollToStepper]);

  async function submitOrder() {
    if (submitting) return;

    if (cartItems.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    const foundErrors = validateCheckout(form);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      const badStep = STEP_FIELDS.findIndex((fieldNames) =>
        fieldNames.some((fieldName) => foundErrors[fieldName]),
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
        cardLast4:
          form.payment === "card"
            ? form.cardNumber.replace(/\D/g, "").slice(-4)
            : null,
        notes: form.notes.trim(),
        subtotal: Number(totals.subtotal.toFixed(2)),
        shippingCost: Number(totals.shipping.toFixed(2)),
        tax: Number(totals.tax.toFixed(2)),
        total: Number(totals.total.toFixed(2)),
        items: cartItems.map((item) => ({
          productId:
            item.productId ?? item.product?.id ?? item.id ?? null,
          name: item.name,
          color: item.color || null,
          image: item.img || item.image || null,
          price: Number(item.price || 0),
          quantity: Number(item.qty || 1),
        })),
        couponCode: appliedCoupon || null,
        discount: Number(totals.discount.toFixed(2)),
      };

      const response = await placeOrder(orderData);
      const savedOrder = response?.order || response?.data || response;
      const orderId =
        savedOrder?.orderId ||
        savedOrder?.id ||
        response?.orderId ||
        response?.id;

      if (!orderId) {
        throw new Error("The server did not return an order ID.");
      }

      clearCart();

      setOrder({
        ...orderData,
        ...savedOrder,
        id: orderId,
        email: savedOrder?.email || orderData.email,
        total: Number(savedOrder?.total ?? totals.total),
        items:
          savedOrder?.items?.length
            ? savedOrder.items
            : orderData.items,
        createdAt: savedOrder?.createdAt || new Date().toISOString(),
      });
      setInvoiceOpen(true);
    } catch (error) {
      setSubmitError(getOrderError(error));
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (activeStep < LAST_STEP) {
      goNext();
    } else {
      submitOrder();
    }
  }

  if (order) {
    return (
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            bgcolor: "var(--c-ffffff)",
            color: "var(--c-111111)",
          }}
        >
        <Navbar />
        <CheckoutHero />
        <OrderSuccess
          order={order}
          isInvoiceOpen={invoiceOpen}
          openInvoice={() => setInvoiceOpen(true)}
          closeInvoice={() => setInvoiceOpen(false)}
        />
        <Footer />
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            bgcolor: "var(--c-ffffff)",
            color: "var(--c-111111)",
          }}
        >
        <Navbar />
        <CheckoutHero />
        <EmptyCart />
        <Footer />
      </Box>
    );
  }

  const isLastStep = activeStep === LAST_STEP;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "var(--c-ffffff)",
        color: "var(--c-111111)",
      }}
    >
      <Navbar />
      <CheckoutHero />

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
            gridColumn: "1 / -1",
            width: "100%",
            maxWidth: 900,
            mx: "auto",
            mb: { xs: 1, md: 2 },
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={STEPPER_STYLES}>
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
            <ContactFields
              form={form}
              errors={errors}
              onChange={changeField}
            />
          )}
          {activeStep === 1 && (
            <AddressFields
              form={form}
              errors={errors}
              onChange={changeField}
            />
          )}
          {activeStep === 2 && (
            <ShippingFields form={form} setForm={setForm} />
          )}
          {activeStep === 3 && (
            <PaymentFields
              form={form}
              errors={errors}
              onChange={changeField}
              onFormattedChange={changeFormattedField}
              formatCard={formatCardNumber}
              formatExpiry={formatCardExpiry}
              formatCvc={formatCvc}
              setForm={setForm}
            />
          )}

          {submitError && (
            <Typography role="alert" sx={{ color: "#c62828", mb: 2, fontSize: 14 }}>
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
                sx={{ color: "var(--c-555555)", textTransform: "none" }}
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
                ) : isLastStep ? (
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
                fontWeight: 600,
                "&:hover": { bgcolor: "#7d6048" },
                "&.Mui-disabled": { bgcolor: "#B9A18D", color: "#fff" },
              }}
            >
              {submitting
                ? "Placing order..."
                : isLastStep
                  ? `Place order • ${formatMoney(totals.total)}`
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
            onClick={() => setShowSummary((oldValue) => !oldValue)}
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
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: BROWN }}>
              <ShoppingBagOutlined sx={{ fontSize: 20 }} />
              {showSummary ? "Hide" : "Show"} order summary ({itemCount})
              <KeyboardArrowDown
                sx={{
                  transform: showSummary ? "rotate(180deg)" : "none",
                }}
              />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
              {formatMoney(totals.total)}
            </Typography>
          </Box>

          <Collapse in={isDesktop || showSummary}>
            <CheckoutSummary
              items={cartItems}
              totals={totals}
              coupon={coupon}
              setCoupon={setCoupon}
              appliedCoupon={appliedCoupon}
              applyCoupon={applyCoupon}
              couponMessage={couponMessage}
            />
          </Collapse>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default Checkout;
