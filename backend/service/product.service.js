import { Readable } from "node:stream";
import productRepository, {
  LOW_STOCK_LIMIT,
} from "../repository/product.repository.js";
import cloudinary from "../config/cloudinary.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const STOCK_STATUSES = ["in_stock", "low_stock", "out_of_stock"];

// Admin product list always returns this many products per page
const ADMIN_PAGE_SIZE = 8;

const getStockStatus = (stock) => {
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_LIMIT) return "low_stock";
  return "in_stock";
};

// "a,b" or ["a","b"] -> ["a","b"]
const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// "" / null / "abc" -> null, otherwise the number
const toNumber = (value) => {
  if (value === "" || value == null) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toPage = (value) => Math.max(Number(value) || 1, 1);
const toLimit = (value, fallback) =>
  Math.min(Math.max(Number(value) || fallback, 1), 100);

// Shape sent to the frontend
const formatProduct = (product) => {
  const price = Number(product.price);
  const salePrice =
    product.salePrice == null ? null : Number(product.salePrice);
  const onSale = salePrice !== null && salePrice < price;

  return {
    id: product.id,
    productCode: product.productCode,
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    price,
    salePrice,
    finalPrice: onSale ? salePrice : price,
    onSale,
    isNew: Boolean(product.isNew),
    stock: product.stock,
    stockStatus: getStockStatus(product.stock),
    image: product.image,
    details: {
      material: product.material,
      size: product.size,
      category: product.category,
      shipping: product.shipping,
    },
    createdAt: product.createdAt,
  };
};

// Validate + clean the data. partial = true is used for updates.
const validateProduct = (data = {}, partial = false) => {
  const clean = {};

  for (const field of ["name", "category"]) {
    if (!partial || data[field] !== undefined) {
      const value = String(data[field] ?? "").trim();
      if (!value) throw new AppError(`${field} is required`, 400);
      clean[field] = value;
    }
  }

  if (!partial || data.price !== undefined) {
    const price = Number(data.price);
    if (
      data.price === "" ||
      data.price == null ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new AppError("Invalid price", 400);
    }
    clean.price = price;
  }

  if (data.salePrice !== undefined) {
    const salePrice = toNumber(data.salePrice);
    if (salePrice !== null && salePrice < 0) {
      throw new AppError("Invalid sale price", 400);
    }
    clean.salePrice = salePrice;
  }

  if (!partial || data.stock !== undefined) {
    const stock = Number(data.stock);
    if (
      data.stock === "" ||
      data.stock == null ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      throw new AppError("Stock must be a whole number, 0 or more", 400);
    }
    clean.stock = stock;
  }

  for (const field of [
    "description",
    "image",
    "material",
    "size",
    "shipping",
  ]) {
    if (data[field] !== undefined) clean[field] = data[field];
  }

  if (data.isNew !== undefined) {
    clean.isNew = data.isNew === true || data.isNew === "true";
  }

  return clean;
};

// Upload to Cloudinary when the image is not already hosted there
const saveImage = async (image) => {
  if (typeof image !== "string") return image;

  image = image.trim();

  if (
    !image ||
    image.startsWith("/assets/") ||
    image.includes("res.cloudinary.com")
  ) {
    return image;
  }

  if (image.startsWith("data:image/")) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "furniture/products",
    });
    return result.secure_url;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    const response = await fetch(image);

    if (!response.ok) {
      throw new AppError("Could not download product image", 400);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      throw new AppError("Please provide a valid image URL", 400);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 10 * 1024 * 1024) {
      throw new AppError("Image must be smaller than 10 MB", 400);
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "furniture/products" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      Readable.from(buffer).pipe(stream);
    });

    return result.secure_url;
  }

  return image;
};

const productService = {
  // ================= USER (shop) =================

  async shopList(query = {}) {
    const result = await productRepository.findAll({
      search: query.search,
      categories: toList(query.categories),
      minPrice: toNumber(query.minPrice),
      maxPrice: toNumber(query.maxPrice),
      onSale: query.onSale === true || query.onSale === "true",
      sort: query.sort,
      page: toPage(query.page),
      limit: toLimit(query.limit, 8),
    });

    return {
      products: result.products.map(formatProduct),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      showing: {
        from: result.total ? (result.page - 1) * result.limit + 1 : 0,
        to: Math.min(result.page * result.limit, result.total),
      },
    };
  },

  async filters() {
    const [categories, range] = await Promise.all([
      productRepository.categoryCounts(),
      productRepository.priceRange(),
    ]);

    return {
      categories: categories.map((item) => ({
        name: item.category,
        count: item.count,
      })),
      price: { min: range.min ?? 0, max: range.max ?? 0 },
    };
  },

  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    return formatProduct(product);
  },

  // ================= ADMIN =================

  async adminList(query = {}) {
    const status = query.stockStatus || query.tab;

    if (status && status !== "all" && !STOCK_STATUSES.includes(status)) {
      throw new AppError("Invalid stock status", 400);
    }

    const result = await productRepository.findAll({
      search: query.search,
      categories: toList(query.categories),
      minPrice: toNumber(query.minPrice),
      maxPrice: toNumber(query.maxPrice),
      stockStatus: status && status !== "all" ? status : undefined,
      sort: query.sort,
      page: toPage(query.page),
      limit: ADMIN_PAGE_SIZE, // fixed: always 8 per page
    });

    return {
      products: result.products.map(formatProduct),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  async stats() {
    const [total, inStock, lowStock, outOfStock] = await Promise.all([
      productRepository.count(),
      productRepository.countByStock("in_stock"),
      productRepository.countByStock("low_stock"),
      productRepository.countByStock("out_of_stock"),
    ]);

    return { total, inStock, lowStock, outOfStock };
  },

  async create(data) {
    const productData = validateProduct(data);

    if (
      productData.salePrice != null &&
      productData.salePrice > productData.price
    ) {
      throw new AppError("Sale price cannot exceed the regular price", 400);
    }

    if (productData.image !== undefined) {
      productData.image = await saveImage(productData.image);
    }

    const product = await productRepository.createWithCodes(productData);
    return formatProduct(product);
  },

  async update(id, data) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);

    const productData = validateProduct(data, true);

    // Compare against existing values when only one of them is sent
    const price = productData.price ?? Number(product.price);
    const salePrice =
      productData.salePrice !== undefined
        ? productData.salePrice
        : product.salePrice == null
          ? null
          : Number(product.salePrice);

    if (salePrice !== null && salePrice > price) {
      throw new AppError("Sale price cannot exceed the regular price", 400);
    }

    if (productData.image !== undefined) {
      productData.image = await saveImage(productData.image);
    }

    await productRepository.update(product, productData);
    return formatProduct(product);
  },

  async remove(id) {
    const deleted = await productRepository.delete(id);
    if (!deleted) throw new AppError("Product not found", 404);

    return { message: "Product deleted successfully" };
  },
};

export default productService;
