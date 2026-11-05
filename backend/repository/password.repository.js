import { Op } from "sequelize";
import { Users } from "../models/index.js";

export const findByEmail = async (email) => {
  return await Users.findOne({
    where: { email },
  });
};

// Only returns the user if the token matches AND has not expired
export const findByValidResetToken = async (tokenHash) => {
  return await Users.findOne({
    where: {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });
};

export const saveResetToken = async (user, tokenHash, expires) => {
  return await user.update({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: expires,
  });
};

// Save the new password and make the link single-use
export const setNewPassword = async (user, passwordHash) => {
  return await user.update({
    password: passwordHash,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
};

// Default export
const passwordRepository = {
  findByEmail,
  findByValidResetToken,
  saveResetToken,
  setNewPassword,
};

export default passwordRepository;
