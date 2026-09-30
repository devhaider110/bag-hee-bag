import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
}/products`;

// ==========================================
// PRODUCTS
// ==========================================

export const getProducts = async (
  filters = {}
) => {
  const params = {};

  Object.keys(filters).forEach(
    (key) => {
      const value = filters[key];

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params[key] = value;
      }
    }
  );

  const response =
    await axios.get(
      API_URL,
      {
        params,
      }
    );

  return response.data;
};

export const getProductById = async (
  id
) => {
  const response =
    await axios.get(
      `${API_URL}/${id}`
    );

  return response.data;
};

export const createProduct = async (
  productData
) => {
  const response =
    await axios.post(
      API_URL,
      productData
    );

  return response.data;
};

export const updateProduct = async (
  id,
  productData
) => {
  const response =
    await axios.put(
      `${API_URL}/${id}`,
      productData
    );

  return response.data;
};

export const deleteProduct = async (
  id
) => {
  const response =
    await axios.delete(
      `${API_URL}/${id}`
    );

  return response.data;
};

// ==========================================
// PRODUCT IMAGES
// ==========================================

export const uploadProductImage =
  async (
    productId,
    file,
    options = {}
  ) => {
    const formData =
      new FormData();

    formData.append(
      "image",
      file
    );

    formData.append(
      "type",
      options.type || "other"
    );

    formData.append(
      "alt",
      options.alt || ""
    );

    const response =
      await axios.post(
        `${API_URL}/${productId}/images`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const deleteProductImage =
  async (
    productId,
    imageId
  ) => {
    const response =
      await axios.delete(
        `${API_URL}/${productId}/images/${imageId}`
      );

    return response.data;
  };

export const setPrimaryProductImage =
  async (
    productId,
    imageId
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/${productId}/images/${imageId}/primary`
      );

    return response.data;
  };

// ==========================================
// PRODUCT VIDEOS
// ==========================================

export const uploadProductVideo =
  async (
    productId,
    file,
    options = {}
  ) => {
    const formData =
      new FormData();

    formData.append(
      "video",
      file
    );

    formData.append(
      "title",
      options.title || ""
    );

    formData.append(
      "type",
      options.type || "demo"
    );

    const response =
      await axios.post(
        `${API_URL}/${productId}/videos`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const deleteProductVideo =
  async (
    productId,
    videoId
  ) => {
    const response =
      await axios.delete(
        `${API_URL}/${productId}/videos/${videoId}`
      );

    return response.data;
  };

export const setPrimaryProductVideo =
  async (
    productId,
    videoId
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/${productId}/videos/${videoId}/primary`
      );

    return response.data;
  };

// ==========================================
// PRODUCT VARIANTS
// ==========================================
// These APIs are intentionally retained.
// Their UI will be moved into ProductForm.

export const addProductVariant =
  async (
    productId,
    variantData
  ) => {
    const response =
      await axios.post(
        `${API_URL}/${productId}/variants`,
        variantData
      );

    return response.data;
  };

export const updateProductVariant =
  async (
    productId,
    variantId,
    variantData
  ) => {
    const response =
      await axios.put(
        `${API_URL}/${productId}/variants/${variantId}`,
        variantData
      );

    return response.data;
  };

export const deleteProductVariant =
  async (
    productId,
    variantId
  ) => {
    const response =
      await axios.delete(
        `${API_URL}/${productId}/variants/${variantId}`
      );

    return response.data;
  };