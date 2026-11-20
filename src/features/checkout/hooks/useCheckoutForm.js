import { useCallback, useEffect, useState } from "react";
import profileService from "../../profile/services/profile.service";
import { COUPONS, INITIAL_FORM } from "../checkoutConstants";

export function useCheckoutForm(navigate, location) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    let isCurrent = true;

    async function loadProfile() {
      try {
        const user = await profileService.getMyProfile();

        if (!isCurrent || !user) return;

        setForm((oldForm) => ({
          ...oldForm,
          email: oldForm.email || user.email || "",
          phone: oldForm.phone || user.phone || "",
          firstName: oldForm.firstName || user.firstName || "",
          lastName: oldForm.lastName || user.lastName || "",
          address: oldForm.address || user.street || "",
          apartment: oldForm.apartment || user.apartment || "",
          city: oldForm.city || user.city || "",
          state: oldForm.state || user.state || "",
          zip: oldForm.zip || user.zip || "",
          country: user.country || oldForm.country,
        }));
      } catch {
        // The customer can enter the details manually.
      }
    }

    loadProfile();

    return () => {
      isCurrent = false;
    };
  }, [navigate, location]);

  const updateField = useCallback((fieldName) => (event) => {
    setForm((oldForm) => ({
      ...oldForm,
      [fieldName]: event.target.value,
    }));
    setErrors((oldErrors) =>
      oldErrors[fieldName]
        ? { ...oldErrors, [fieldName]: undefined }
        : oldErrors,
    );
  }, []);

  const updateFormattedField = useCallback(
    (fieldName, formatValue) => (event) => {
      setForm((oldForm) => ({
        ...oldForm,
        [fieldName]: formatValue(event.target.value),
      }));
      setErrors((oldErrors) =>
        oldErrors[fieldName]
          ? { ...oldErrors, [fieldName]: undefined }
          : oldErrors,
      );
    },
    [],
  );

  function applyCoupon() {
    if (appliedCoupon) {
      setAppliedCoupon("");
      setCoupon("");
      setCouponMessage("");
      return;
    }

    const code = coupon.trim().toUpperCase();

    if (Object.hasOwn(COUPONS, code)) {
      setAppliedCoupon(code);
      setCouponMessage(`Code ${code} applied`);
    } else {
      setCouponMessage("Invalid discount code");
    }
  }

  return {
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
  };
}
