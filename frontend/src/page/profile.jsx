import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  ButtonBase,
  IconButton,
  TextField,
  MenuItem,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  ShoppingBagOutlined,
  LocationOnOutlined,
  LockOutlined,
  LogoutOutlined,
  Visibility,
  VisibilityOff,
  EditOutlined,
  Close,
  KeyboardArrowDown,
  Add,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

import { logoutUser } from "../service/login.service";
import profileService, { formatProfile } from "../service/profile.service";
import orderService from "../service/order.service";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { onImgError } from "../assets/furnitureImages";

// Layout and colors (same as Shop / Checkout)
const BROWN = "#947458";
const GRAY_BG = "var(--c-f4f2f0)";
const LIGHT_BG = "var(--c-f8f8f8)";
const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };

const PROFILE_KEY = "furniture_profile";
const EMPTY_PROFILE = formatProfile();

const COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
];

const TABS = [
  { id: "account", label: "Account details", Icon: PersonOutlinedIcon },
  { id: "orders", label: "My orders", Icon: ShoppingBagOutlined },
  { id: "addresses", label: "Addresses", Icon: LocationOnOutlined },
  { id: "security", label: "Password", Icon: LockOutlined },
];

const STATUS_STYLE = {
  Delivered: { bg: "#E8F5E9", color: "#2e7d32" },
  Shipped: { bg: "#E3F2FD", color: "#1565c0" },
  Pending: { bg: "var(--c-f5ede6)", color: BROWN },
  Processing: { bg: "var(--c-f5ede6)", color: BROWN },
  Cancelled: { bg: "#FDECEA", color: "#c62828" },
};

// Helpers kept outside the components (keeps render pure)
const money = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Shared input style
const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    bgcolor: "var(--c-ffffff)",
    fontSize: { xs: 14, lg: 15 },
    "& fieldset": { borderColor: "var(--c-d9d4cf)" },
    "&:hover fieldset": { borderColor: BROWN },
    "&.Mui-focused fieldset": { borderColor: BROWN, borderWidth: 1 },
  },
  "& .MuiInputLabel-root": { fontSize: { xs: 14, lg: 15 } },
  "& .MuiInputLabel-root.Mui-focused": { color: BROWN },
};

function Field({ error, sx, ...props }) {
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
}

const brownBtn = {
  height: { xs: 44, lg: 48 },
  px: { xs: 3, lg: 5 },
  borderRadius: 0,
  bgcolor: BROWN,
  color: "#fff",
  textTransform: "none",
  fontSize: { xs: 14, lg: 15 },
  fontWeight: 600,
  "&:hover": { bgcolor: "#7d6048" },
};

const outlineBtn = {
  height: { xs: 44, lg: 48 },
  px: { xs: 3, lg: 4 },
  borderRadius: 0,
  borderColor: BROWN,
  color: "var(--c-555555)",
  textTransform: "none",
  fontSize: { xs: 14, lg: 15 },
  "&:hover": { borderColor: BROWN, bgcolor: "transparent" },
};

function PanelTitle({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: { xs: 3, lg: 4 },
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 22, md: 26, lg: 30 },
            fontWeight: 600,
            color: "var(--c-111111)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: { xs: 13, lg: 14 },
              color: "var(--c-777777)",
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

function EmptyState({ Icon, title, text, to, button }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: { xs: 6, lg: 10 },
        bgcolor: LIGHT_BG,
        color: "var(--c-777777)",
      }}
    >
      <Icon sx={{ fontSize: 56 }} />
      <Typography
        sx={{
          fontSize: { xs: 18, md: 20 },
          fontWeight: 600,
          color: "var(--c-111111)",
          mt: 1,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 14, mt: 0.5 }}>{text}</Typography>
      {to && (
        <Button component={Link} to={to} sx={{ ...brownBtn, mt: 3 }}>
          {button}
        </Button>
      )}
    </Box>
  );
}

