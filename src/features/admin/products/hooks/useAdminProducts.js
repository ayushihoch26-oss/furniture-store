import { useCallback, useEffect, useState } from "react";
import productService from "../services/product.service";
import { getOptions } from "../../categories/services/category.service";
import { getStatus } from "../components/ProductTable";

export const PAGE_SIZE = 8;

export const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  salePrice: "",
  stock: "",
  image: "",
  description: "",
  material: "",
  size: "",
  shipping: "",
};

export function normalizeProduct(product = {}) {
  return {
    ...EMPTY_FORM,
    ...product,
    material: product.material ?? product.details?.material ?? "",
    size: product.size ?? product.details?.size ?? "",
    shipping: product.shipping ?? product.details?.shipping ?? "",
    salePrice: product.salePrice ?? "",
    image: product.image ?? "",
    description: product.description ?? "",
    stock: product.stock ?? 0,
  };
}

function getErrorText(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong."
  );
}

export default function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [minText, setMinText] = useState("");
  const [maxText, setMaxText] = useState("");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("latest");

  const [mode, setMode] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteIds, setDeleteIds] = useState([]);
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const notify = (message, severity = "success") => {
    setNotice({ open: true, message, severity });
  };

  const reload = () => setRefreshKey((value) => value + 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setMinPrice(minText);
      setMaxPrice(maxText);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchText, minText, maxText]);

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const loadCategories = useCallback(async () => {
    try {
      const options = await getOptions();
      setCategories(options.map((item) => item.name));
    } catch (error) {
      notify(getErrorText(error), "error");
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await productService.getStats();
      setStats({
        total: Number(data.total) || 0,
        inStock: Number(data.inStock) || 0,
        lowStock: Number(data.lowStock) || 0,
        outOfStock: Number(data.outOfStock) || 0,
      });
    } catch (error) {
      notify(getErrorText(error), "error");
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const data = await productService.getProducts({
        search,
        stockStatus,
        category,
        minPrice,
        maxPrice,
        sort,
        page,
        limit: PAGE_SIZE,
      });

      const lastPage = Math.max(Number(data.totalPages) || 1, 1);
      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setProducts((data.products || []).map(normalizeProduct));
      setTotalProducts(Number(data.total) || 0);
      setTotalPages(lastPage);
      setSelected([]);
    } catch (error) {
      setProducts([]);
      notify(getErrorText(error), "error");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    stockStatus,
    category,
    minPrice,
    maxPrice,
    sort,
    page,
  ]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories, refreshKey]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, refreshKey]);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  function clearFilters() {
    setSearchText("");
    setMinText("");
    setMaxText("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setStockStatus("all");
    setCategory("All");
    setPage(1);
  }

  function openDialog(nextMode, product = EMPTY_FORM) {
    const nextForm = normalizeProduct(product);
    if (nextMode === "add" && !nextForm.category) {
      nextForm.category = categories[0] || "";
    }
    setForm(nextForm);
    setImageFile(null);
    setImagePreview("");
    setMode(nextMode);
  }

  function closeDialog() {
    if (!saving) setMode("");
  }

  function setField(name, value) {
    setForm((oldForm) => ({ ...oldForm, [name]: value }));
  }

  function pickImage(file) {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      notify("Please select a PNG, JPG or WEBP image.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify("Image must be 2 MB or less.", "error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const price = Number(form.price);
  const sale =
    form.salePrice === "" ? null : Number(form.salePrice);
  const stock = Number(form.stock);
  const saleTooHigh = sale !== null && sale > price;
  const formInvalid =
    !form.name.trim() ||
    !form.category ||
    form.price === "" ||
    !(price >= 0) ||
    form.stock === "" ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    (sale !== null && (!(sale >= 0) || saleTooHigh));

  async function saveProduct() {
    if (formInvalid || saving) return;
    setSaving(true);

    try {
      let image = form.image.trim() || null;
      if (imageFile) {
        image = await productService.uploadImage(imageFile);
      }

      const payload = {
        name: form.name.trim(),
        category: form.category,
        price,
        salePrice: sale,
        stock,
        image,
        description: form.description.trim(),
        material: form.material.trim(),
        size: form.size.trim(),
        shipping: form.shipping.trim(),
      };

      if (mode === "add") {
        await productService.createProduct(payload);
        notify("Product created successfully");
        setSort("latest");
        setPage(1);
      } else {
        await productService.updateProduct(form.id, payload);
        notify("Product updated successfully");
      }

      setMode("");
      reload();
    } catch (error) {
      notify(getErrorText(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProducts() {
    if (!deleteIds.length || saving) return;
    setSaving(true);

    try {
      await Promise.all(
        deleteIds.map((id) => productService.deleteProduct(id)),
      );
      notify(
        deleteIds.length > 1 ? "Products deleted" : "Product deleted",
      );
    } catch (error) {
      notify(getErrorText(error), "error");
    } finally {
      setDeleteIds([]);
      setSaving(false);
      reload();
    }
  }

  function exportCsv() {
    const exportRows = selected.length
      ? products.filter((product) => selected.includes(product.id))
      : products;

    if (!exportRows.length) {
      notify("No products to export", "warning");
      return;
    }

    const header = [
      "ID",
      "Name",
      "Category",
      "Price",
      "Sale Price",
      "Stock",
      "Status",
    ];
    const lines = exportRows.map((product) => [
      product.productCode || product.id,
      product.name,
      product.category,
      product.price,
      product.salePrice,
      product.stock,
      getStatus(product.stock).label,
    ]);

    const csv = [header, ...lines]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "products.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    products,
    categories,
    stats,
    page,
    setPage,
    totalPages,
    totalProducts,
    loading,
    saving,
    selected,
    setSelected,
    searchText,
    setSearchText,
    minText,
    setMinText,
    maxText,
    setMaxText,
    stockStatus,
    setStockStatus,
    category,
    setCategory,
    sort,
    setSort,
    mode,
    form,
    setField,
    imagePreview,
    saleTooHigh,
    formInvalid,
    deleteIds,
    setDeleteIds,
    notice,
    setNotice,
    clearFilters,
    openDialog,
    closeDialog,
    pickImage,
    saveProduct,
    deleteProducts,
    exportCsv,
  };
}
