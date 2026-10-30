import userService from "../service/user.service.js";

// Register User
export const register = async (req, res, next) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// Login User
export const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Forgot password: send the reset link by email
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await userService.forgotPassword(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Reset password: save the new password (link from the email)
export const resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Google Login
export const googleLogin = async (req, res, next) => {
  try {
    const result = await userService.googleLogin(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Admin: customer overview chart data
export const overview = async (req, res, next) => {
  try {
    const data = await userService.overview();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
// Send SMS OTP
export const sendOtp = async (req, res, next) => {
  try {
    const result = await userService.sendOtp(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Verify SMS OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const result = await userService.verifyOtp(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Send Email OTP
export const sendEmailOtp = async (req, res, next) => {
  try {
    const result = await userService.sendEmailOtp(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Verify Email OTP
export const verifyEmailOtp = async (req, res, next) => {
  try {
    const result = await userService.verifyEmailOtp(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Get My Profile
export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// Update My Profile
export const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(
      req.user.id,
      req.body,
      req.file,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Get All Users (Admin)
// Supports pagination, search, and date filters
export const list = async (req, res, next) => {
  try {
    const result = await userService.list({
      ...req.query,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// Get User By ID (Admin)
export const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// Delete User (Admin)
export const remove = async (req, res, next) => {
  try {
    await userService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
