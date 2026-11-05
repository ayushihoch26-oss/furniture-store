const SORT_FIELDS = ["id", "name", "total", "payment", "date"];
const PAYMENT_METHODS = ["card", "cod"];

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function isNumericValue(value) {
  return (
    (typeof value === "number" ||
      (typeof value === "string" && value.trim() !== "")) &&
    Number.isFinite(Number(value))
  );
}

function isPositiveInteger(value) {
  return isNumericValue(value) && Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateInvoiceOrderId(req, res, next) {
  if (!isPositiveInteger(req.params.orderId)) {
    return badRequest(res, "Order id must be a positive number");
  }

  req.invoiceOrderId = Number(req.params.orderId);
  return next();
}

export function validateInvoiceList(req, res, next) {
  const options = req.query || {};
  const {
    page,
    limit,
    search,
    paymentMethod,
    fromDate,
    toDate,
    minTotal,
    maxTotal,
    sortBy,
    sortOrder,
  } = options;

  if (page !== undefined && !isPositiveInteger(page)) {
    return badRequest(res, "Page must be a positive number");
  }

  if (limit !== undefined && (!isPositiveInteger(limit) || Number(limit) > 100)) {
    return badRequest(res, "Limit must be between 1 and 100");
  }

  if (search !== undefined && typeof search !== "string") {
    return badRequest(res, "Search must be a string");
  }

  if (typeof search === "string" && search.length > 100) {
    return badRequest(res, "Search must be 100 characters or less");
  }

  if (
    paymentMethod !== undefined &&
    paymentMethod !== "" &&
    !PAYMENT_METHODS.includes(paymentMethod)
  ) {
    return badRequest(res, "Invalid payment method");
  }

  for (const date of [fromDate, toDate]) {
    if (date !== undefined && date !== "" && !isValidDate(date)) {
      return badRequest(res, "Date filters must be valid dates in YYYY-MM-DD format");
    }
  }

  for (const total of [minTotal, maxTotal]) {
    if (
      total !== undefined &&
      total !== "" &&
      (!isNumericValue(total) || Number(total) < 0)
    ) {
      return badRequest(res, "Invoice totals must be zero or a positive number");
    }
  }

  if (
    sortBy !== undefined &&
    sortBy !== "" &&
    (typeof sortBy !== "string" || !SORT_FIELDS.includes(sortBy))
  ) {
    return badRequest(res, "Invalid invoice sort option");
  }

  if (
    sortOrder !== undefined &&
    sortOrder !== "" &&
    (typeof sortOrder !== "string" ||
      !["asc", "desc"].includes(sortOrder.toLowerCase()))
  ) {
    return badRequest(res, "Sort order must be asc or desc");
  }

  let normalizedFromDate = fromDate || "";
  let normalizedToDate = toDate || "";
  if (
    normalizedFromDate &&
    normalizedToDate &&
    normalizedFromDate > normalizedToDate
  ) {
    [normalizedFromDate, normalizedToDate] = [
      normalizedToDate,
      normalizedFromDate,
    ];
  }

  let normalizedMinTotal =
    minTotal == null || minTotal === "" ? null : Number(minTotal);
  let normalizedMaxTotal =
    maxTotal == null || maxTotal === "" ? null : Number(maxTotal);
  if (
    normalizedMinTotal !== null &&
    normalizedMaxTotal !== null &&
    normalizedMinTotal > normalizedMaxTotal
  ) {
    [normalizedMinTotal, normalizedMaxTotal] = [
      normalizedMaxTotal,
      normalizedMinTotal,
    ];
  }

  req.invoiceFilters = {
    page: page === undefined ? 1 : Number(page),
    limit: limit === undefined ? 10 : Number(limit),
    search: (search || "").trim(),
    paymentMethod: paymentMethod || "",
    fromDate: normalizedFromDate,
    toDate: normalizedToDate,
    minTotal: normalizedMinTotal,
    maxTotal: normalizedMaxTotal,
    sortBy: sortBy || "date",
    sortOrder: String(sortOrder || "desc").toLowerCase(),
  };

  return next();
}