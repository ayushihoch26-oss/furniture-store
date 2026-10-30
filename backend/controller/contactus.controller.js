import contactUsService from "../service/contactus.service.js";

// Public: "Send message" button
export const create = async (req, res, next) => {
  try {
    const data = await contactUsService.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "Message sent successfully", data });
  } catch (err) {
    next(err);
  }
};

// Admin: table, tabs and search
export const list = async (req, res, next) => {
  try {
    res.json({ success: true, data: await contactUsService.list({ ...req.body, ...req.query }) });
  } catch (err) {
    next(err);
  }
};

// Admin: the 4 cards
export const stats = async (req, res, next) => {
  try {
    res.json({ success: true, data: await contactUsService.stats() });
  } catch (err) {
    next(err);
  }
};

// Admin: eye icon
export const getById = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await contactUsService.getById(req.params.id),
    });
  } catch (err) {
    next(err);
  }
};

// Admin: New / Read / Replied
export const updateStatus = async (req, res, next) => {
  try {
    const data = await contactUsService.updateStatus(
      req.params.id,
      req.body.status,
    );
    res.json({ success: true, message: "Status updated", data });
  } catch (err) {
    next(err);
  }
};

// Admin: trash icon
export const remove = async (req, res, next) => {
  try {
    await contactUsService.remove(req.params.id);
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    next(err);
  }
};
