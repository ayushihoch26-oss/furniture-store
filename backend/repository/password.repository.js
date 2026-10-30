import { Op } from "sequelize";
import { Users } from "../models/index.js";

const passwordRepository = {
  findByEmail(email) {
    return Users.findOne({ where: { email } });
  },

  // Only returns the user if the token matches AND has not expired
  findByValidResetToken(tokenHash) {
    return Users.findOne({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });
  },

  saveResetToken(user, tokenHash, expires) {
    return user.update({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expires,
    });
  },

  // Save the new password and make the link single-use
  setNewPassword(user, passwordHash) {
    return user.update({
      password: passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  },
};

export default passwordRepository;
