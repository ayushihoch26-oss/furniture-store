function badRequest(res, message) {
  return res.status(400).json({ success: false, message: message });
}

function isPositiveInteger(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isInteger(Number(value)) &&
    Number(value) > 0
  );
}

export function validateWishlistProduct(req, res, next) {
  if (!isPositiveInteger(req.body?.productId)) {
    return badRequest(res, "A valid product id is required");
  }

  return next();
}

export function validateWishlistList(req, res, next) {
  const options = { ...(req.query || {}), ...(req.body || {}) };
  const { page, limit, userId, productId } = options;

  if (page !== undefined && !isPositiveInteger(page)) {
    return badRequest(res, "Page must be a positive number");
  }

  if (
    limit !== undefined &&
    (!isPositiveInteger(limit) || Number(limit) > 100)
  ) {
    return badRequest(res, "Limit must be between 1 and 100");
  }

  if (userId !== undefined && !isPositiveInteger(userId)) {
    return badRequest(res, "User id must be a positive number");
  }

  if (productId !== undefined && !isPositiveInteger(productId)) {
    return badRequest(res, "Product id must be a positive number");
  }

  return next();
}

export function validateWishlistUserId(req, res, next) {
  if (!isPositiveInteger(req.params.userId)) {
    return badRequest(res, "User id must be a positive number");
  }

  return next();
}

export function validateWishlistId(req, res, next) {
  if (!isPositiveInteger(req.params.id)) {
    return badRequest(res, "Wishlist id must be a positive number");
  }

  return next();
}