import { memo } from "react";
import {
  Box,
  Collapse,
  MenuItem,
  Radio,
  TextField,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import {
  BROWN,
  COUNTRIES,
  LIGHT_BG,
  PAYMENT_OPTIONS,
  SHIPPING_OPTIONS,
} from "../checkoutConstants";
import { FIELD_STYLES } from "../checkoutStyles";
import { formatMoney } from "../../../utils/formatters";

export const Field = memo(function Field({ error, sx, ...props }) {
  return (
    <TextField
      size="small"
      fullWidth
      error={Boolean(error)}
      helperText={error}
      sx={{ ...FIELD_STYLES, ...sx }}
      {...props}
    />
  );
});

export function CheckoutSection({ number, title, children }) {
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
}

export function OptionCard({ selected, onClick, title, note, right }) {
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
        <Typography sx={{ fontSize: { xs: 12, lg: 13 }, color: "var(--c-777777)" }}>
          {note}
        </Typography>
      </Box>
      {right}
    </Box>
  );
}

export function ContactFields({ form, errors, onChange }) {
  return (
    <CheckoutSection number={1} title="Contact information">
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
          onChange={onChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={onChange("phone")}
          error={errors.phone}
          autoComplete="tel"
        />
      </Box>
    </CheckoutSection>
  );
}

export function AddressFields({ form, errors, onChange }) {
  return (
    <CheckoutSection number={2} title="Shipping address">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Field label="First name" value={form.firstName} onChange={onChange("firstName")} error={errors.firstName} autoComplete="given-name" />
        <Field label="Last name" value={form.lastName} onChange={onChange("lastName")} error={errors.lastName} autoComplete="family-name" />
        <Field sx={{ gridColumn: { sm: "1 / -1" } }} label="Street address" value={form.address} onChange={onChange("address")} error={errors.address} autoComplete="street-address" />
        <Field sx={{ gridColumn: { sm: "1 / -1" } }} label="Apartment, suite, etc. (optional)" value={form.apartment} onChange={onChange("apartment")} />
        <Field label="City" value={form.city} onChange={onChange("city")} error={errors.city} autoComplete="address-level2" />
        <Field label="State / Province" value={form.state} onChange={onChange("state")} error={errors.state} autoComplete="address-level1" />
        <Field label="ZIP / Postal code" value={form.zip} onChange={onChange("zip")} error={errors.zip} autoComplete="postal-code" />
        <Field
          select
          label="Country"
          value={form.country}
          onChange={onChange("country")}
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
    </CheckoutSection>
  );
}

export function ShippingFields({ form, setForm }) {
  return (
    <CheckoutSection number={3} title="Shipping method">
      <Box role="radiogroup" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {SHIPPING_OPTIONS.map((option) => (
          <OptionCard
            key={option.id}
            selected={form.shipping === option.id}
            onClick={() =>
              setForm((oldForm) => ({ ...oldForm, shipping: option.id }))
            }
            title={option.title}
            note={option.note}
            right={
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--c-111111)",
                }}
              >
                {option.price === 0 ? "Free" : formatMoney(option.price)}
              </Typography>
            }
          />
        ))}
      </Box>
    </CheckoutSection>
  );
}

export function PaymentFields({
  form,
  errors,
  onChange,
  onFormattedChange,
  formatCard,
  formatExpiry,
  formatCvc,
  setForm,
}) {
  return (
    <>
      <CheckoutSection number={4} title="Payment method">
        <Box role="radiogroup" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {PAYMENT_OPTIONS.map((payment) => (
            <OptionCard
              key={payment.id}
              selected={form.payment === payment.id}
              onClick={() =>
                setForm((oldForm) => ({ ...oldForm, payment: payment.id }))
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
            <Field sx={{ gridColumn: "1 / -1" }} label="Card number" value={form.cardNumber} onChange={onFormattedChange("cardNumber", formatCard)} error={errors.cardNumber} inputProps={{ inputMode: "numeric" }} autoComplete="cc-number" />
            <Field sx={{ gridColumn: "1 / -1" }} label="Name on card" value={form.cardName} onChange={onChange("cardName")} error={errors.cardName} autoComplete="cc-name" />
            <Field label="Expiry (MM/YY)" value={form.expiry} onChange={onFormattedChange("expiry", formatExpiry)} error={errors.expiry} inputProps={{ inputMode: "numeric" }} autoComplete="cc-exp" />
            <Field label="CVC" value={form.cvc} onChange={onFormattedChange("cvc", formatCvc)} error={errors.cvc} inputProps={{ inputMode: "numeric" }} autoComplete="cc-csc" />
          </Box>
        </Collapse>
      </CheckoutSection>

      <CheckoutSection number={5} title="Order notes (optional)">
        <Field
          multiline
          minRows={3}
          label="Notes about your order, e.g. delivery instructions"
          value={form.notes}
          onChange={onChange("notes")}
        />
      </CheckoutSection>
    </>
  );
}
