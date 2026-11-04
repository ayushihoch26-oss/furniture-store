
import { Op, fn, col } from "sequelize";
import { Categories, Products } from "../models/index.js";

const SORTS = {
  latest: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  oldest: [
    ["createdAt", "ASC"],
    ["id", "ASC"],
  ],
  name_asc: [
    ["name", "ASC"],
    ["id", "ASC"],
  ],
  name_desc: [
    ["name", "DESC"],
    ["id", "ASC"],
  ],
};

// Create category
export const createCategory = async (data) => {
  return await Categories.create(data);
};

// Find category by ID
export const findById = async (id) => {
  return await Categories.findByPk(id);
};

// Find category by exact name
export const findByName = async (name) => {
  return await Categories.findOne({
    where: { name },
  });
};

// Update category
export const updateCategory = async (category, data) => {
  return await Categories.sequelize.transaction(async (transaction) => {
    const oldName = category.name;

    await category.update(data, { transaction });

    // Update product category if category name changes
    if (data.name && data.name !== oldName) {
      await Products.update(
        { category: data.name },
        {
          where: { category: oldName },
          transaction,
        }
      );
    }

    return category;
  });
};

// Delete category
export const deleteCategory = async (id) => {
  return await Categories.destroy({
    where: { id },
  });
};

// Search, filter, sort and pagination
export const findAllPaginated = async ({
  search,
  isActive,
  sort = "latest",
  page = 1,
  limit = 8,
} = {}) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 8, 1), 100);

  const where = {};

  // Search by category name or description
  if (search && String(search).trim()) {
    const keyword = String(search).trim();

    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } },
    ];
  }

  // Filter by active status
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Apply sorting
  const order = SORTS[sort] || SORTS.latest;

  const { count, rows } = await Categories.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order,
  });

  const totalPages = Math.max(Math.ceil(count / limit), 1);
  const currentPage = Math.min(page, totalPages);

  // If requested page exceeds total pages, fetch the correct page
  const categories =
    currentPage === page
      ? rows
      : await Categories.findAll({
          where,
          limit,
          offset: (currentPage - 1) * limit,
          order,
        });

  return {
    categories,
    total: count,
    page: currentPage,
    limit,
    totalPages,
  };
};

// Find all active categories
export const findAllActive = async () => {
  return await Categories.findAll({
    where: { isActive: true },
    order: [["name", "ASC"]],
  });
};

// Get active categories with product counts
export const activeWithCounts = async () => {
  const categories = await findAllActive();

  const counts = await productCounts(
    categories.map((category) => category.name)
  );

  return categories.map((category) => ({
    id: category.id,
    category: category.name,
    count: counts[category.name] || 0,
  }));
};

// Get product counts for categories
export const productCounts = async (names = []) => {
  if (!names.length) return {};

  const rows = await Products.findAll({
    attributes: [
      "category",
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      category: { [Op.in]: names },
    },
    group: ["category"],
    raw: true,
  });

  return rows.reduce((map, row) => {
    map[row.category] = Number(row.count);
    return map;
  }, {});
};

// Count products in a category
export const countProducts = async (name) => {
  return await Products.count({
    where: { category: name },
  });
};

// Count categories
export const countCategories = async (where = {}) => {
  return await Categories.count({ where });
};

export default {
  createCategory,
  findById,
  findByName,
  updateCategory,
  deleteCategory,
  findAllPaginated,
  findAllActive,
  activeWithCounts,
  productCounts,
  countProducts,
  countCategories,
};
