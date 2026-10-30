import { AdminProfiles } from "../models/index.js";

const adminProfileRepository = {
  findByUserId(userId) {
    return AdminProfiles.findOne({ where: { userId } });
  },

  // First visit: create an empty profile row for this admin
  create(data) {
    return AdminProfiles.create(data);
  },

  update(profile, data) {
    return profile.update(data);
  },
};

export default adminProfileRepository;
