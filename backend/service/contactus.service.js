import contactUsRepository from "../repository/contactus.repository.js";

const makeError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const create = async ({ name, email, message, phone, subject }) => {
  if (!name || !email || !message || !phone) {
    throw makeError("Name, email and message are required", 400);
  }
  return contactUsRepository.create({ name, email, phone, subject, message });
};

export const list = async (params) => {
  // PAGE and LIMIT (safe defaults)
  let page = Number(params.page) || 1;
  let limit = Number(params.limit) || 6;
  if (page < 1) page = 1;
  if (limit < 1) limit = 6;
  if (limit > 100) limit = 100;

  // SEARCH text
  const search = String(params.search || "").trim();

  // DATES: "2026-10-09" -> start of day / end of day
  let startDate = null;
  let endDate = null;

  if (params.startDate) {
    startDate = new Date(params.startDate + "T00:00:00");
    if (isNaN(startDate)) throw makeError("Invalid start date", 400);
  }

  if (params.endDate) {
    endDate = new Date(params.endDate + "T23:59:59.999");
    if (isNaN(endDate)) throw makeError("Invalid end date", 400);
  }

  if (startDate && endDate && startDate > endDate) {
    throw makeError("Start date cannot be after end date", 400);
  }

  const { rows, count } = await contactUsRepository.findPaginated({
    page,
    limit,
    search,
    startDate,
    endDate,
  });

  return {
    rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};

// ADMIN: delete a message
export const remove = async (id) => {
  const contact = await contactUsRepository.remove(id);
  if (!contact) throw makeError("Message not found", 404);

  await contact.destroy();
};

export const updateStatus = async (id, status) => {
  const STATUSES = ["New", "Read", "Replied"];
  if (!STATUSES.includes(status)) {
    throw new makeError("Status is required", 400);
  }
  const message = await contactUsRepository.updateStatus(id, status);
  if (!message) return null;
  return format(message);
};

export const stats = async () => {
  const [total, newCount, readCount, repliedCount] = await Promise.all([
    contactUsRepository.findAndCountAll(),
    contactUsRepository.findAndCountAll("New"),
    contactUsRepository.findAndCountAll("Read"),
    contactUsRepository.findAndCountAll("Replied"),
  ]);

  return {
    total,
    new: newCount,
    read: readCount,
    replied: repliedCount,
  };
};

export default {
  create,
  list,
  remove,
  stats,
  updateStatus,
};
