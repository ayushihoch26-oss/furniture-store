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
  if (search.trim()) {
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
  const direction = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
  const result = await ContactUs.findAndCountAll({
    where,
    order: [["createdAt", direction]],
    limit,
    offset: (page - 1) * limit,
  });

  return result;
};

// statcard
export const getStats = async () => {
  const [total, newcount, readcount, repliedcount] = await Promise.all([
    ContactUs.count(),
    ContactUs.count({ where: { status: "New" } }),
    ContactUs.count({ where: { status: "Read" } }),
    ContactUs.count({ where: { status: "Replied" } }),
  ]);

  return { total, new: newcount, read: readcount, replied: repliedcount };
};

// admin get one message by id
export const findById = async (id)=>{
   return ContactUs.findByPk(id);
}

export const updateStatus = async (id, status) => {
  const message = await ContactUs.findByPk(id);
  if (!message) return null;
  await message.update({ status });
  return message;
};

//delete admin message
export const remove = async (id) => {
  const message = await ContactUs.findByPk(id);
  if (!message) return null;
  await message.destroy();
  return message;
};

export default { create, findPaginated, updateStatus, remove, getStats, findById };
