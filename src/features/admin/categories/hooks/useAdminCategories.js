import { useCallback, useEffect, useState } from "react";

import productService from "../../products/services/product.service";
import {
  CATEGORY_IMAGE_TYPES,
  CATEGORY_MAX_IMAGE_SIZE,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_PAGE_SIZE,
  EMPTY_CATEGORY_FORM,
  getCategoryTheme,
} from "../constants/categoryConstants";
import {
  downloadCategoriesCsv,
  getCategoryCode,
  getCategoryErrorText,
  getCategoryStatus,
  normalizeCategory,
} from "../utils/categoryUtils";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getStats,
  updateCategory,
} from "../services/category.service";

export default function useAdminCategories(darkMode) {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("latest");
  const [selected, setSelected] = useState([]);

  const [mode, setMode] = useState("");
  const [form, setForm] = useState(EMPTY_CATEGORY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ ids: [], name: "" });
  const [notice, setNotice] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = getCategoryTheme(darkMode);

  const notify = useCallback((message, severity = "success") => {
    setNotice({ open: true, message, severity });
  }, []);

  const reload = () => {
    setRefresh((value) => value + 1);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const loadCategories = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getCategories({
        search,
        status,
        sort,
        page,
        limit: CATEGORY_PAGE_SIZE,
      });
      const lastPage = Math.max(Number(data.totalPages) || 1, 1);

      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setCategories((data.categories || []).map(normalizeCategory));
      setTotalCategories(Number(data.total) || 0);
      setTotalPages(lastPage);
      setSelected([]);
    } catch (error) {
      setCategories([]);
      notify(getCategoryErrorText(error), "error");
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page, notify]);

  const loadStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats({
        total: Number(data.total) || 0,
        active: Number(data.active) || 0,
        inactive: Number(data.inactive) || 0,
      });
    } catch (error) {
      notify(getCategoryErrorText(error), "error");
    }
  }, [notify]);

  useEffect(() => {
    // Fetching data is the side effect that synchronizes this page with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, [loadCategories, refresh]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, [loadStats, refresh]);

  function clearFilters() {
    setSearchText("");
    setSearch("");
    setStatus("all");
    setPage(1);
  }

  function openDialog(nextMode, category = EMPTY_CATEGORY_FORM) {
    setForm(normalizeCategory(category));
    setImageFile(null);
    setImagePreview("");
    setMode(nextMode);
  }

  function closeDialog() {
    if (!saving) setMode("");
  }

  function setField(name, value) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function setImageUrl(value) {
    setField("image", value);
    setImageFile(null);
    setImagePreview("");
  }

  function pickImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!CATEGORY_IMAGE_TYPES.includes(file.type)) {
      notify("Please select a PNG, JPG or WEBP image.", "error");
      return;
    }

    if (file.size > CATEGORY_MAX_IMAGE_SIZE) {
      notify("Image must be 2 MB or less.", "error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const nameTooLong = form.name.trim().length > CATEGORY_NAME_MAX_LENGTH;
  const formInvalid = !form.name.trim() || nameTooLong;

  async function saveCategory() {
    if (formInvalid || saving) return;
    setSaving(true);

    try {
      let image = form.image.trim() || null;
      if (imageFile) image = await productService.uploadImage(imageFile);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image,
        isActive: form.isActive,
      };

      if (mode === "add") {
        await createCategory(payload);
        notify("Category created successfully");
        setSort("latest");
        setPage(1);
      } else {
        await updateCategory(form.id, payload);
        notify(
          form.productCount > 0 && payload.name !== form.originalName
            ? "Category updated. Products were moved to the new name."
            : "Category updated successfully",
        );
      }

      setMode("");
      reload();
    } catch (error) {
      notify(getCategoryErrorText(error), "error");
    } finally {
      setSaving(false);
    }
  }

  function openDelete(ids, name = "") {
    setDeleteTarget({ ids: Array.isArray(ids) ? ids : [ids], name });
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    const { ids } = deleteTarget;

    if (!ids.length || saving) {
      setDeleteOpen(false);
      return;
    }

    setSaving(true);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => deleteCategory(id)),
      );
      const failed = results.filter((result) => result.status === "rejected");

      if (failed.length === 0) {
        notify(ids.length > 1 ? "Categories deleted" : "Category deleted");
      } else {
        notify(getCategoryErrorText(failed[0].reason), "error");
      }
    } finally {
      setDeleteOpen(false);
      setSaving(false);
      reload();
    }
  }

  function exportCsv() {
    const rows = selected.length
      ? categories.filter((category) => selected.includes(category.id))
      : categories;

    if (!rows.length) {
      notify("No categories to export", "warning");
      return;
    }

    const fileName =
      selected.length > 0 ? "selected-categories.csv" : "all-categories.csv";
    downloadCategoriesCsv(rows, fileName);
  }

  const viewRows = [
    ["Category ID", form.id ? getCategoryCode(form) : "-"],
    ["Name", form.name],
    ["Products", form.productCount ?? 0],
    ["Status", getCategoryStatus(form.isActive).label],
    ["Description", form.description || "-"],
  ];

  const fieldSx = {
    mb: 2,
    "& .MuiInputBase-root": { color: theme.text },
    "& .MuiInputLabel-root": { color: theme.muted },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
  };

  const previewSrc = imagePreview || form.image;
  const dialogPaperSx = {
    bgcolor: darkMode ? "#292421" : "#FFFFFF",
    color: theme.text,
    backgroundImage: "none",
    border: `1px solid ${theme.border}`,
  };

  return {
    categories,
    stats,
    totalPages,
    totalCategories,
    loading,
    saving,
    page,
    setPage,
    searchText,
    setSearchText,
    status,
    setStatus,
    sort,
    setSort,
    selected,
    setSelected,
    mode,
    setMode,
    form,
    setForm,
    imagePreview,
    deleteOpen,
    setDeleteOpen,
    deleteTarget,
    notice,
    setNotice,
    theme,
    clearFilters,
    openDialog,
    closeDialog,
    setField,
    setImageUrl,
    pickImage,
    nameTooLong,
    formInvalid,
    saveCategory,
    openDelete,
    confirmDelete,
    exportCsv,
    viewRows,
    fieldSx,
    previewSrc,
    dialogPaperSx,
  };
}
