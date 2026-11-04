import categoryRepository from "../repository/category.repository.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const RESERVED_NAME = "Other"; // used by the product filters for uncategorised items

const toPage = (value) => Math.max(Number(value) || 1, 1);
const toLimit = (value, fallback) =>
  Math.min(Math.max(Number(value) || fallback, 1), 100);

const toBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

// Shape sent to the frontend
const formatCategory = (category, productCount = 0) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  image: category.image,
  isActive: Boolean(category.isActive),
  productCount,
  createdAt: category.createdAt,
});

// Validate + clean the data. partial = true is used for updates.
const validateCategory = (data = {}, partial = false) => {
  const clean = {};

  if (!partial || data.name !== undefined) {
    const name = String(data.name ?? "").trim();
    if (!name) throw new AppError("name is required", 400);
    if (name.length > 60) {
      throw new AppError("name must be 60 characters or less", 400);
    }
    if (name.toLowerCase() === RESERVED_NAME.toLowerCase()) {
      throw new AppError(`"${RESERVED_NAME}" is a reserved name`, 400);
    }
    clean.name = name;
  }

  if (data.description !== undefined) {
    clean.description = data.description
      ? String(data.description).trim()
      : null;
  }

  if (data.image !== undefined) {
    clean.image = data.image ? String(data.image).trim() : null;
  }

  if (data.isActive !== undefined) {
    const isActive = toBoolean(data.isActive);
    if (isActive === undefined) throw new AppError("Invalid status", 400);
    clean.isActive = isActive;
  }

  return clean;
};

const categoryService = {
  // ================= PUBLIC =================

  // Active categories for dropdowns
  async options() {
    const categories = await categoryRepository.activeWithCounts();
    return categories.map(({ id, category, count }) => ({
      id,
      name: category,
      count,
    }));
  },

  // ================= ADMIN =================

  async adminList(query = {}) {
    const result = await categoryRepository.findAll({
      search: query.search,
      isActive:
        query.status === "active"
          ? true
          : query.status === "inactive"
            ? false
            : undefined,
      sort: query.sort,
      page: toPage(query.page),
      limit: toLimit(query.limit, 8),
    });

    const counts = await categoryRepository.productCounts(
      result.categories.map((category) => category.name),
    );

    return {
      categories: result.categories.map((category) =>
        formatCategory(category, counts[category.name] || 0),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  async stats() {
    const [total, active, inactive] = await Promise.all([
      categoryRepository.count(),
      categoryRepository.count({ isActive: true }),
      categoryRepository.count({ isActive: false }),
    ]);

    return { total, active, inactive };
  },

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    const productCount = await categoryRepository.countProducts(category.name);
    return formatCategory(category, productCount);
  },

  async create(data) {
    const categoryData = validateCategory(data);

    const existing = await categoryRepository.findByName(categoryData.name);
    if (existing) throw new AppError("Category already exists", 409);

    const category = await categoryRepository.create(categoryData);
    return formatCategory(category, 0);
  },

  async update(id, data) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    const categoryData = validateCategory(data, true);

    if (categoryData.name && categoryData.name !== category.name) {
      const existing = await categoryRepository.findByName(categoryData.name);
      if (existing && existing.id !== category.id) {
        throw new AppError("Category already exists", 409);
      }
    }

    await categoryRepository.update(category, categoryData);

    const productCount = await categoryRepository.countProducts(category.name);
    return formatCategory(category, productCount);
  },

  async remove(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    const productCount = await categoryRepository.countProducts(category.name);
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete: ${productCount} product(s) use this category`,
        409,
      );
    }

    await categoryRepository.delete(id);
    return { message: "Category deleted successfully" };
  },
};

export default categoryService;
