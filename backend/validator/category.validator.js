const CATEGORY_STATUSES = ["all", "active", "inactive"];
const SORT_OPTIONS = ["latest", "oldest", "name_asc", "name_desc"];

// Common error response
function badRequest(res, message) {
  return res.status(400).json({
    success: false,
    message,
  });
}

// Check positive number
function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

// Validate category name
function validateName(name, res) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return badRequest(res, "Name is required");
  }

  if (name.trim().length > 60) {
    return badRequest(res, "Name must be 60 characters or less");
  }

  if (name.trim().toLowerCase() === "other") {
    return badRequest(res, '"Other" is a reserved name');
  }

  return null;
}

// Validate optional fields
function validateOptionalFields(body, res) {
  if (body.description != null && typeof body.description !== "string") {
    return badRequest(res, "Description must be a string");
  }

  if (
    body.image != null &&
    (typeof body.image !== "string" || body.image.length > 255)
  ) {
    return badRequest(res, "Image must be a string of 255 characters or less");
  }

  if (
    body.isActive !== undefined &&
    ![true, false, "true", "false"].includes(body.isActive)
  ) {
    return badRequest(res, "Invalid status");
  }

  return null;
}

// Create category validation
export function validateCategoryCreate(req, res, next) {
  const body = req.body || {};

  const nameError = validateName(body.name, res);
  if (nameError) return nameError;

  const fieldsError = validateOptionalFields(body, res);
  if (fieldsError) return fieldsError;

  next();
}

// Update category validation
export function validateCategoryUpdate(req, res, next) {
  const body = req.body || {};

  if (body.name !== undefined) {
    const nameError = validateName(body.name, res);
    if (nameError) return nameError;
  }

  const fieldsError = validateOptionalFields(body, res);
  if (fieldsError) return fieldsError;

  next();
}

// List categories validation
export function validateCategoryList(req, res, next) {
  const options = { ...req.query, ...req.body };

  if (options.page !== undefined && !isPositiveInteger(options.page)) {
    return badRequest(res, "Page must be a positive number");
  }

  if (
    options.limit !== undefined &&
    (!isPositiveInteger(options.limit) || Number(options.limit) > 100)
  ) {
    return badRequest(res, "Limit must be between 1 and 100");
  }

  if (
    options.status !== undefined &&
    !CATEGORY_STATUSES.includes(options.status)
  ) {
    return badRequest(res, "Invalid category status filter");
  }

  if (
    options.sort !== undefined &&
    !SORT_OPTIONS.includes(options.sort)
  ) {
    return badRequest(res, "Invalid category sort option");
  }

  if (
    options.search !== undefined &&
    typeof options.search !== "string"
  ) {
    return badRequest(res, "Search must be a string");
  }

  next();
}

// Category ID validation
export function validateCategoryId(req, res, next) {
  if (!isPositiveInteger(req.params.id)) {
    return badRequest(res, "Category id must be a positive number");
  }

  next();
}