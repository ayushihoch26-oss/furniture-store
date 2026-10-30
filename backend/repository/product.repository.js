import { Op, fn, col, where as sqlWhere } from "sequelize";
import { Products } from "../models/index.js";

export const LOW_STOCK_LIMIT = 8;

const OTHER = "Other";

// Stock filters
const stockCondition = (status) => {
  switch (status) {
    case "out_of_stock":
      return { [Op.lte]: 0 };

    case "low_stock":
      return { [Op.gt]: 0, [Op.lte]: LOW_STOCK_LIMIT };

    case "in_stock":
      return { [Op.gt]: LOW_STOCK_LIMIT };

    default:
      return null;
  }
};

// Sorting options
const SORTS = {
  latest: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  oldest: [
    ["createdAt", "ASC"],
    ["id", "ASC"],
  ],
  price_asc: [
    ["price", "ASC"],
    ["id", "ASC"],
  ],
  price_desc: [
    ["price", "DESC"],
    ["id", "ASC"],
  ],
  name_asc: [
    ["name", "ASC"],
    ["id", "ASC"],
  ],
  stock_asc: [
    ["stock", "ASC"],
    ["id", "ASC"],
  ],
  stock_desc: [
    ["stock", "DESC"],
    ["id", "ASC"],
  ],
};

const SORT_ALIASES = {
  low: "price_asc",
  high: "price_desc",
  name: "name_asc",
  newest: "latest",
};

const resolveSort = (sort) => {
  const key = SORT_ALIASES[sort] || sort;
  return SORTS[key] ? key : "latest";
};

// Search and filter products
const buildWhere = ({
  search,
  categories,
  minPrice,
  maxPrice,
  onSale,
  stockStatus,
}) => {
  const where = {};
  const conditions = [];

  const keyword = String(search || "").trim();

  if (keyword) {
    const like = { [Op.like]: `%${keyword}%` };

    where[Op.or] = [
      { name: like },
      { productCode: like },
      { description: like },
    ];
  }

  if (categories?.length) {
    const selectedCategories = categories.filter(
      (category) => category !== OTHER,
    );

    const categoryConditions = [];

    if (selectedCategories.length) {
      categoryConditions.push({
        category: { [Op.in]: selectedCategories },
      });
    }

    if (categories.includes(OTHER)) {
      categoryConditions.push({ category: null }, { category: "" });
    }

    conditions.push({ [Op.or]: categoryConditions });
  }

  if (minPrice != null) {
    where.price = {
      ...(where.price || {}),
      [Op.gte]: minPrice,
    };
  }

  if (maxPrice != null) {
    where.price = {
      ...(where.price || {}),
      [Op.lte]: maxPrice,
    };
  }

  if (onSale) {
    conditions.push(sqlWhere(col("salePrice"), Op.lt, col("price")));
  }

  const stock = stockCondition(stockStatus);

  if (stock) {
    where.stock = stock;
  }

  if (conditions.length) {
    where[Op.and] = conditions;
  }

  return where;
};

const productRepository = {
  // Create product with product code and SKU
  async createWithCodes(data) {
    return Products.sequelize.transaction(async (transaction) => {
      const product = await Products.create(data, { transaction });

      await product.update(
        {
          productCode: `PRD${String(product.id).padStart(4, "0")}`,
          sku: `SKU-${String(product.id).padStart(5, "0")}`,
        },
        { transaction },
      );

      return product;
    });
  },

  // Find product by ID
  findById(id) {
    return Products.findByPk(id);
  },

  // Update product
  update(product, data) {
    return product.update(data);
  },

  // Delete product
  delete(id) {
    return Products.destroy({ where: { id } });
  },

  // Search, filter, sort and paginate products
  async findAll({ sort = "latest", page = 1, limit = 8, ...filters } = {}) {
    limit = Math.min(Math.max(Number(limit) || 8, 1), 100);

    const sortKey = resolveSort(sort);
    const where = buildWhere(filters);

    const total = await Products.count({ where });

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const requestedPage = Math.max(Number(page) || 1, 1);
    const currentPage = Math.min(requestedPage, totalPages);

    const products = await Products.findAll({
      where,
      order: SORTS[sortKey],
      limit,
      offset: (currentPage - 1) * limit,
    });

    console.log(
      `[products] page ${currentPage}/${totalPages} | ` +
        `${products.length} rows | total ${total} | ` +
        `limit ${limit} | sort ${sortKey}`,
      requestedPage !== currentPage ? `(page ${requestedPage} clamped)` : "",
    );

    return {
      products,
      total,
      page: currentPage,
      limit,
      totalPages,
    };
  },

  // Count products
  count(where = {}) {
    return Products.count({ where });
  },

  // Count products by stock status
  countByStock(status) {
    const stock = stockCondition(status);

    return Products.count({
      where: stock ? { stock } : {},
    });
  },

  // Get product count for each category
  async categoryCounts() {
    const rows = await Products.findAll({
      attributes: ["category", [fn("COUNT", col("id")), "count"]],
      group: ["category"],
      raw: true,
    });

    const counts = new Map();

    rows.forEach((row) => {
      const category = row.category || OTHER;

      counts.set(category, (counts.get(category) || 0) + Number(row.count));
    });

    return [...counts.entries()].map(([category, count]) => ({
      category,
      count,
    }));
  },

  // Get minimum and maximum product prices
  async priceRange() {
    const row = await Products.findOne({
      attributes: [
        [fn("MIN", col("price")), "min"],
        [fn("MAX", col("price")), "max"],
      ],
      raw: true,
    });

    return {
      min: row?.min != null ? Number(row.min) : null,
      max: row?.max != null ? Number(row.max) : null,
    };
  },
};

export default productRepository;
