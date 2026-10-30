import wishlistService from "../service/wishlist.service.js";

// ---------- Customer ----------

// Get My Wishlist
export const getMyWishlist = async (req, res, next) => {
  try {
    res.json(await wishlistService.getMyWishlist(req.user.id));
  } catch (err) {
    next(err);
  }
};

// Add Product To Wishlist
export const add = async (req, res, next) => {
  try {
    res.status(201).json(await wishlistService.add(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
};

// Toggle Product (heart icon)
export const toggle = async (req, res, next) => {
  try {
    res.json(await wishlistService.toggle(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
};

// Remove Product From Wishlist
export const remove = async (req, res, next) => {
  try {
    res.json(await wishlistService.remove(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
};

// Clear All
export const clear = async (req, res, next) => {
  try {
    const result = await wishlistService.clear(req.user.id);
    res.json({
      success: true,
      message: "Wishlist cleared successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// Wishlist Count (header badge)
export const count = async (req, res, next) => {
  try {
    res.json(await wishlistService.count(req.user.id));
  } catch (err) {
    next(err);
  }
};

// ---------- Admin ----------

// Get All Wishlist Items (the admin routes are POST, so read the body too)
export const list = async (req, res, next) => {
  try {
    res.json(await wishlistService.list({ ...req.query, ...req.body }));
  } catch (err) {
    next(err);
  }
};

// Get Wishlist Stats
export const stats = async (req, res, next) => {
  try {
    res.json(await wishlistService.stats());
  } catch (err) {
    next(err);
  }
};

// Get A Customer's Wishlist
export const getByUser = async (req, res, next) => {
  try {
    res.json(await wishlistService.getByUser(req.params.userId));
  } catch (err) {
    next(err);
  }
};

// Delete One Wishlist Item
export const removeById = async (req, res, next) => {
  try {
    await wishlistService.removeById(req.params.id);
    res.json({ success: true, message: "Wishlist item deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Clear A Customer's Wishlist
export const clearByUser = async (req, res, next) => {
  try {
    await wishlistService.clearByUser(req.params.userId);
    res.json({
      success: true,
      message: "Customer wishlist cleared successfully",
    });
  } catch (err) {
    next(err);
  }
};
