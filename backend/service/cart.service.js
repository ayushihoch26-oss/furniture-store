import cartRepository from "../repository/cart.repository.js";

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const STATUSES = ["active", "abandoned", "converted"];

// COMMON: Format cart data
const formatCart = (cart) => {
  const items = (cart.items || []).map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.product?.name || null,
    image: i.product?.image || null,
    price: Number(i.price),
    quantity: i.quantity,
    total: Number((Number(i.price) * i.quantity).toFixed(2)),
  }));

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);

  return {
    id: cart.id,
    cartCode: cart.cartCode,
    status: cart.status,
    createdAt: cart.createdAt,
    items,
    itemCount: items.length,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

const cartService = {
  // ================= USER =================

  // User: Get active cart or create a new cart
  async getMyCart(userId) {
    let cart = await cartRepository.findActiveByUser(userId);

    if (!cart) {
      await cartRepository.create({
        cartCode: "CRT" + Date.now().toString().slice(-7),
        userId,
      });

      cart = await cartRepository.findActiveByUser(userId);
    }

    return formatCart(cart);
  },

  // User: Add a product to the cart
  async addItem(userId, { productId, quantity = 1 }) {
    quantity = Number(quantity);

    if (!productId) throw new AppError("Product id is required", 400);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    const product = await cartRepository.findProductById(productId);

    if (!product) throw new AppError("Product not found", 404);

    const cart = await this.getMyCart(userId);
    const existing = await cartRepository.findItem(cart.id, productId);

    if (existing) {
      await cartRepository.updateItem(existing, {
        quantity: existing.quantity + quantity,
      });
    } else {
      await cartRepository.createItem({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });
    }

    return this.getMyCart(userId);
  },

  // User: Update cart item quantity
  async updateQuantity(userId, { itemId, quantity }) {
    quantity = Number(quantity);

    if (!itemId) throw new AppError("Item id is required", 400);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    const cart = await this.getMyCart(userId);
    const item = await cartRepository.findItemInCart(cart.id, itemId);

    if (!item) throw new AppError("Cart item not found", 404);

    await cartRepository.updateItem(item, { quantity });

    return this.getMyCart(userId);
  },

  // User: Remove a product from the cart
  async removeItem(userId, { itemId }) {
    if (!itemId) throw new AppError("Item id is required", 400);

    const cart = await this.getMyCart(userId);
    const item = await cartRepository.findItemInCart(cart.id, itemId);

    if (!item) throw new AppError("Cart item not found", 404);

    await cartRepository.deleteItem(item.id);

    return this.getMyCart(userId);
  },

  // User: Proceed to checkout and mark the cart as converted
  async checkout(userId) {
    const cart = await this.getMyCart(userId);

    if (cart.itemCount === 0) {
      throw new AppError("Cart is empty", 400);
    }

    await cartRepository.updateStatus(cart.id, "converted");

    return cart;
  },

  // ================= ADMIN =================

  // Admin: Get all carts with status filter and pagination
  async list({ status, page, limit }) {
    if (status && status !== "all" && !STATUSES.includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const result = await cartRepository.findAll({
      status,
      page: Math.max(Number(page) || 1, 1),
      limit: Math.min(Math.max(Number(limit) || 10, 1), 100),
    });

    return {
      ...result,
      carts: result.carts.map((c) => ({
        ...formatCart(c),
        userId: c.userId,
        customer: c.user
          ? `${c.user.firstName} ${c.user.lastName || ""}`.trim()
          : null,
      })),
    };
  },

  // Admin: Get total, active, abandoned and converted cart counts
  async stats() {
    const [total, active, abandoned, converted] = await Promise.all([
      cartRepository.count(),
      cartRepository.count({ status: "active" }),
      cartRepository.count({ status: "abandoned" }),
      cartRepository.count({ status: "converted" }),
    ]);

    return { total, active, abandoned, converted };
  },

  // Admin: Get one cart with its products
  async getById(id) {
    const cart = await cartRepository.findByIdFull(id);

    if (!cart) throw new AppError("Cart not found", 404);

    return formatCart(cart);
  },

  // Admin: Update cart status
  async updateStatus(id, status) {
    if (!STATUSES.includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const cart = await cartRepository.findByIdFull(id);

    if (!cart) throw new AppError("Cart not found", 404);

    await cartRepository.updateStatus(id, status);

    return this.getById(id);
  },

  // Admin: Delete a cart
  async remove(id) {
    const deleted = await cartRepository.delete(id);

    if (!deleted) throw new AppError("Cart not found", 404);
  },
};

export default cartService;
