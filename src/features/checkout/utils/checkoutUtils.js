import {
  COUPONS,
  TAX_RATE,
  SHIPPING_OPTIONS,
  CART_KEY,
} from "../checkoutConstants";

export function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

export function validateCheckout(form) {
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

export function calculateTotals(items, couponCode, shippingId) {
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.qty || 0);
  }, 0);

  const discount = couponCode
    ? subtotal * (COUPONS[couponCode] || 0)
    : 0;

  const shippingOption = SHIPPING_OPTIONS.find((option) => {
    return option.id === shippingId;
  });
  const shipping = shippingOption ? shippingOption.price : 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const tax = taxableSubtotal * TAX_RATE;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: taxableSubtotal + shipping + tax,
  };
}

export function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatCardExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length > 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function formatCvc(value) {
  return value.replace(/\D/g, "").slice(0, 4);
}
