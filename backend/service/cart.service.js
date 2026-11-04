
import cartRepository from "../repository/cart.repository.js";

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Cart quantities must be whole numbers from 1 to 10.
function normalizeQuantity(value) {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw createError("Quantity must be a whole number from 1 to 10", 400);
  }

  return quantity;
}

// Find the user's active cart, or create one.
async function getActiveCart(userId) {
  let cart = await cartRepository.findActiveByUser(userId);

  if (!cart) {
    cart = await cartRepository.create({
      userId: userId,
      cartCode: `CART-${Date.now()}`,
      status: "active",
    });
  }

  return cart;
}

async function getCartItem(userId, itemId) {
  if (!userId || !itemId) {
    throw createError("Cart item id is required", 400);
  }

  const cart = await cartRepository.findActiveByUser(userId);
  if (!cart) {
    throw createError("Cart not found", 404);
  }

  const item = await cartRepository.findItemInCart(cart.id, itemId);
  if (!item) {
    throw createError("Cart item not found", 404);
  }

  return { cart, item };
}

// Get the user's active cart.
async function getMyCart(userId) {
  if (!userId) {
    throw createError("User id is required", 400);
  }

  return cartRepository.findActiveByUser(userId);
}

// Add a product to the user's cart.
async function addItem(userId, data = {}) {
  const productId = data.productId || data.menuId;
  let quantity = data.quantity;

  if (quantity === undefined) {
    quantity = 1;
  }

  if (!userId || !productId) {
    throw createError("User id and product id are required", 400);
  }

  quantity = normalizeQuantity(quantity);

  const product = await cartRepository.findProductById(productId);
  if (!product) {
    throw createError("Product not found", 404);
  }

  const stock = Number(product.stock);
  if (Number.isFinite(stock) && quantity > stock) {
    throw createError("Not enough stock", 400);
  }

  const cart = await getActiveCart(userId);
  const existingItem = await cartRepository.findItem(cart.id, productId);

  if (existingItem) {
    const newQuantity = normalizeQuantity(
      Number(existingItem.quantity) + quantity,
    );

    if (Number.isFinite(stock) && newQuantity > stock) {
      throw createError("Not enough stock", 400);
    }

    await cartRepository.updateItem(existingItem, {
      quantity: newQuantity,
      price: Number(product.price),
    });
  } else {
    await cartRepository.createItem({
      cartId: cart.id,
      productId: productId,
      quantity: quantity,
      price: Number(product.price),
    });
  }

  return cartRepository.findByIdFull(cart.id);
}

// Change a cart item's quantity.
async function updateQuantity(userId, data = {}) {
  const itemId = data.itemId;
  const quantity = normalizeQuantity(data.quantity);
  const { cart, item } = await getCartItem(userId, itemId);

  const product = await cartRepository.findProductById(item.productId);
  if (!product) {
    throw createError("Product not found", 404);
  }

  if (quantity > Number(product.stock)) {
    throw createError("Not enough stock", 400);
  }

  await cartRepository.updateItem(item, {
    quantity: quantity,
    price: Number(product.price),
  });

  return cartRepository.findByIdFull(cart.id);
}

// Remove an item from the user's active cart.
async function removeItem(userId, data = {}) {
  const itemId = data.itemId;
  const { cart } = await getCartItem(userId, itemId);

  await cartRepository.deleteItem(itemId);
  return cartRepository.findByIdFull(cart.id);
}

// Mark a non-empty cart as checked out.
async function checkout(userId) {
  const cart = await cartRepository.findActiveByUser(userId);

  if (!cart || cart.items.length === 0) {
    throw createError("Your cart is empty", 400);
  }

  await cartRepository.updateStatus(cart.id, "converted");
  return cartRepository.findByIdFull(cart.id);
}

// Get the admin cart list.
async function list(options = {}) {
  return cartRepository.findAll(options);
}

// Get counts for each cart status.
async function stats() {
  const total = await cartRepository.count();
  const active = await cartRepository.count({ status: "active" });
  const abandoned = await cartRepository.count({ status: "abandoned" });
  const converted = await cartRepository.count({ status: "converted" });

  return { total: total, active: active, abandoned: abandoned, converted: converted };
}

// Find one cart for the admin page.
async function getById(id) {
  const cart = await cartRepository.findByIdFull(id);

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  return cart;
}

// Change a cart's status.
async function updateStatus(id, status) {
  const validStatuses = ["active", "abandoned", "converted"];

  if (!validStatuses.includes(status)) {
    throw createError("Invalid cart status", 400);
  }

  await getById(id);
  await cartRepository.updateStatus(id, status);
  return getById(id);
}

// Delete one cart.
async function remove(id) {
  await getById(id);
  await cartRepository.delete(id);
  return { id: id };
}

const cartService = {
  getMyCart: getMyCart,
  addItem: addItem,
  updateQuantity: updateQuantity,
  removeItem: removeItem,
  checkout: checkout,
  list: list,
  stats: stats,
  getById: getById,
  updateStatus: updateStatus,
  remove: remove,
};

export default cartService;
