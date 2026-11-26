import {
  CATEGORY_COLORS,
  EMPTY_CATEGORY_FORM,
} from "../constants/categoryConstants";

export function getCategoryErrorText(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong."
  );
}

export function normalizeCategory(category = {}) {
  return {
    ...EMPTY_CATEGORY_FORM,
    ...category,
    description: category.description ?? "",
    image: category.image ?? "",
    isActive: category.isActive ?? true,
  };
}

export function getCategoryStatus(isActive) {
  return isActive
    ? { label: "Active", color: CATEGORY_COLORS.GREEN }
    : { label: "Inactive", color: CATEGORY_COLORS.GRAY };
}

export function getCategoryCode(category) {
  return category.code || `CAT${String(category.id).padStart(4, "0")}`;
}

export function formatCategoryDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCalendarDate(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function downloadCategoriesCsv(rows, fileName) {
  const header = ["ID", "Name", "Description", "Products", "Status"];
  const lines = rows.map((category) => [
    getCategoryCode(category),
    category.name,
    category.description,
    category.productCount,
    getCategoryStatus(category.isActive).label,
  ]);
  const csv = [header, ...lines]
    .map((row) =>
      row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
