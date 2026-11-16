import api from "../api/api";

// Turn any API error into a normal Error with a readable message
const toError = (error) => {
  const err = new Error(
    error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.",
  );
  err.status = error?.response?.status;
  return err;
};

// Database user -> shape used by the Profile page
export const formatProfile = (user = {}) => ({
  id: user.id,
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  email: user.email || "",
  phone: user.phone || "",
  birthday: user.birthdate || "",
  gender: user.gender || "",
  street: user.street || "",
  apartment: user.apartment || "",
  city: user.city || "",
  state: user.state || "",
  zip: user.zip || "",
  country: user.country || "United States",
});

const profileService = {
  // Returns the raw user from the database
  async getMyProfile() {
    try {
      const response = await api.post("/users/users/me", {});
      return response.data?.user ?? response.data?.data ?? response.data;
    } catch (error) {
      throw toError(error);
    }
  },

  // Returns the updated profile (already formatted)
  async updateMyProfile(data) {
    try {
      const response = await api.post("/users/users/me/update", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthdate: data.birthday,
        gender: data.gender,
        street: data.street,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      });
      return formatProfile(
        response.data?.user ?? response.data?.data ?? response.data,
      );
    } catch (error) {
      throw toError(error);
    }
  },

  // form = { current, next, confirm }
  async changePassword(form) {
    try {
      await api.post("/users/users/me/password", {
        currentPassword: form.current,
        newPassword: form.next,
      });
    } catch (error) {
      throw toError(error);
    }
  },
};

export default profileService;
