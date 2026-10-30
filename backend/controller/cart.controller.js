import cartService from "../service/cart.service.js";

// ---------- Customer (Shopping Cart page) ----------

// Get My Cart
export const getMyCart = async (req, res, next) => {
  try {
    const cart = await cartService.getMyCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Add Item To Cart
export const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
};

// Update Item Quantity
export const updateQuantity = async (req, res, next) => {
  try {
    const cart = await cartService.updateQuantity(req.user.id, req.body);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Remove Item From Cart
export const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.body);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Proceed To Checkout
export const checkout = async (req, res, next) => {
  try {
    const cart = await cartService.checkout(req.user.id);
    res.json({
      success: true,
      message: "Checkout successful",
      cart,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- Admin (Cart List page) ----------

// Get All Carts (Admin)
export const list = async (req, res, next) => {
  try {
    const carts = await cartService.list(req.query);
    res.json(carts);
  } catch (err) {
    next(err);
  }
};

// Get Cart Stats (Admin)
export const stats = async (req, res, next) => {
  try {
    const result = await cartService.stats();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Get Cart By ID (Admin)
export const getById = async (req, res, next) => {
  try {
    const cart = await cartService.getById(req.params.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Update Cart Status (Admin)
export const updateStatus = async (req, res, next) => {
  try {
    const cart = await cartService.updateStatus(req.params.id, req.body.status);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Delete Cart (Admin)
export const remove = async (req, res, next) => {
  try {
    await cartService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: "Cart deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
