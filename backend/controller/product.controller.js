import productService from "../service/product.service.js";

import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

// filters can come from the query string or the body (arrays work better in body)
const getParams = (req) => ({ ...req.query, ...req.body });

// image upload
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image received. Use the field name 'image'.",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "furniture/products",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(uploadedImage);
        },
      );

      Readable.from(req.file.buffer).pipe(stream);
    });

    console.log("Cloudinary upload successful:", result.secure_url);

    return res.status(200).json({
      success: true,
      image: result.secure_url,
      publicId: result.public_id,
      message: "Image uploaded successfully.",
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    next(error);
  }
};

// ---------- Public (Shop page) ----------

// Shop product grid (filters + sort + pagination)
export const shopList = async (req, res, next) => {
  try {
    const result = await productService.shopList(getParams(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Sidebar filters (categories,  price range)
export const filters = async (req, res, next) => {
  try {
    const result = await productService.filters();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Product details modal
export const getById = async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ---------- Admin (Product List page) ----------

// Get All Products (Admin)
export const adminList = async (req, res, next) => {
  try {
    const result = await productService.adminList(getParams(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Product Stats (Admin)
export const stats = async (req, res, next) => {
  try {
    const result = await productService.stats();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Add Product (Admin)
export const create = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// Edit Product (Admin)
export const update = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Delete Product (Admin)
export const remove = async (req, res, next) => {
  try {
    await productService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
