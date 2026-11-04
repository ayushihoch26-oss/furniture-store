import categoryService from "../service/category.service.js";

// filters can come from the query string or the body
const getParams = (req) => ({ ...req.query, ...req.body });

// ---------- Public ----------

// Active categories (dropdowns)
export const options = async (req, res, next) => {
  try {
    const result = await categoryService.getCategoryOptions();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ---------- Admin (Categories page) ----------

// Get All Categories (Admin)
export const adminList = async (req, res, next) => {
  try {
    const result = await categoryService.getAllCategories(getParams(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Category Stats (Admin)
export const stats = async (req, res, next) => {
  try {
    const result = await categoryService.getCategoryStats();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Get one Category (Admin)
export const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Add Category (Admin)
export const create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// Edit Category (Admin)
export const update = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Delete Category (Admin)
export const remove = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
