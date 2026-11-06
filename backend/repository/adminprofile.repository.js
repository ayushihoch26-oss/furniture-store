
import { AdminProfiles } from "../models/index.js";

// Find profile by user ID
export const findByUserId = (userId) => {
  return AdminProfiles.findOne({
    where: { userId },
  });
};

// Create admin profile
export const create = (data) => {
  return AdminProfiles.create(data);
};

// Update admin profile
export const update = (profile, data) => {
  return profile.update(data);
};

// Default export
export default {
  findByUserId,
  create,
  update,
};

