const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// ==========================================
// HELPER
// ==========================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// GET PRODUCTS
// MODULE 4 FILTERS PRESERVED
// ==========================================

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      color,
      material,
      waterResistance,
      inStock,
      featured,
      newArrival,
      bestSeller,
      sort,
    } = req.query;

    const query = {
      isActive: true,
    };

    // Search
    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category
    if (category && isValidObjectId(category)) {
      query.category = category;
    }

    // Price
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Color
    if (color) {
      query.color = {
        $regex: color,
        $options: "i",
      };
    }

    // Material
    if (material) {
      query.material = {
        $regex: material,
        $options: "i",
      };
    }

    // Water resistance
    if (waterResistance) {
      query.waterResistance = waterResistance;
    }

    // Stock
    if (inStock === "true") {
      query.stock = {
        $gt: 0,
      };
    }

    // Featured
    if (featured === "true") {
      query.isFeatured = true;
    }

    // New Arrival
    if (newArrival === "true") {
      query.isNewArrival = true;
    }

    // Best Seller
    if (bestSeller === "true") {
      query.isBestSeller = true;
    }

    // Sort
    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "priceLow":
        sortOption = {
          price: 1,
        };
        break;

      case "priceHigh":
        sortOption = {
          price: -1,
        };
        break;

      case "nameAZ":
        sortOption = {
          name: 1,
        };
        break;

      case "nameZA":
        sortOption = {
          name: -1,
        };
        break;

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch product.",
    });
  }
};

// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    const populatedProduct = await Product.findById(
      product._id
    ).populate("category", "name slug");

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "SKU or another unique field already exists.",
      });
    }

    res.status(400).json({
      success: false,
      message:
        error.message || "Unable to create product.",
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "SKU or another unique field already exists.",
      });
    }

    res.status(400).json({
      success: false,
      message:
        error.message || "Unable to update product.",
    });
  }
};

// ==========================================
// DELETE PRODUCT
// ==========================================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete product images
    if (product.images?.length) {
      for (const image of product.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(
              image.publicId
            );
          } catch (cloudinaryError) {
            console.error(
              "Cloudinary image delete error:",
              cloudinaryError.message
            );
          }
        }
      }
    }

    // Delete product videos
    if (product.videos?.length) {
      for (const video of product.videos) {
        if (video.publicId) {
          try {
            await cloudinary.uploader.destroy(
              video.publicId,
              {
                resource_type: "video",
              }
            );
          } catch (cloudinaryError) {
            console.error(
              "Cloudinary video delete error:",
              cloudinaryError.message
            );
          }
        }
      }
    }

    // Delete variant images
    if (product.variants?.length) {
      for (const variant of product.variants) {
        if (variant.images?.length) {
          for (const image of variant.images) {
            if (image.publicId) {
              try {
                await cloudinary.uploader.destroy(
                  image.publicId
                );
              } catch (cloudinaryError) {
                console.error(
                  "Variant Cloudinary delete error:",
                  cloudinaryError.message
                );
              }
            }
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
};

// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================

const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    if (!req.file.mimetype?.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message:
          "Only image files are allowed for this endpoint.",
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message:
          "Product image must be 5 MB or smaller.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const uploadResult = await new Promise(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: "bag-hee-bag/products",
              resource_type: "image",

              transformation: [
                {
                  width: 1400,
                  height: 1400,
                  crop: "limit",
                  quality: "auto",
                  fetch_format: "auto",
                },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        stream.end(req.file.buffer);
      }
    );

    const isPrimary =
      product.images.length === 0;

    product.images.push({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      alt:
        req.body.alt ||
        product.name ||
        "BAG HEE BAG product",
      type: req.body.type || "other",
      isPrimary,
    });

    if (!product.image) {
      product.image =
        uploadResult.secure_url;
    }

    await product.save();

    res.status(201).json({
      success: true,
      message:
        "Product image uploaded successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Product image upload error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload product image.",
    });
  }
};

// ==========================================
// DELETE PRODUCT IMAGE
// ==========================================

const deleteProductImage = async (
  req,
  res
) => {
  try {
    const { id, imageId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(imageId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product or image ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const image =
      product.images.id(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    const wasPrimary = image.isPrimary;
    const publicId = image.publicId;

    image.deleteOne();

    if (
      wasPrimary &&
      product.images.length > 0
    ) {
      product.images[0].isPrimary = true;
      product.image =
        product.images[0].url;
    } else if (
      product.images.length === 0
    ) {
      product.image = "";
    }

    await product.save();

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(
          publicId
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary image deletion error:",
          cloudinaryError.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Product image deleted successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Delete product image error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to delete product image.",
    });
  }
};

// ==========================================
// SET PRIMARY IMAGE
// ==========================================

const setPrimaryImage = async (
  req,
  res
) => {
  try {
    const { id, imageId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(imageId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product or image ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const selectedImage =
      product.images.id(imageId);

    if (!selectedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    product.images.forEach((image) => {
      image.isPrimary =
        image._id.toString() === imageId;
    });

    product.image =
      selectedImage.url;

    await product.save();

    res.status(200).json({
      success: true,
      message:
        "Primary image changed successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Set primary image error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to change primary image.",
    });
  }
};

// ==========================================
// UPLOAD PRODUCT VIDEO
// ==========================================

const uploadProductVideo = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a video.",
      });
    }

    if (
      !req.file.mimetype?.startsWith("video/")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only video files are allowed for this endpoint.",
      });
    }

    if (
      req.file.size >
      50 * 1024 * 1024
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product video must be 50 MB or smaller.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const uploadResult =
      await new Promise(
        (resolve, reject) => {
          const stream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "bag-hee-bag/products/videos",

                resource_type: "video",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          stream.end(
            req.file.buffer
          );
        }
      );

    const videoUrl =
      uploadResult.secure_url ||
      uploadResult.url;

    const isPrimary =
      product.videos.length === 0;

    product.videos.push({
      url: videoUrl,
      publicId:
        uploadResult.public_id || "",

      title:
        req.body.title?.trim() || "",

      type:
        req.body.type || "demo",

      format:
        uploadResult.format ||
        req.file.mimetype
          .split("/")
          .pop() ||
        "",

      duration:
        uploadResult.duration || 0,

      bytes:
        uploadResult.bytes ||
        req.file.size ||
        0,

      isPrimary,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message:
        "Product video uploaded successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Product video upload error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload product video.",
    });
  }
};

