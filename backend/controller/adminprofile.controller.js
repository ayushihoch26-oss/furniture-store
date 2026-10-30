import adminProfileService from "../service/adminProfile.service.js";

// verifyToken puts the logged-in user on req.user. If your token uses another
// field name for the id (e.g. userId), change it here - it is the only place.
const getUser = (req) => ({
  id: req.user?.id ?? req.user?.userId,
  email: req.user?.email,
});

export const getProfile = async (req, res, next) => {
  try {
    res.json(await adminProfileService.get(getUser(req)));
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    res.json(await adminProfileService.update(getUser(req), req.body));
  } catch (err) {
    next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    res.json(await adminProfileService.uploadImage(getUser(req), req.file));
  } catch (err) {
    next(err);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    res.json(await adminProfileService.deleteImage(getUser(req)));
  } catch (err) {
    next(err);
  }
};

export const setSocial = async (req, res, next) => {
  try {
    const { key, linked } = req.body;
    res.json(await adminProfileService.setSocial(getUser(req), key, linked));
  } catch (err) {
    next(err);
  }
};
