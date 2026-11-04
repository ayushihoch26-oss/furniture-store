const CART_STATUSES = ["active", "abandoned", "converted"];
const SORT_FIELDS = ["createdAt", "status", "cartCode", "customer", "total"];

function badRequest(res, message) {
	return res.status(400).json({ success: false, message });
}

function isPositiveInteger(value) {
	return Number.isInteger(Number(value)) && Number(value) > 0;
}

export function validateAddCartItem(req, res, next) {
	const { productId, menuId, quantity = 1 } = req.body || {};

	if (!isPositiveInteger(productId || menuId)) {
		return badRequest(res, "A valid product id is required");
	}

	if (
		!Number.isInteger(Number(quantity)) ||
		Number(quantity) < 1 ||
		Number(quantity) > 10
	) {
		return badRequest(res, "Quantity must be a whole number from 1 to 10");
	}

	return next();
}

export function validateUpdateCartItem(req, res, next) {
	const { itemId, quantity } = req.body || {};

	if (!isPositiveInteger(itemId)) {
		return badRequest(res, "A valid cart item id is required");
	}

	if (
		!Number.isInteger(Number(quantity)) ||
		Number(quantity) < 1 ||
		Number(quantity) > 10
	) {
		return badRequest(res, "Quantity must be a whole number from 1 to 10");
	}

	return next();
}

export function validateRemoveCartItem(req, res, next) {
	if (!isPositiveInteger(req.body?.itemId)) {
		return badRequest(res, "A valid cart item id is required");
	}

	return next();
}

export function validateCartList(req, res, next) {
	const options = { ...(req.query || {}), ...(req.body || {}) };
	const {
		page,
		limit,
		status,
		sortBy,
		sortOrder,
		minItems,
		customerId,
		userId,
		fromDate,
		startDate,
		toDate,
		endDate,
	} = options;

	if (page !== undefined && !isPositiveInteger(page)) {
		return badRequest(res, "Page must be a positive number");
	}

	if (limit !== undefined && (!isPositiveInteger(limit) || Number(limit) > 100)) {
		return badRequest(res, "Limit must be between 1 and 100");
	}

	if (status && status !== "all" && !CART_STATUSES.includes(status)) {
		return badRequest(res, "Invalid cart status filter");
	}

	if (sortBy && !SORT_FIELDS.includes(sortBy)) {
		return badRequest(res, "Invalid cart sort field");
	}

	if (sortOrder && !["asc", "desc"].includes(String(sortOrder).toLowerCase())) {
		return badRequest(res, "Sort order must be asc or desc");
	}

	if (
		minItems !== undefined &&
		(!Number.isInteger(Number(minItems)) || Number(minItems) < 0)
	) {
		return badRequest(res, "Minimum items must be zero or a positive whole number");
	}

	const filterCustomerId = customerId || userId;
	if (filterCustomerId !== undefined && !isPositiveInteger(filterCustomerId)) {
		return badRequest(res, "Customer id must be a positive number");
	}

	for (const date of [fromDate, startDate, toDate, endDate]) {
		if (date && Number.isNaN(new Date(date).getTime())) {
			return badRequest(res, "Date filters must be valid dates");
		}
	}

	return next();
}

export function validateCartId(req, res, next) {
	if (!isPositiveInteger(req.params.id)) {
		return badRequest(res, "Cart id must be a positive number");
	}

	return next();
}

export function validateCartStatus(req, res, next) {
	if (!CART_STATUSES.includes(req.body?.status)) {
		return badRequest(res, "Invalid cart status");
	}

	return next();
}
