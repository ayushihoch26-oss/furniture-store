export const BROWN = "#947458";
export const GRAY_BG = "var(--c-f4f2f0)";
export const LIGHT_BG = "var(--c-f8f8f8)";
export const CONTENT_PAD = "max(5%, calc((100% - 1296px) / 2))";
export const SIDE = { xs: 2, sm: 4, md: CONTENT_PAD };
export const CART_KEY = "furniture_cart";
export const TAX_RATE = 0.08;
export const COUPONS = { SAVE10: 0.1 };

export const STEPS = ["Contact", "Address", "Shipping", "Payment"];
export const LAST_STEP = STEPS.length - 1;

export const STEP_FIELDS = [
  ["email", "phone"],
  ["firstName", "lastName", "address", "city", "state", "zip"],
  [],
  ["cardNumber", "cardName", "expiry", "cvc"],
];

export const SHIPPING_OPTIONS = [
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

export const PAYMENT_OPTIONS = [
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

export const COUNTRIES = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
];

export const INITIAL_FORM = {
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
