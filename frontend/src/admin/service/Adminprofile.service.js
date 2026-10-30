import api from "../../api/api";

// Backend mounts the router at /api/admin-profile (see adminProfile.route.js).
// If your axios instance baseURL already ends with "/admin-profile", use "".
const BASE = "/admin-profile";

const post = async (path, body, config) => {
  try {
    const response = await api.post(`${BASE}${path}`, body, config);
    return response.data;
  } catch (err) {
    console.error(
      `[adminProfileService] ${path} failed:`,
      err.response?.status,
      err.response?.data || err.message,
    );
    throw err;
  }
};

const adminProfileService = {
  getProfile: () => post("/me"),

  updateProfile: (data) => post("/update", data),

  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file); // field name must be "image"
    return post("/upload-image", form);
  },

  deleteImage: () => post("/delete-image"),

  setSocial: (key, linked) => post("/social", { key, linked }),

  // Uses the existing users API (userController.changePassword):
  //   POST /api/users/users/me/password  { currentPassword, newPassword }
  // The "re-enter password" match is checked on the page before this runs.
  async changePassword({ current, next }) {
    try {
      const response = await api.post("/users/users/me/password", {
        currentPassword: current,
        newPassword: next,
      });
      return response.data;
    } catch (err) {
      console.error(
        "[adminProfileService] change password failed:",
        err.response?.status,
        err.response?.data || err.message,
      );
      throw err;
    }
  },
};

// Message to show in the toast when a request fails
export const getErrorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message || fallback;

export default adminProfileService;
