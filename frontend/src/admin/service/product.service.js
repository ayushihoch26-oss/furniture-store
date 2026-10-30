import api from "../../api/api";

const productService = {
  async getProducts({
    search = "",
    stockStatus = "all",
    category = "All",
    sort = "latest",
    page = 1,
    limit = 8,
  } = {}) {
    const { data } = await api.post("/products/admin/list", {
      search,
      stockStatus,
      categories: category === "All" ? [] : [category],
      sort,
      page,
      limit,
    });

    return data;
  },

  async getStats() {
    const { data } = await api.post("/products/admin/stats", {});
    return data;
  },

  async getProduct(id) {
    const { data } = await api.post(`/products/product/${id}`, {});
    return data;
  },

  async uploadImage(file) {
    if (!(file instanceof File)) {
      throw new Error("Please select a product image.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const { data } = await api.post("/products/admin/upload-image", formData);

    if (!data?.image) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return data.image;
  },

  async createProduct(product) {
    const { data } = await api.post("/products/admin/create", product);
    return data;
  },

  async updateProduct(id, product) {
    const { data } = await api.post(`/products/admin/update/${id}`, product);

    return data;
  },

  async deleteProduct(id) {
    const { data } = await api.post(`/products/admin/delete/${id}`, {});
    return data;
  },
};

export default productService;
