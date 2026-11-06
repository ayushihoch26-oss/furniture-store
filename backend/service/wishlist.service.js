import * as wishlistRepository from "../repository/wishlist.repository.js";

// Custom error
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Find wishlist by ID
export const getWishlistById = async (id) => {
  const wishlist = await wishlistRepository.findById(id);

  if (!wishlist) {
    throw new AppError("Wishlist not found", 404);
  }

  return wishlist;
};

// Get user's wishlist
export const getWishlistByUserId = async (userId) => {
  return await wishlistRepository.findByUserId(userId);
};

function formatWishlistItem(item) {
  const product = item.product;

  return {
    id: product?.id ?? item.productId,
    wishlistId: item.id,
    productId: item.productId,
    name: product?.name ?? null,
    price: product ? Number(product.price) : null,
    image: product?.image ?? null,
    salePrice: product?.salePrice == null ? null : Number(product.salePrice),
    addedAt: item.createdAt,
  };
}

function formatAdminWishlist(item) {
  return {
    id: item.id,
    userId: item.userId,
    customer: item.user
      ? `${item.user.firstName} ${item.user.lastName || ""}`.trim()
      : null,
    email: item.user?.email || null,
    productId: item.productId,
    productName: item.product?.name || null,
    category: item.product?.category || null,
    price: item.product ? Number(item.product.price) : null,
    image: item.product?.image || null,
    addedAt: item.createdAt,
  };
}

export const getMyWishlist = async (userId) => {
  const wishlists = await wishlistRepository.findByUserId(userId);
  const items = wishlists.map(formatWishlistItem);

  return { items, total: items.length };
};

// Get all wishlists (Admin) in the flat shape expected by the admin table.
export const getAllWishlists = async (options = {}) => {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || 8, 1), 100);
  const result = await wishlistRepository.findAllPaginated(limit, page, {
    userId: options.userId === undefined ? undefined : Number(options.userId),
    productId:
      options.productId === undefined ? undefined : Number(options.productId),
  });

  return {
    ...result,
    wishlists: result.wishlists.map(formatAdminWishlist),
  };
};

// Add product to wishlist (User)
export const addWishlist = async (userId, data = {}) => {
  const productId = data && typeof data === "object" ? data.productId : data;
  const product = await wishlistRepository.findProductById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const existing = await wishlistRepository.findByUserAndProduct(
    userId,
    productId,
  );
  if (existing) {
    throw new AppError("Product already exists in wishlist", 400);
  }

  await wishlistRepository.createWishlist({ userId, productId });
  return getMyWishlist(userId);
};

export const toggleWishlist = async (userId, data = {}) => {
  const productId = data.productId;
  const existing = await wishlistRepository.findByUserAndProduct(
    userId,
    productId,
  );

  if (existing) {
    await wishlistRepository.deleteWishlist(existing.id);
  } else {
    const product = await wishlistRepository.findProductById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    await wishlistRepository.createWishlist({ userId, productId });
  }

  return getMyWishlist(userId);
};

export const removeWishlistItem = async (userId, data = {}) => {
  await wishlistRepository.deleteByUserAndProduct(userId, data.productId);
  return getMyWishlist(userId);
};

export const clearWishlist = async (userId) => {
  const removedCount = await wishlistRepository.clearByUser(userId);
  return { removedCount };
};

export const getWishlistCount = async (userId) => {
  return { total: await wishlistRepository.countByUser(userId) };
};

export const getWishlistStats = async () => {
  return wishlistRepository.getWishlistStats();
};

export const getByUser = async (userId) => {
  const wishlists = await wishlistRepository.findByUserId(userId);
  return wishlists.map(formatWishlistItem);
};

export const removeWishlistById = async (id) => {
  const wishlist = await wishlistRepository.findById(id);
  if (!wishlist) {
    throw new AppError("Wishlist not found", 404);
  }

  await wishlistRepository.deleteWishlist(id);
};

export const clearWishlistByUser = async (userId) => {
  return wishlistRepository.clearByUser(userId);
};

// Delete wishlist (Admin)
export const deleteWishlist = async (id) => {
  return await wishlistRepository.deleteWishlist(id);
};

// Search wishlist by product name (Admin)
export const searchWishlist = async (productName) => {
  if (!productName || !productName.trim()) {
    throw new AppError("Product name is required", 400);
  }

  return await wishlistRepository.searchWishlistByProductName(
    productName.trim(),
  );
};

// Pagination (Admin)
export const getWishlistPaginated = async (limit = 8, page = 1) => {
  return await wishlistRepository.findAllPaginated(limit, page);
};

// Filter by date (Admin)
export const getWishlistByDate = async (startDate, endDate) => {
  return await wishlistRepository.filterByDate({
    startDate,
    endDate,
  });
};

// Sort by product price (Admin)
export const sortWishlistByPrice = async (order = "asc") => {
  return await wishlistRepository.sortByPrice(order);
};

export default {
  sortWishlistByPrice,
  getAllWishlists,
  getWishlistByDate,
  getWishlistById,
  getWishlistByUserId,
  getWishlistPaginated,
  addWishlist,
  searchWishlist,
  getMyWishlist,
  add: addWishlist,
  toggle: toggleWishlist,
  remove: removeWishlistItem,
  clear: clearWishlist,
  count: getWishlistCount,
  stats: getWishlistStats,
  getByUser,
  removeById: removeWishlistById,
  clearByUser: clearWishlistByUser,
};
