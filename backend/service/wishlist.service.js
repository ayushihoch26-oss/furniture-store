import wishlistRepository from "../repository/wishlist.repository.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Make sure an id from the request is a positive whole number
const parseId = (value, label = "Product id") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(`${label} is required`, 400);
  }
  return id;
};

// Build the response the wishlist page needs ("2 items saved" + product cards).
// Entries whose product was deleted are skipped.
const formatWishlist = (rows) => {
  const items = rows
    .filter((w) => w.product)
    .map((w) => ({
      id: w.id,
      productId: w.productId,
      name: w.product.name,
      price: Number(w.product.price),
      image: w.product.image || null,
      // Optional product fields (null when the Products table doesn't have them)
      oldPrice: w.product.oldPrice != null ? Number(w.product.oldPrice) : null,
      salePrice:
        w.product.salePrice != null ? Number(w.product.salePrice) : null,
      badge: w.product.badge || null,
      addedAt: w.createdAt,
    }));

  return { items, total: items.length };
};

const wishlistService = {
  // ================= USER =================

  // Get my wishlist
  async getMyWishlist(userId) {
    const rows = await wishlistRepository.findByUser(userId);
    return formatWishlist(rows);
  },

  // Add product to wishlist (does nothing if it is already saved)
  async add(userId, { productId } = {}) {
    const id = parseId(productId);

    const product = await wishlistRepository.findProductById(id);
    if (!product) throw new AppError("Product not found", 404);

    const existing = await wishlistRepository.find(userId, id);
    if (!existing) {
      await wishlistRepository.create({ userId, productId: id });
    }

    return wishlistService.getMyWishlist(userId);
  },

  // Heart icon: add if missing, remove if already saved
  async toggle(userId, { productId } = {}) {
    const id = parseId(productId);

    const existing = await wishlistRepository.find(userId, id);

    if (existing) {
      await wishlistRepository.delete(userId, id);
    } else {
      const product = await wishlistRepository.findProductById(id);
      if (!product) throw new AppError("Product not found", 404);
      await wishlistRepository.create({ userId, productId: id });
    }

    return {
      saved: !existing,
      ...(await wishlistService.getMyWishlist(userId)),
    };
  },

  // X button on a product card
  async remove(userId, { productId } = {}) {
    const id = parseId(productId);

    const deleted = await wishlistRepository.delete(userId, id);
    if (!deleted) throw new AppError("Product not in wishlist", 404);

    return wishlistService.getMyWishlist(userId);
  },

  // "Clear all" button
  async clear(userId) {
    await wishlistRepository.clear(userId);
    return { items: [], total: 0 };
  },

  // Number shown on the heart icon in the header
  async count(userId) {
    return { total: await wishlistRepository.count(userId) };
  },

  // ================= ADMIN =================

  // All wishlist entries of all customers (with pagination)
  async list({ userId, productId, page, limit } = {}) {
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const result = await wishlistRepository.findAll({
      userId: userId ? Number(userId) : undefined,
      productId: productId ? Number(productId) : undefined,
      page: currentPage,
      limit: pageSize,
    });

    return {
      wishlists: result.wishlists.map((w) => ({
        id: w.id,
        userId: w.userId,
        customer: w.User
          ? `${w.User.firstName} ${w.User.lastName || ""}`.trim()
          : null,
        email: w.User?.email || null,
        email: w.user?.email || null,
        productId: w.productId,
        productName: w.product?.name || null,
        price: w.product ? Number(w.product.price) : null,
        image: w.product?.image || null,
        addedAt: w.createdAt,
      })),
      total: result.total,
      page: currentPage,
      limit: pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    };
  },

  // Stat cards + top 5 most wishlisted products
  async stats() {
    const [totalItems, totalUsers, totalProducts, top] = await Promise.all([
      wishlistRepository.countAll(),
      wishlistRepository.countUsers(),
      wishlistRepository.countProducts(),
      wishlistRepository.topProductIds(5),
    ]);

    const products = top.length
      ? await wishlistRepository.findProductsByIds(top.map((t) => t.productId))
      : [];

    const topProducts = top.map((t) => {
      const p = products.find((x) => x.id === t.productId);
      return {
        productId: t.productId,
        name: p?.name || null,
        image: p?.image || null,
        count: Number(t.count),
      };
    });

    return { totalItems, totalUsers, totalProducts, topProducts };
  },

  // One customer's wishlist
  async getByUser(userId) {
    return wishlistService.getMyWishlist(parseId(userId, "User id"));
  },

  // Delete one wishlist entry by its id
  async removeById(id) {
    const deleted = await wishlistRepository.deleteById(
      parseId(id, "Wishlist id"),
    );
    if (!deleted) throw new AppError("Wishlist item not found", 404);
  },

  // Clear a customer's whole wishlist
  async clearByUser(userId) {
    await wishlistRepository.clear(parseId(userId, "User id"));
  },
};

export default wishlistService;
