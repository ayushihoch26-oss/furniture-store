import orderService from "../service/ordermanagement.service.js";

// Checkout: "Place order"
export const create = async (req, res, next) => {
  try {
    const data = await orderService.create(req.body, req.user);
    res
      .status(201)
      .json({ success: true, message: "Order placed successfully", data });
  } catch (err) {
    next(err);
  }
};

// Admin: order table, tabs, search
export const list = async (req, res, next) => {
  try {
    res.json({ success: true, data: await orderService.list(req.body) });
  } catch (err) {
    next(err);
  }
};

// Customer: my orders
export const myOrders = async (req, res, next) => {
  try {
    res.json({ success: true, data: await orderService.listMine(req.user.id) });
  } catch (err) {
    next(err);
  }
};

// Admin: 4 cards
export const stats = async (req, res, next) => {
  try {
    res.json({ success: true, data: await orderService.stats() });
  } catch (err) {
    next(err);
  }
};

// Eye icon
export const getById = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await orderService.getById(req.params.id, req.user),
    });
  } catch (err) {
    next(err);
  }
};

// Admin: pencil icon
export const update = async (req, res, next) => {
  try {
    const data = await orderService.update(req.params.id, req.body);
    res.json({ success: true, message: "Order updated", data });
  } catch (err) {
    next(err);
  }
};

// Admin: trash icon
export const remove = async (req, res, next) => {
  try {
    await orderService.remove(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
};
