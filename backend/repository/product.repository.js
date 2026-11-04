import { Products } from "../models/index.js";
import { Op, literal, where as sequelizeWhere } from "sequelize";

// Create product with product code and SKU
export const create = async (data) => {
  return Products.sequelize.transaction(async (transaction) => {

    // create product
    const product = await Products.create(data, { transaction });

    // generate product code and SKU
    const productCode = `PROD-${product.id.toString().padStart(4, "0")}`;
    const sku = `SKU-${product.id.toString().padStart(5, "0")}`;

    return product.update({ productCode, sku }, { transaction });

  });
}

// update product by id 
export const update = async (id,updateData) => {
  const product = await Products.findByPk(id);
  if (!product) {
    throw new Error("Product not found");
  }
  await product.update(updateData);
  return product;
}

// delete product by id
export const destroy = async (id) => {
  const product = await Products.findByPk(id);
  if (!product) {
    throw new Error("Product not found");
  }
  await product.destroy();
  return product;
}

// get product by id
export const findById = async (id) => {
  return Products.findByPk(id);
}

// get stats for products
export const getStats = async () => {
  const [total, inStock, lowStock, outOfStock] =
    await Promise.all([
      Products.count(),

      Products.count({
        where: { stock: { [Op.gt]: 8 } },
      }),

      Products.count({
        where: {
          stock: {
            [Op.gt]: 0,
            [Op.lte]: 8,
          },
        },
      }),

      Products.count({
        where: { stock: { [Op.lte]: 0 } },
      }),
    ]);
  return { total, inStock, lowStock, outOfStock };
};

// get all product 
export const findAll = async () => {
  return Products.findAll();
};

// get product with pagination
export const findPaginated = async(limit=8,page=1) =>{
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 8, 1), 100);

  const offset = (page - 1) * limit;
  const {count, rows} = await Products.findAndCountAll({
    limit,
    offset,
    order: [["id", "DESC"]],
  });

  return {
    products: rows,
    total: count, 
    page,
    limit,
    totalPages: Math.max(Math.ceil(count / limit), 1),
  };
}

// get by search 
export const search = async (keyword) => {
  const value = String(keyword || "").trim();

  if (!value) return [];

  return Products.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${value}%` } },
        { productCode: { [Op.like]: `%${value}%` } },
        { sku: { [Op.like]: `%${value}%` } },
        { category: { [Op.like]: `%${value}%` } },
      ],
    },
  });
};

// get product apply filter 
export const filter = async (filters = {}) => {
  const where = {};

  if (filters.category?.length) {
    where.category = {
      [Op.in]: filters.category,
    };
  }

  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};

    if (filters.fromDate) {
      where.createdAt[Op.gte] = new Date(filters.fromDate);
    }

    if (filters.toDate) {
      const endDate = new Date(filters.toDate);
      endDate.setDate(endDate.getDate() + 1);

      where.createdAt[Op.lt] = endDate;
    }
  }

  return Products.findAll({ where });
};

// price sorting

export const sortByPrice = async(order="asc") => {
  const direction = order.toLowerCase() === "asc" ? "ASC" : "DESC";
  return Products.findAll({
    order: [["price", direction]],
  });
}

export default {
  create,
  update,
  destroy,
  findById,
  findAll,
  findPaginated,
  search,
  filter,
  sortByPrice,
  getStats,
};
