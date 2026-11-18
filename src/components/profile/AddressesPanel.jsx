import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LocationOnOutlined,
  Close,
  KeyboardArrowDown,
  EditOutlined,
  Add,
} from "@mui/icons-material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import { COUNTRIES } from "../../utils/profileUtils";
import { BROWN, brownBtn, outlineBtn } from "../../styles/profileStyles";
import { Field, PanelTitle, EmptyState } from "./ProfileShared";

const EMPTY_ADDRESS = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
};

function AddressDialog({ open, initial, onClose, onSave }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] = useState(() => initial || EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});

  function handleChange(fieldName, event) {
    const newValue = event.target.value;

    setForm({
      ...form,
      [fieldName]: newValue,
    });

    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: undefined,
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formErrors = {};
    const requiredFields = ["fullName", "line1", "city", "state", "zip"];

    requiredFields.forEach((fieldName) => {
      const fieldValue = String(form[fieldName] || "").trim();

      if (!fieldValue) {
        formErrors[fieldName] = "Required";
      }
    });

    const phoneNumber = String(form.phone || "").replace(/\D/g, "");

    if (phoneNumber.length < 7) {
      formErrors.phone = "Enter a valid phone number";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      onSave(form);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        {initial ? "Edit address" : "Add new address"}
        <IconButton onClick={onClose} aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>

      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              pt: 1,
            }}
          >
            <Field
              select
              label="Label"
              value={form.label}
              onChange={(event) => handleChange("label", event)}
              slotProps={{
                select: {
                  IconComponent: KeyboardArrowDown,
                  MenuProps: { disableScrollLock: true },
                },
              }}
            >
              <MenuItem value="Home">Home</MenuItem>
              <MenuItem value="Office">Office</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Field>

            <Field
              label="Full name"
              value={form.fullName}
              onChange={(event) => handleChange("fullName", event)}
              error={errors.fullName}
            />

            <Field
              sx={{ gridColumn: { sm: "1 / -1" } }}
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange("phone", event)}
              error={errors.phone}
            />

            <Field
              sx={{ gridColumn: { sm: "1 / -1" } }}
              label="Street address"
              value={form.line1}
              onChange={(event) => handleChange("line1", event)}
              error={errors.line1}
            />

            <Field
              label="City"
              value={form.city}
              onChange={(event) => handleChange("city", event)}
              error={errors.city}
            />

            <Field
              label="State / Province"
              value={form.state}
              onChange={(event) => handleChange("state", event)}
              error={errors.state}
            />

            <Field
              label="ZIP / Postal code"
              value={form.zip}
              onChange={(event) => handleChange("zip", event)}
              error={errors.zip}
            />

            <Field
              select
              label="Country"
              value={form.country}
              onChange={(event) => handleChange("country", event)}
              slotProps={{
                select: {
                  IconComponent: KeyboardArrowDown,
                  MenuProps: { disableScrollLock: true },
                },
              }}
            >
              {COUNTRIES.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Field>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            sx={outlineBtn}
          >
            Cancel
          </Button>

          <Button type="submit" sx={brownBtn}>
            Save address
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AddressesPanel({ profile, onSave, onClear }) {
  const [dialog, setDialog] = useState({
    open: false,
    initial: null,
  });

  const hasSavedAddress = Boolean(profile.street);
  const addresses = [];

  if (hasSavedAddress) {
    addresses.push({
      id: 1,
      label: "Home",
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      phone: profile.phone,
      line1: profile.street,
      apartment: profile.apartment,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      country: profile.country,
      isDefault: true,
    });
  }

  async function saveAddress(address) {
    const saved = await onSave(address);

    if (saved) {
      setDialog({
        open: false,
        initial: null,
      });
    }
  }

  function openNewAddressForm() {
    setDialog({
      open: true,
      initial: null,
    });
  }

  function openEditAddressForm(address) {
    setDialog({
      open: true,
      initial: address,
    });
  }

  function closeAddressForm() {
    setDialog({
      open: false,
      initial: null,
    });
  }

  return (
    <Box>
      <PanelTitle
        title="Addresses"
        subtitle="Manage your delivery address."
        action={
          addresses.length === 0 && (
            <Button
              startIcon={<Add />}
              onClick={openNewAddressForm}
              sx={{
                ...brownBtn,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Add address
            </Button>
          )
        }
      />

      {addresses.length === 0 ? (
        <EmptyState
          Icon={LocationOnOutlined}
          title="No saved address"
          text="Add an address to speed up checkout."
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          {addresses.map((address) => (
            <Box
              key={address.id}
              sx={{
                p: { xs: 2, lg: 3 },
                border: `1px solid ${BROWN}`,
                bgcolor: "var(--c-fbf8f5)",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                  {address.label}
                </Typography>
                <Box
                  sx={{
                    px: "10px",
                    py: "2px",
                    bgcolor: BROWN,
                    color: "#fff",
                    fontSize: 12,
                  }}
                >
                  Default
                </Box>
              </Box>

              <Typography sx={{ fontSize: 14 }}>
                {address.fullName}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {address.line1}
                {address.apartment ? `, ${address.apartment}` : ""}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {address.city}, {address.state} {address.zip}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {address.country}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {address.phone}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  mt: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="small"
                  startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => openEditAddressForm(address)}
                  sx={{ color: "var(--c-333333)", textTransform: "none" }}
                >
                  Edit
                </Button>

                <Button
                  size="small"
                  startIcon={<DeleteOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={onClear}
                  sx={{ color: "#c62828", textTransform: "none" }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <AddressDialog
        key={`${dialog.open ? "open" : "closed"}-${JSON.stringify(dialog.initial || EMPTY_ADDRESS)}`}
        open={dialog.open}
        initial={dialog.initial}
        onClose={closeAddressForm}
        onSave={saveAddress}
      />
    </Box>
  );
}
