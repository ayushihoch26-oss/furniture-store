export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatCount(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export function getPages(page, totalPages) {
  if (totalPages <= 0) return [];

  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, "...", totalPages];

  if (page >= totalPages - 2) {
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

function getSpend(spend) {
  return Number(String(spend || "0").replace(/,/g, "")) || 0;
}

export function sortCustomers(
  customers,
  statusFilter,
  minOrders,
  sortBy,
  sortOrder,
) {
  const filteredCustomers = customers.filter((customer) => {
    const orders = Number(customer.orders) || 0;
    const matchesStatus =
      statusFilter === "All" || customer.status === statusFilter;
    const matchesOrders = minOrders === "" || orders >= Number(minOrders);

    return matchesStatus && matchesOrders;
  });

  return filteredCustomers.sort((first, second) => {
    let firstValue;
    let secondValue;

    if (sortBy === "name") {
      firstValue = String(first.name || "").toLowerCase();
      secondValue = String(second.name || "").toLowerCase();
    } else if (sortBy === "orders") {
      firstValue = Number(first.orders) || 0;
      secondValue = Number(second.orders) || 0;
    } else {
      firstValue = getSpend(first.spend);
      secondValue = getSpend(second.spend);
    }

    if (firstValue === secondValue) return 0;
    if (sortOrder === "asc") return firstValue < secondValue ? -1 : 1;
    return firstValue > secondValue ? -1 : 1;
  });
}
