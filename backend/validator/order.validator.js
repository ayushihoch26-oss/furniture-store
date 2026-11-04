
const ORDER_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Paid", "Unpaid"];
const SHIPPING_METHODS = ["standard", "express"];
const PAYMENT_METHODS = ["card", "cod"];

const SORT_FIELDS = [
    "id",
    "orderId",
    "createdAt",
    "date",
    "total",
    "status",
    "paymentStatus",
    "customer"
];

// Common error response
function badRequest(res, message) {
    return res.status(400).json({
        success: false,
        message: message
    });
}

// 1. Validate Create Order
export function validateCreateOrder(req, res, next) {

    const items = req.body.items;
    const shippingMethod = req.body.shippingMethod || "standard";
    const paymentMethod = req.body.paymentMethod || "card";

    // Check order items
    if (!items || !Array.isArray(items) || items.length === 0) {
        return badRequest(res, "Order must have at least one item");
    }

    // Check shipping method
    if (!SHIPPING_METHODS.includes(shippingMethod)) {
        return badRequest(res, "Invalid shipping method");
    }

    // Check payment method
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return badRequest(res, "Invalid payment method");
    }

    // Check each item
    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        if (!item || !item.name || typeof item.name !== "string") {
            return badRequest(res, "Item name is required");
        }

        if (item.name.trim() === "") {
            return badRequest(res, "Item name cannot be empty");
        }

        const price = Number(item.price);
        const quantity = Number(item.quantity);

        if (isNaN(price) || price < 0 || !Number.isFinite(price)) {
            return badRequest(res, "Invalid item price");
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return badRequest(res, "Invalid item quantity");
        }
    }

    // Check card number
    if (paymentMethod === "card") {

        const cardNumber = req.body.cardNumber || req.body.cardLast4 || "";

        const digits = String(cardNumber).replace(/\D/g, "");

        if (digits.length < 4) {
            return badRequest(res, "A valid card number is required");
        }
    }
    
    next();
}


// 2. Validate Order List
export function validateOrderList(req, res, next) {
    const body = req.body || {};
    const page = body.page;
    const limit = body.limit;
    const status = body.status;
    const paymentStatus = body.paymentStatus;
    const sortBy = body.sortBy;
    const sortOrder = body.sortOrder;

    // Check page
    if (page !== undefined) {

        if (!Number.isInteger(Number(page)) || Number(page) < 1) {
            return badRequest(res, "Page must be a positive number");
        }
    }

    // Check limit
    if (limit !== undefined) {

        if (
            !Number.isInteger(Number(limit)) ||
            Number(limit) < 1 ||
            Number(limit) > 100
        ) {
            return badRequest(res, "Limit must be between 1 and 100");
        }
    }

    // Check order status
    if (status && !ORDER_STATUSES.includes(status)) {
        return badRequest(res, "Invalid order status filter");
    }

    // Check payment status
    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
        return badRequest(res, "Invalid payment status filter");
    }

    // Check sorting field
    if (sortBy && !SORT_FIELDS.includes(sortBy)) {
        return badRequest(res, "Invalid sort field");
    }

    // Check sorting order
    if (
        sortOrder &&
        sortOrder.toLowerCase() !== "asc" &&
        sortOrder.toLowerCase() !== "desc"
    ) {
        return badRequest(res, "Sort order must be asc or desc");
    }

    next();
}


// 3. Validate Order Update
export function validateOrderUpdate(req, res, next) {

    const status = req.body.status;
    const paymentStatus = req.body.paymentStatus;

    // Check if any field is provided
    if (status === undefined && paymentStatus === undefined) {
        return badRequest(res, "Provide an order status or payment status");
    }

    // Check order status
    if (
        status !== undefined &&
        !ORDER_STATUSES.includes(status)
    ) {
        return badRequest(res, "Invalid order status");
    }

    // Check payment status
    if (
        paymentStatus !== undefined &&
        !PAYMENT_STATUSES.includes(paymentStatus)
    ) {
        return badRequest(res, "Invalid payment status");
    }

    next();
}


// 4. Validate Order ID
export function validateOrderId(req, res, next) {

    const id = req.params.id;

    if (!/^\d+$/.test(id) || Number(id) < 1) {
        return badRequest(res, "Order id must be a positive number");
    }

    next();
}