/* ---------------------------- Account details ---------------------------- */
function AccountPanel({ profile, onSave }) {
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState({});

  // Update the form when real profile data loads.
  useEffect(() => {
    setForm({ ...profile });
    setErrors({});
  }, [profile]);

  const set = (name) => (e) => {
    setForm((previous) => ({
      ...previous,
      [name]: e.target.value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: undefined,
      }));
    }
  };

  const submit = (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!form.firstName.trim()) {
      validationErrors.firstName = "Required";
    }

    if (!form.lastName.trim()) {
      validationErrors.lastName = "Required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      validationErrors.email = "Enter a valid email address";
    }

    if (form.phone.replace(/\D/g, "").length < 7) {
      validationErrors.phone = "Enter a valid phone number";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSave(form);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={submit}>
      <PanelTitle
        title="Account details"
        subtitle="Update your personal information."
      />

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
        />

        <Field
          label="Last name"
          value={form.lastName}
          onChange={set("lastName")}
          error={errors.lastName}
        />

        <Field
          label="Email address"
          type="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />

        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
        />

        <Field
          label="Birthday"
          type="date"
          value={form.birthday}
          onChange={set("birthday")}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Field
          select
          label="Gender"
          value={form.gender}
          onChange={set("gender")}
          slotProps={{
            select: {
              IconComponent: KeyboardArrowDown,
              MenuProps: { disableScrollLock: true },
            },
          }}
        >
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Field>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          type="submit"
          sx={{ ...brownBtn, width: { xs: "100%", sm: "auto" } }}
        >
          Save changes
        </Button>

        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            setForm({ ...profile });
            setErrors({});
          }}
          sx={{ ...outlineBtn, width: { xs: "100%", sm: "auto" } }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
}

