
import * as categoryRepository from "../repository/category.repository.js";

// Custom error
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Get active categories (Public)
export const getCategoryOptions = async () => {
  const categories = await categoryRepository.activeWithCounts();

  return categories.map((item) => ({
    id: item.id,
    name: item.category,
    count: item.count,
  }));
};

// Get all categories (Admin)
export const getAllCategories = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 100);

  let isActive;

  if (query.status === "active") {
    isActive = true;
  } else if (query.status === "inactive") {
    isActive = false;
  }

  const result = await categoryRepository.findAllPaginated({
    search: query.search,
    isActive,
    sort: query.sort,
    page,
    limit,
  });

  const counts = await categoryRepository.productCounts(
    result.categories.map((item) => item.name)
  );

  return {
    categories: result.categories.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      isActive: Boolean(item.isActive),
      productCount: counts[item.name] || 0,
      createdAt: item.createdAt,
    })),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

// Get category statistics (Admin)
export const getCategoryStats = async () => {
  const total = await categoryRepository.countCategories();
  const active = await categoryRepository.countCategories({ isActive: true });
  const inactive = await categoryRepository.countCategories({ isActive: false });

  return { total, active, inactive };
};

// Get category by ID
export const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const productCount = await categoryRepository.countProducts(category.name);

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    isActive: Boolean(category.isActive),
    productCount,
    createdAt: category.createdAt,
  };
};

// Create category (Admin)
export const createCategory = async (data) => {
  const name = String(data.name || "").trim();

  if (!name) {
    throw new AppError("Name is required", 400);
  }

  if (name.length > 60) {
    throw new AppError("Name must be 60 characters or less", 400);
  }

  if (name.toLowerCase() === "other") {
    throw new AppError('"Other" is a reserved name', 400);
  }

  const existing = await categoryRepository.findByName(name);

  if (existing) {
    throw new AppError("Category already exists", 400);
  }

  const category = await categoryRepository.createCategory({
    name,
    description: data.description ? String(data.description).trim() : null,
    image: data.image ? String(data.image).trim() : null,
    isActive: data.isActive === undefined ? true : data.isActive,
  });

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    isActive: Boolean(category.isActive),
    productCount: 0,
    createdAt: category.createdAt,
  };
};

// Update category (Admin)
export const updateCategory = async (id, data) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const categoryData = {};

  if (data.name !== undefined) {
    const name = String(data.name).trim();

    if (!name) {
      throw new AppError("Name is required", 400);
    }

    if (name.length > 60) {
      throw new AppError("Name must be 60 characters or less", 400);
    }

    if (name.toLowerCase() === "other") {
      throw new AppError('"Other" is a reserved name', 400);
    }

    if (name !== category.name) {
      const existing = await categoryRepository.findByName(name);

      if (existing && existing.id !== category.id) {
        throw new AppError("Category already exists", 400);
      }
    }

    categoryData.name = name;
  }

  if (data.description !== undefined) {
    categoryData.description = data.description
      ? String(data.description).trim()
      : null;
  }

  if (data.image !== undefined) {
    categoryData.image = data.image ? String(data.image).trim() : null;
  }

  if (data.isActive !== undefined) {
    if (
      data.isActive !== true &&
      data.isActive !== false &&
      data.isActive !== "true" &&
      data.isActive !== "false"
    ) {
      throw new AppError("Invalid status", 400);
    }

    categoryData.isActive =
      data.isActive === true || data.isActive === "true";
  }

  await categoryRepository.updateCategory(category, categoryData);

  const productCount = await categoryRepository.countProducts(categoryData.name || category.name);

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    isActive: Boolean(category.isActive),
    productCount,
    createdAt: category.createdAt,
  };
};

// Delete category (Admin)
export const deleteCategory = async (id) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const productCount = await categoryRepository.countProducts(category.name);

  if (productCount > 0) {
    throw new AppError(
      `Cannot delete: ${productCount} product(s) use this category`,
      400
    );
  }

  await categoryRepository.deleteCategory(id);

  return { message: "Category deleted successfully" };
};

// Default export
export default {
  getCategoryOptions,
  getAllCategories,
  getCategoryStats,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
