import { Op } from "sequelize";
import { ContactUs } from "../models/index.js";

export const create = async (data) => {
  return ContactUs.create(data);
};

export const findPaginated = async ({
  status,
  subject,
  search,
  fromDate,
  toDate,
  sortOrder = "desc",
  page = 1,
  limit = 8,
}) => {
  const where = {};

  // filters
  if (status) where.status = status;
  if (subject) where.subject = subject;

  // search   name, email, phone, subject, message
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
      { subject: { [Op.like]: `%${search}%` } },
      { message: { [Op.like]: `%${search}%` } },
    ];
  }

  // date filter
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt[Op.gte] = fromDate;
    if (toDate) where.createdAt[Op.lte] = toDate;
  }

  //pagination and sorting
  const direction = sortOrder === "asc" ? "ASC" : "DESC";
  const { rows, count } = await ContactUs.findAndCountAll({
    where,
    order: [["createdAt", direction]],
    offset: (page - 1) * limit,
    limit,
  });
  return { rows, count };
};

export const updateStatus = async (id, status) => {
  const message = await ContactUs.findByPk(id);
  if (!message) return null;
  return message.update({ status });
};

//delete admin message
export const remove = async (id) => {
  const message = await ContactUs.findByPk(id);
  if (!message) return null;
  return message.destroy();
};

export default { create, findPaginated, updateStatus, remove };