/* --------------------------------- Orders -------------------------------- */
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const style = STATUS_STYLE[order.status] || STATUS_STYLE.Processing;
  const count = order.items.reduce((n, i) => n + i.qty, 0);

  return (
    <Box
      sx={{ border: "1px solid var(--c-e5e0db)", bgcolor: "var(--c-ffffff)" }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, lg: 3 },
          py: 2,
          bgcolor: LIGHT_BG,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: 14, lg: 16 }, fontWeight: 600 }}>
            Order {order.id}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "var(--c-777777)" }}>
            Placed on {formatDate(order.date)}
          </Typography>
        </Box>
        <Box
          sx={{
            px: "12px",
            py: "4px",
            fontSize: 12.5,
            fontWeight: 600,
            bgcolor: style.bg,
            color: style.color,
          }}
        >
          {order.status}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 2, lg: 3 },
          py: 2.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {order.items.slice(0, 4).map((item, i) => (
            <Box
              key={i}
              sx={{
                width: { xs: 52, lg: 64 },
                height: { xs: 52, lg: 64 },
                bgcolor: GRAY_BG,
              }}
            >
              <Box
                component="img"
                src={item.img}
                alt={item.name}
                onError={onImgError}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: "4px",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography sx={{ fontSize: 13, color: "var(--c-777777)" }}>
            {count} {count === 1 ? "item" : "items"}
          </Typography>
          <Typography sx={{ fontSize: { xs: 17, lg: 20 }, fontWeight: 700 }}>
            {money(order.total)}
          </Typography>
        </Box>
      </Box>

      <Collapse in={open}>
        <Box
          sx={{
            px: { xs: 2, lg: 3 },
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {order.items.map((item, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                fontSize: 14,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14 }}>
                  {item.name}{" "}
                  <Box component="span" sx={{ color: "var(--c-777777)" }}>
                    × {item.qty}
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "var(--c-777777)" }}>
                  {item.color}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {money(item.price * item.qty)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>

      <Box
        sx={{
          borderTop: "1px solid var(--c-eeeeee)",
          px: { xs: 2, lg: 3 },
          py: 1,
        }}
      >
        <Button
          onClick={() => setOpen((o) => !o)}
          endIcon={
            <KeyboardArrowDown
              sx={{
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            />
          }
          sx={{
            color: BROWN,
            textTransform: "none",
            fontSize: 14,
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          {open ? "Hide details" : "View details"}
        </Button>
      </Box>
    </Box>
  );
}

// Backend order -> shape used by OrderCard
const mapOrder = (order) => ({
  id: order.orderId || `#ORD${String(order.id).padStart(4, "0")}`,
  date: order.createdAt,
  status: order.status || "Pending",
  total: Number(order.total) || 0,
  items: (order.items || []).map((item) => ({
    name: item.name,
    price: Number(item.price) || 0,
    qty: Number(item.quantity) || 1,
    color: item.color || "",
    img: item.image,
  })),
});

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        if (active) setOrders(Array.isArray(data) ? data.map(mapOrder) : []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load orders");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box>
      <PanelTitle
        title="My orders"
        subtitle="Track and review your recent purchases."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading orders...</Typography>
      ) : orders.length === 0 ? (
        <EmptyState
          Icon={ShoppingBagOutlined}
          title="No orders yet"
          text="When you place an order it will show up here."
          to="/Shop"
          button="Start shopping"
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      )}
    </Box>
  );
}

/* -------------------------------- Addresses ------------------------------- */
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
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});

  // Load the address being edited (or a blank one) each time the dialog opens
  useEffect(() => {
    if (open) {
      setForm(initial || EMPTY_ADDRESS);
      setErrors({});
    }
  }, [open, initial]);

  const set = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    ["fullName", "line1", "city", "state", "zip"].forEach((k) => {
      if (!String(form[k] || "").trim()) er[k] = "Required";
    });
    if (String(form.phone || "").replace(/\D/g, "").length < 7)
      er.phone = "Enter a valid phone number";
    setErrors(er);
    if (Object.keys(er).length === 0) onSave(form);
  };

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
      <Box component="form" noValidate onSubmit={submit}>
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
              onChange={set("label")}
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
              onChange={set("fullName")}
              error={errors.fullName}
            />
            <Field
              sx={{ gridColumn: { sm: "1 / -1" } }}
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
            />
            <Field
              sx={{ gridColumn: { sm: "1 / -1" } }}
              label="Street address"
              value={form.line1}
              onChange={set("line1")}
              error={errors.line1}
            />
            <Field
              label="City"
              value={form.city}
              onChange={set("city")}
              error={errors.city}
            />
            <Field
              label="State / Province"
              value={form.state}
              onChange={set("state")}
              error={errors.state}
            />
            <Field
              label="ZIP / Postal code"
              value={form.zip}
              onChange={set("zip")}
              error={errors.zip}
            />
            <Field
              select
              label="Country"
              value={form.country}
              onChange={set("country")}
              slotProps={{
                select: {
                  IconComponent: KeyboardArrowDown,
                  MenuProps: { disableScrollLock: true },
                },
              }}
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
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

// A user has one address (saved on the user in the database)
function AddressesPanel({ profile, onSave, onClear }) {
  const [dialog, setDialog] = useState({ open: false, initial: null });

  const addresses = profile.street
    ? [
        {
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
        },
      ]
    : [];

  const save = async (data) => {
    const ok = await onSave(data);
    if (ok) setDialog({ open: false, initial: null });
  };

  return (
    <Box>
      <PanelTitle
        title="Addresses"
        subtitle="Manage your delivery address."
        action={
          addresses.length === 0 && (
            <Button
              startIcon={<Add />}
              onClick={() => setDialog({ open: true, initial: null })}
              sx={{ ...brownBtn, width: { xs: "100%", sm: "auto" } }}
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
          {addresses.map((a) => (
            <Box
              key={a.id}
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
                  {a.label}
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
              <Typography sx={{ fontSize: 14 }}>{a.fullName}</Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {a.line1}
                {a.apartment ? `, ${a.apartment}` : ""}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {a.city}, {a.state} {a.zip}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {a.country}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
                {a.phone}
              </Typography>

              <Box
                sx={{ display: "flex", gap: 0.5, mt: 1.5, flexWrap: "wrap" }}
              >
                <Button
                  size="small"
                  startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => setDialog({ open: true, initial: a })}
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
        open={dialog.open}
        initial={dialog.initial}
        onClose={() => setDialog({ open: false, initial: null })}
        onSave={save}
      />
    </Box>
  );
}

/* --------------------------------- Password ------------------------------- */
function PasswordField({ label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={error}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                edge="end"
              >
                {show ? (
                  <VisibilityOff sx={{ fontSize: 20 }} />
                ) : (
                  <Visibility sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function SecurityPanel({ notify }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const set = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const er = {};

    if (!form.current) {
      er.current = "Enter your current password";
    }

    if (form.next.length < 8 || !/\d/.test(form.next)) {
      er.next = "At least 8 characters, including a number";
    }

    if (form.confirm !== form.next) {
      er.confirm = "Passwords do not match";
    }

    setErrors(er);

    if (Object.keys(er).length !== 0) return;

    try {
      await profileService.changePassword(form);

      setForm({ current: "", next: "", confirm: "" });
      setErrors({});
      notify("Password updated");
    } catch (error) {
      notify(error.message || "Failed to update password");
    }
  };

  return (
    <Box component="form" noValidate onSubmit={submit} sx={{ maxWidth: 520 }}>
      <PanelTitle
        title="Change password"
        subtitle="Use a strong password you don't use elsewhere."
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <PasswordField
          label="Current password"
          value={form.current}
          onChange={set("current")}
          error={errors.current}
        />
        <PasswordField
          label="New password"
          value={form.next}
          onChange={set("next")}
          error={errors.next}
        />
        <PasswordField
          label="Confirm new password"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />
      </Box>
      <Button type="submit" sx={{ ...brownBtn, mt: 4 }}>
        Update password
      </Button>
    </Box>
  );
}

/* ------------------------------- Profile page ------------------------------ */
export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("account");

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, msg: "" });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const notify = (msg) => setToast({ open: true, msg });

  const initials =
    `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() ||
    "U";

  // Load the real profile from the database
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const user = await profileService.getMyProfile();
        if (active) setProfile(formatProfile(user));
      } catch (error) {
        if (active) {
          setToast({
            open: true,
            msg: error.message || "Failed to load profile",
          });
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    setLogoutOpen(false);
    logoutUser();
    navigate("/Dashboard", { replace: true });
  };

  // Account details form
  const handleSaveProfile = async (data) => {
    try {
      const updated = await profileService.updateMyProfile(data);
      setProfile(updated);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      notify("Profile updated");
    } catch (error) {
      notify(error.message || "Failed to update profile");
    }
  };

  // Address dialog -> saved on the user in the database
  const handleSaveAddress = async (data) => {
    try {
      const [firstName, ...rest] = String(data.fullName).trim().split(/\s+/);

      const updated = await profileService.updateMyProfile({
        ...profile,
        firstName,
        lastName: rest.join(" ") || profile.lastName,
        phone: data.phone,
        street: data.line1,
        apartment: data.apartment || "",
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      });

      setProfile(updated);
      notify(profile.street ? "Address updated" : "Address added");
      return true;
    } catch (error) {
      notify(error.message || "Failed to save address");
      return false;
    }
  };

  const handleClearAddress = async () => {
    try {
      const updated = await profileService.updateMyProfile({
        ...profile,
        street: "",
        apartment: "",
        city: "",
        state: "",
        zip: "",
      });

      setProfile(updated);
      notify("Address removed");
    } catch (error) {
      notify(error.message || "Failed to remove address");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "var(--c-ffffff)" }}>
      <Navbar />

      {/* Page heading */}
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
          My Account
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
          /<Box sx={{ color: "var(--c-111111)" }}>My Account</Box>
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: SIDE,
          py: { xs: 3, md: "48px", lg: "72px" },
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "260px minmax(0, 1fr)",
            lg: "320px minmax(0, 1fr)",
          },
          columnGap: { md: "32px", lg: "64px" },
          rowGap: 3,
          alignItems: "start",
        }}
      >
        {/* Sidebar */}
        <Box sx={{ minWidth: 0 }}>
          {/* user card */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: LIGHT_BG,
              p: { xs: 2, lg: 3 },
              mb: { xs: 2, md: 2.5 },
            }}
          >
            <Box
              sx={{
                width: { xs: 52, lg: 64 },
                height: { xs: 52, lg: 64 },
                borderRadius: "50%",
                bgcolor: BROWN,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: { xs: 18, lg: 22 },
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{ fontSize: { xs: 16, lg: 18 }, fontWeight: 600 }}
                noWrap
              >
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: "var(--c-777777)" }}
                noWrap
              >
                {profile.email}
              </Typography>
            </Box>
          </Box>

          {/* phone / tablet: scrollable tab row */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {TABS.map(({ id, label }) => (
              <ButtonBase
                key={id}
                onClick={() => setTab(id)}
                // keep the active tab visible in the scrollable row
                ref={(el) => {
                  if (el && tab === id) {
                    el.scrollIntoView({
                      inline: "center",
                      block: "nearest",
                      behavior: "smooth",
                    });
                  }
                }}
                sx={{
                  flexShrink: 0,
                  px: 2,
                  height: 38,
                  fontSize: 13.5,
                  border: `1px solid ${tab === id ? BROWN : "var(--c-d9d4cf)"}`,
                  bgcolor: tab === id ? BROWN : "var(--c-ffffff)",
                  color: tab === id ? "#fff" : "var(--c-333333)",
                }}
              >
                {label}
              </ButtonBase>
            ))}
          </Box>

          {/* desktop: vertical menu */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              border: "1px solid var(--c-e5e0db)",
            }}
          >
            {TABS.map(({ id, label, Icon }) => (
              <ButtonBase
                key={id}
                onClick={() => setTab(id)}
                sx={{
                  justifyContent: "flex-start",
                  gap: 1.5,
                  px: 2.5,
                  py: { md: "13px", lg: "16px" },
                  fontSize: { md: 14, lg: 16 },
                  fontWeight: tab === id ? 600 : 400,
                  color: tab === id ? BROWN : "var(--c-222222)",
                  bgcolor: tab === id ? "var(--c-fbf8f5)" : "var(--c-ffffff)",
                  borderLeft: `3px solid ${tab === id ? BROWN : "transparent"}`,
                  borderBottom: "1px solid var(--c-eeeeee)",
                  "&:hover": { bgcolor: "var(--c-fbf8f5)" },
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                {label}
              </ButtonBase>
            ))}
            <ButtonBase
              onClick={() => setLogoutOpen(true)}
              sx={{
                justifyContent: "flex-start",
                gap: 1.5,
                px: 2.5,
                py: { md: "13px", lg: "16px" },
                fontSize: { md: 14, lg: 16 },
                color: "#c62828",
                borderLeft: "3px solid transparent",
                "&:hover": { bgcolor: "#FDECEA" },
              }}
            >
              <LogoutOutlined sx={{ fontSize: 20 }} />
              Log out
            </ButtonBase>
          </Box>
        </Box>

        {/* Panel */}
        <Box sx={{ minWidth: 0 }}>
          {tab === "account" &&
            (profileLoading ? (
              <Typography>Loading account details...</Typography>
            ) : (
              <AccountPanel profile={profile} onSave={handleSaveProfile} />
            ))}

          {tab === "orders" && <OrdersPanel />}

          {tab === "addresses" && (
            <AddressesPanel
              profile={profile}
              onSave={handleSaveAddress}
              onClear={handleClearAddress}
            />
          )}

          {tab === "security" && <SecurityPanel notify={notify} />}

          {/* phone: log out button below the panel */}
          <Button
            startIcon={<LogoutOutlined />}
            onClick={() => setLogoutOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mt: 4,
              color: "#c62828",
              textTransform: "none",
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      <Footer />

      {/* Log out confirmation */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Log out?</DialogTitle>

        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "var(--c-555555)" }}>
            You will need to sign in again to see your account.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setLogoutOpen(false)}
            variant="outlined"
            sx={outlineBtn}
          >
            Cancel
          </Button>

          <Button onClick={handleLogout} sx={brownBtn}>
            Log out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 0, bgcolor: BROWN }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
