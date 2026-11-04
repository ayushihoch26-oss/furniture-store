
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

// Check positive integer
function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

// Validate product ID
export function validateProductId(value) {
  if (!isPositiveInteger(value)) {
    throw new ValidationError("Invalid product ID");
  }

  return Number(value);
}

// Validate product data
export function validateProductData(data, isUpdate = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Product data is required");
  }

  if (isUpdate && Object.keys(data).length === 0) {
    throw new ValidationError("Update data is required");
  }

  const product = {};

  // Check name
  if (!isUpdate || data.name !== undefined) {
    const name = String(data.name ?? "").trim();

    if (name === "") {
      throw new ValidationError("name is required");
    }

    product.name = name;
  }

  // Check category
  if (!isUpdate || data.category !== undefined) {
    const category = String(data.category ?? "").trim();

    if (category === "") {
      throw new ValidationError("category is required");
    }

    product.category = category;
  }

  // Check price
  if (!isUpdate || data.price !== undefined) {
    const price = Number(data.price);

    if (
      data.price === "" ||
      data.price == null ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new ValidationError("Invalid price");
    }

    product.price = price;
  }

  // Check sale price
  if (data.salePrice !== undefined) {
    let salePrice = data.salePrice;

    if (salePrice === "" || salePrice == null) {
      salePrice = null;
    } else {
      salePrice = Number(salePrice);
    }

    if (
      salePrice !== null &&
      (!Number.isFinite(salePrice) || salePrice < 0)
    ) {
      throw new ValidationError("Invalid sale price");
    }

    product.salePrice = salePrice;
  }

  // Check stock
  if (data.stock !== undefined) {
    const stock = Number(data.stock);

    if (
      data.stock == null ||
      data.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      throw new ValidationError(
        "Stock must be a whole number, 0 or more"
      );
    }

    product.stock = stock;
  }

  // Check description, image, material, size and shipping
  if (data.description !== undefined) {
    if (data.description !== null && typeof data.description !== "string") {
      throw new ValidationError("description must be text");
    }
    product.description = data.description;
  }

  if (data.image !== undefined) {
    if (data.image !== null && typeof data.image !== "string") {
      throw new ValidationError("image must be text");
    }
    product.image = data.image;
  }

  if (data.material !== undefined) {
    if (data.material !== null && typeof data.material !== "string") {
      throw new ValidationError("material must be text");
    }
    product.material = data.material;
  }

  if (data.size !== undefined) {
    if (data.size !== null && typeof data.size !== "string") {
      throw new ValidationError("size must be text");
    }
    product.size = data.size;
  }

  if (data.shipping !== undefined) {
    if (data.shipping !== null && typeof data.shipping !== "string") {
      throw new ValidationError("shipping must be text");
    }
    product.shipping = data.shipping;
  }

  // Check new product status
  if (data.isNew !== undefined) {
    if (
      data.isNew !== true &&
      data.isNew !== false &&
      data.isNew !== "true" &&
      data.isNew !== "false"
    ) {
      throw new ValidationError("Invalid new product status");
    }

    product.isNew = data.isNew === true || data.isNew === "true";
  }

  if (isUpdate && Object.keys(product).length === 0) {
    throw new ValidationError("Update data is required");
  }

  return product;
}

// Get pagination
export function getPagination(params = {}) {
  let page = Number(params.page) || 1;
  let limit = Number(params.limit) || 8;

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 1;
  }

  if (limit > 100) {
    limit = 100;
  }

  return { page, limit };
}

// Validate shop parameters
export function validateShopParams(params = {}) {
  const { page, limit } = getPagination(params);

  // Get categories
  let categories = [];

  if (params.categories !== undefined) {
    if (Array.isArray(params.categories)) {
      categories = params.categories;
    } else {
      categories = [params.categories];
    }
  } else if (params.category !== undefined) {
    categories = [params.category];
  }

  let newCategories = [];

  for (let i = 0; i < categories.length; i++) {
    if (categories[i] != null && categories[i] !== "") {
      let parts = String(categories[i]).split(",");

      for (let j = 0; j < parts.length; j++) {
        let category = parts[j].trim();

        if (category !== "") {
          newCategories.push(category);
        }
      }
    }
  }

  categories = newCategories;

  // Check sorting
  let sort = "latest";

  if (params.sort === "latest") {
    sort = "latest";
  } else if (params.sort === "price_asc" || params.sort === "priceLow") {
    sort = "price_asc";
  } else if (params.sort === "price_desc" || params.sort === "priceHigh") {
    sort = "price_desc";
  } else if (params.sort === "name_asc") {
    sort = "name_asc";
  }

  // Check price filters
  const minPrice = getOptionalPrice(params.minPrice);
  const maxPrice = getOptionalPrice(params.maxPrice);

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    throw new ValidationError(
      "Minimum price cannot be greater than maximum price"
    );
  }

  return {
    page,
    limit,
    search: String(params.search || "").trim(),
    categories,
    sort,
    minPrice,
    maxPrice,
    onSale: params.onSale === true || params.onSale === "true"
  };
}

// Check optional price
function getOptionalPrice(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    throw new ValidationError("Price filters must be zero or more");
  }

  return price;
}
