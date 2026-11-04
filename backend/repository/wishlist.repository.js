import {Op } from "sequelize";
import { Wishlists, Products, Users } from "../models/index.js";

// Find wishlist by ID
export async function findById(id) {
  return await Wishlists.findByPk(id, {
    include: [
      {
        model: Products,
        as: "product",
        attributes: ["id", "name", "price", "image"]
      },
      {
        model: Users,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"]
      }
    ]
  });
}

// Find wishlist by user ID
export async function findByUserId(userId) {
  return await Wishlists.findAll({
    where: { userId },
    include: [
      {
        model: Products,
        as: "product",
        attributes: ["id", "name", "price", "image"]
      }
    ]
  });
}

// show all wishlist in admin side
export const getAllWishlists = async () => {
  return await Wishlists.findAll({
    include: [
      {
        model: Products,
        as: "product",
        attributes: ["id", "name", "price", "image"]
      },
      {
        model: Users,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"]
      }
    ]
  });
}

// get wishlist admin stat card value
export const getWishlistStats = async () => {
  const [total, uniqueUsers] = await Promise.all([
    Wishlists.count(),
    Wishlists.count({
      distinct: true,
      col: "userId"
    })
  ]);
  return { total, uniqueUsers };
};

// create wishlist
export const createWishlist = async (data) => {
  return await Wishlists.create(data);
}

// delete wishlist by id
export const deleteWishlist = async (id) => {
  const wishlist = await Wishlists.findByPk(id);
  if (!wishlist) {
    throw new Error("Wishlist not found");
  }
  await wishlist.destroy();
  return wishlist;
}

// search wishlist by product name
export const searchWishlistByProductName = async (productName) => {
  return await Wishlists.findAll({
    include: [
      {
        model: Products,
        as: "product",
        where: {
          name: {
            [Op.like]: `%${productName}%`
          }
        },
        attributes: ["id", "name", "price", "image"]
      },
      {
        model: Users,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"]
      }
    ]
  });
}

// pagination in admin side for wishlist
export const findAllPaginated = async (limit = 8, page = 1) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 8, 1), 100);

  const offset = (page - 1) * limit;

  const { count, rows } = await Wishlists.findAndCountAll({
    include: [
      { model: Products, as: "product" },
      { model: Users, as: "user" }
    ],
    limit,
    offset,
    order: [["id", "DESC"]],
    distinct: true
  });

  return {
    wishlists: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
};

// filter by date in admin side for wishlist
export const filterByDate = async ({ startDate, endDate }) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
  }
  if (startDate) {
    where.createdAt[Op.gte] = new Date(`${startDate}T00:00:00`);
  }
  if (endDate) {
    where.createdAt[Op.lte] = new Date(`${endDate}T23:59:59.999`);
  }
  return await Wishlists.findAll({ where });
};

// sorting by product price in admin side for wishlist
export const sortByPrice = async (order = "asc") => {
  const direction = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  return await Wishlists.findAll({
    include: [
      {
        model: Products,
        as: "product"
      }
    ],
    order: [[{ model: Products, as: "product" }, "price", direction]]
  });
};

export default {
  findById,
  findByUserId,
  getAllWishlists,
  createWishlist,
  deleteWishlist,
  searchWishlistByProductName,
  findAllPaginated,
  filterByDate,
  sortByPrice
};