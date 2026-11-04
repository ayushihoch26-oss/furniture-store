
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

// Get all wishlists (Admin) in the flat shape expected by the admin table.
export const getAllWishlists = async () => {
  const wishlists = await wishlistRepository.getAllWishlists();

  return wishlists.map((wishlist) => ({
    id: wishlist.id,
    userId: wishlist.userId,
    customer: wishlist.user
      ? `${wishlist.user.firstName} ${wishlist.user.lastName || ""}`.trim()
      : null,
    email: wishlist.user?.email || null,
    productId: wishlist.productId,
    productName: wishlist.product?.name || null,
    category: wishlist.product?.category || null,
    price: wishlist.product ? Number(wishlist.product.price) : null,
    image: wishlist.product?.image || null,
    addedAt: wishlist.createdAt,
  }));
};

// Add product to wishlist (User)
export const addWishlist = async (userId, productId) => {
  const wishlists = await wishlistRepository.findByUserId(userId);

  const exists = wishlists.some(
    (item) => Number(item.productId) === Number(productId)
  );

  if (exists) {
    throw new AppError("Product already exists in wishlist", 400);
  }

  return await wishlistRepository.createWishlist({
    userId,
    productId
  });
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
    productName.trim()
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
    endDate
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
}
