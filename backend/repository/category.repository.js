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

const resolveSort = (sort) => (SORTS[sort] ? sort : "latest");

const buildWhere = ({ search, isActive }) => {
  const where = {};

  const keyword = String(search || "").trim();
  if (keyword) {
    const like = { [Op.like]: `%${keyword}%` };
    where[Op.or] = [{ name: like }, { description: like }];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return where;
};

const categoryRepository = {
  // Create category
  create(data) {
    return Categories.create(data);
  },

  // Find by ID
  findById(id) {
    return Categories.findByPk(id);
  },

  // Find by exact name (used for duplicate check)
  findByName(name) {
    return Categories.findOne({ where: { name } });
  },

  // Update category (also renames the category on products, in one transaction)
  async update(category, data) {
    return Categories.sequelize.transaction(async (transaction) => {
      const oldName = category.name;

      await category.update(data, { transaction });

      if (data.name && data.name !== oldName) {
        await Products.update(
          { category: data.name },
          { where: { category: oldName }, transaction },
        );
      }

      return category;
    });
  },

  // Delete category
  delete(id) {
    return Categories.destroy({ where: { id } });
  },

  // Search, filter, sort and paginate
  async findAll({ sort = "latest", page = 1, limit = 8, ...filters } = {}) {
    limit = Math.min(Math.max(Number(limit) || 8, 1), 100);

    const where = buildWhere(filters);
    const total = await Categories.count({ where });

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const requestedPage = Math.max(Number(page) || 1, 1);
    const currentPage = Math.min(requestedPage, totalPages);

    const categories = await Categories.findAll({
      where,
      order: SORTS[resolveSort(sort)],
      limit,
      offset: (currentPage - 1) * limit,
    });

    return { categories, total, page: currentPage, limit, totalPages };
  },

  // All active categories (for dropdowns, no pagination)
  findAllActive() {
    return Categories.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
  },

  // Active categories with their product counts (for the shop navbar / sidebar)
  async activeWithCounts() {
    const categories = await Categories.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });

    const counts = await categoryRepository.productCounts(
      categories.map((category) => category.name),
    );

    return categories.map((category) => ({
      category: category.name,
      count: counts[category.name] || 0,
    }));
  },

  // { "Sofa": 12, "Chair": 5 } for the given category names
  async productCounts(names = []) {
    if (!names.length) return {};

    const rows = await Products.findAll({
      attributes: ["category", [fn("COUNT", col("id")), "count"]],
      where: { category: { [Op.in]: names } },
      group: ["category"],
      raw: true,
    });

    return rows.reduce((map, row) => {
      map[row.category] = Number(row.count);
      return map;
    }, {});
  },

  // Number of products using a category name
  countProducts(name) {
    return Products.count({ where: { category: name } });
  },

  // Count categories
  count(where = {}) {
    return Categories.count({ where });
  },
};

export default categoryRepository;