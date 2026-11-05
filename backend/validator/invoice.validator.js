export const validateInvoiceOrderId = (req, res, next) => {
  const orderId = Number(req.params.orderId);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Order id must be a positive number",
    });
  }

  req.invoiceOrderId = orderId;
  next();
};

export const validateInvoiceList = (req, res, next) => {
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
  } = req.query;

  // Validate pagination
  if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid page number",
    });
  }

  if (
    limit &&
    (!Number.isInteger(Number(limit)) ||
      Number(limit) < 1 ||
      Number(limit) > 100)
  ) {
    return res.status(400).json({
      success: false,
      message: "Limit must be between 1 and 100",
    });
  }

  // Validate search
  if (
    search !== undefined &&
    (typeof search !== "string" || search.length > 100)
  ) {
    return res.status(400).json({
      success: false,
      message: "Search must be 100 characters or less",
    });
  }

  // Validate payment method
  if (paymentMethod && !["card", "cod"].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payment method",
    });
  }

  // Validate dates
  for (const date of [fromDate, toDate]) {
    if (
      date &&
      (typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        isNaN(new Date(date).getTime()) ||
        new Date(date).toISOString().slice(0, 10) !== date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }
  }

  // Validate totals
  for (const total of [minTotal, maxTotal]) {
    if (
      total !== undefined &&
      total !== "" &&
      (!Number.isFinite(Number(total)) || Number(total) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invoice total must be a positive number",
      });
    }
  }

  // Validate sorting
  if (sortBy && !["id", "name", "total", "payment", "date"].includes(sortBy)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sort option",
    });
  }

  if (sortOrder && !["asc", "desc"].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Sort order must be asc or desc",
    });
  }

  // Normalize dates
  let start = fromDate || "";
  let end = toDate || "";

  if (start && end && start > end) {
    [start, end] = [end, start];
  }

  // Normalize totals
  let min = minTotal === "" || minTotal == null ? null : Number(minTotal);
  let max = maxTotal === "" || maxTotal == null ? null : Number(maxTotal);

  if (min !== null && max !== null && min > max) {
    [min, max] = [max, min];
  }

  // Store validated filters
  req.invoiceFilters = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: (search || "").trim(),
    paymentMethod: paymentMethod || "",
    fromDate: start,
    toDate: end,
    minTotal: min,
    maxTotal: max,
    sortBy: sortBy || "date",
    sortOrder: (sortOrder || "desc").toLowerCase(),
  };

  next();
};
