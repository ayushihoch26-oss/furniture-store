import categoryService from "../service/category.service.js";

// filters can come from the query string or the body
const getParams = (req) => ({ ...req.query, ...req.body });

// ---------- Public ----------

// Active categories (dropdowns)
export const options = async (req, res, next) => {
  try {
    const result = await categoryService.options();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ---------- Admin (Categories page) ----------

// Get All Categories (Admin)
export const adminList = async (req, res, next) => {
  try {
    const result = await categoryService.adminList(getParams(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Category Stats (Admin)
export const stats = async (req, res, next) => {
  try {
    const result = await categoryService.stats();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Get one Category (Admin)
export const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Add Category (Admin)
export const create = async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// Edit Category (Admin)
export const update = async (req, res, next) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Delete Category (Admin)
export const remove = async (req, res, next) => {
  try {
    await categoryService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