// ==========================================
// DELETE PRODUCT VIDEO
// ==========================================

const deleteProductVideo = async (
  req,
  res
) => {
  try {
    const { id, videoId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(videoId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product or video ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const video =
      product.videos.id(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const wasPrimary =
      video.isPrimary;

    const publicId =
      video.publicId;

    video.deleteOne();

    if (
      wasPrimary &&
      product.videos.length > 0
    ) {
      product.videos[0].isPrimary = true;
    }

    await product.save();

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: "video",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary video deletion error:",
          cloudinaryError.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Product video deleted successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Delete product video error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to delete product video.",
    });
  }
};

// ==========================================
// SET PRIMARY VIDEO
// ==========================================

const setPrimaryVideo = async (
  req,
  res
) => {
  try {
    const { id, videoId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(videoId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product or video ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const selectedVideo =
      product.videos.id(videoId);

    if (!selectedVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    product.videos.forEach(
      (video) => {
        video.isPrimary =
          video._id.toString() ===
          videoId;
      }
    );

    await product.save();

    res.status(200).json({
      success: true,
      message:
        "Primary video changed successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Set primary video error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to change primary video.",
    });
  }
};

// ==========================================
// ADD VARIANT
// ==========================================

const addVariant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const {
      name,
      color,
      size,
      sku,
      price,
      discountPrice,
      stock,
      images,
      isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Variant name is required.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (
      sku &&
      product.variants.some(
        (variant) =>
          variant.sku?.toLowerCase() ===
          sku.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Variant SKU already exists.",
      });
    }

    product.variants.push({
      name: name.trim(),
      color: color || "",
      size: size || "",
      sku: sku || "",
      price:
        price === "" ||
        price === undefined
          ? 0
          : Number(price),
      discountPrice:
        discountPrice === "" ||
        discountPrice === undefined
          ? 0
          : Number(discountPrice),
      stock:
        stock === "" ||
        stock === undefined
          ? 0
          : Number(stock),
      images: Array.isArray(images)
        ? images
        : [],
      isActive:
        isActive !== false,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message:
        "Variant added successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Add variant error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to add variant.",
    });
  }
};

// ==========================================
// UPDATE VARIANT
// ==========================================

const updateVariant = async (
  req,
  res
) => {
  try {
    const {
      id,
      variantId,
    } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product or variant ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const variant =
      product.variants.id(
        variantId
      );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found.",
      });
    }

    const {
      name,
      color,
      size,
      sku,
      price,
      discountPrice,
      stock,
      images,
      isActive,
    } = req.body;

    if (name !== undefined) {
      variant.name = name.trim();
    }

    if (color !== undefined) {
      variant.color = color;
    }

    if (size !== undefined) {
      variant.size = size;
    }

    if (sku !== undefined) {
      variant.sku = sku;
    }

    if (
      price !== undefined &&
      price !== ""
    ) {
      variant.price =
        Number(price);
    }

    if (
      discountPrice !==
      undefined
    ) {
      variant.discountPrice =
        discountPrice === ""
          ? 0
          : Number(discountPrice);
    }

    if (stock !== undefined) {
      variant.stock =
        Number(stock);
    }

    if (Array.isArray(images)) {
      variant.images = images;
    }

    if (isActive !== undefined) {
      variant.isActive =
        Boolean(isActive);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message:
        "Variant updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Update variant error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to update variant.",
    });
  }
};

// ==========================================
// DELETE VARIANT
// ==========================================

const deleteVariant = async (
  req,
  res
) => {
  try {
    const {
      id,
      variantId,
    } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(variantId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product or variant ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const variant =
      product.variants.id(
        variantId
      );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found.",
      });
    }

    if (variant.images?.length) {
      for (const image of variant.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(
              image.publicId
            );
          } catch (cloudinaryError) {
            console.error(
              "Variant image deletion error:",
              cloudinaryError.message
            );
          }
        }
      }
    }

    variant.deleteOne();

    await product.save();

    res.status(200).json({
      success: true,
      message:
        "Variant deleted successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Delete variant error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to delete variant.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,

  uploadProductVideo,
  deleteProductVideo,
  setPrimaryVideo,

  addVariant,
  updateVariant,
  deleteVariant,
};