import productRepository from "../repository/product.repository.js";
import {
  getPagination,
  validateProductData,
  validateProductId,
  validateShopParams,
} from "../validator/product.validator.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Get product by ID
const getById = async (id) => {
  const productId = validateProductId(id);
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

// ---------------- ADMIN SERVICES ----------------

// Create product
const create = async (data) => {
  return productRepository.create(validateProductData(data));
};

// Update product
const update = async (id, data) => {
  const productId = validateProductId(id);
  const productData = validateProductData(data, true);
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return productRepository.update(productId, productData);
};

// Delete product
const remove = async (id) => {
  const productId = validateProductId(id);
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return productRepository.destroy(productId);
};

// Admin product list
const adminList = async (params = {}) => {
  const { page, limit } = getPagination(params);

  const result = await productRepository.findPaginated(limit, page);

  return result;
};

// Product statistics
export const stats = async () => {
  return productRepository.getStats();
};

// ---------------- USER / SHOP SERVICES ----------------

// Shop product listing
export const shopList = async (params = {}) => {
  const filters = validateShopParams(params);
  const result = await productRepository.findAll({
    ...filters,
  });

  return result;
};

// Sidebar filters
export const filters = async () => {
  return productRepository.filter();
};

// Product details
export const getProductDetails = async (id) => {
  return getById(id);
};

export default {
  // Admin
  create,
  update,
  remove,
  adminList,
  stats,

  // User
  shopList,
  filters,
  getById,
  getProductDetails,
};
