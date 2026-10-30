import passwordService from "../service/password.service.js";

// "Forgot password" page: send the reset link by email
export const forgot = async (req, res, next) => {
  try {
    const result = await passwordService.forgot(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// "Reset password" page: save the new password
export const reset = async (req, res, next) => {
  try {
    const result = await passwordService.reset(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
