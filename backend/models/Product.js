const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    type: {
      type: String,
      enum: [
        "front",
        "back",
        "side",
        "inside",
        "handle",
        "lifestyle",
        "feature",
        "other",
      ],
      default: "other",
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| PRODUCT VIDEO
|--------------------------------------------------------------------------
*/

const productVideoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    type: {
      type: String,
      enum: [
        "demo",
        "lifestyle",
        "360",
        "reel",
        "other",
      ],
      default: "demo",
    },

    format: {
      type: String,
      default: "",
      trim: true,
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    bytes: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| PRODUCT VARIANT
|--------------------------------------------------------------------------
|
| Variants are kept in Product model because variants belong to the product.
| They are NOT managed from ProductMediaVariants.jsx anymore.
|
*/

const productVariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: [
      {
        url: {
          type: String,
          default: "",
          trim: true,
        },

        publicId: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| PRODUCT SCHEMA
|--------------------------------------------------------------------------
*/

const productSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    brand: {
      type: String,
      default: "BAG HEE BAG",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT SPECIFICATIONS
    |--------------------------------------------------------------------------
    */

    material: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    dimensions: {
      length: {
        type: Number,
        default: null,
      },

      width: {
        type: Number,
        default: null,
      },

      height: {
        type: Number,
        default: null,
      },

      unit: {
        type: String,
        default: "cm",
        trim: true,
      },
    },

    weight: {
      value: {
        type: Number,
        default: null,
      },

      unit: {
        type: String,
        default: "g",
        trim: true,
      },
    },

    waterResistance: {
      type: String,
      default: "",
      trim: true,
    },

    closureType: {
      type: String,
      default: "",
      trim: true,
    },

    strapType: {
      type: String,
      default: "",
      trim: true,
    },

    compartments: {
      type: Number,
      default: 0,
      min: 0,
    },

    pockets: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT DETAILS
    |--------------------------------------------------------------------------
    */

    suitableFor: {
      type: String,
      default: "",
      trim: true,
    },

    interiorDetails: {
      type: String,
      default: "",
      trim: true,
    },

    exteriorDetails: {
      type: String,
      default: "",
      trim: true,
    },

    careInstructions: {
      type: String,
      default: "",
      trim: true,
    },

    productHighlights: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | WARRANTY / RETURN
    |--------------------------------------------------------------------------
    */

    countryOfOrigin: {
      type: String,
      default: "India",
      trim: true,
    },

    warranty: {
      type: String,
      default: "",
      trim: true,
    },

    returnEligibility: {
      type: String,
      default: "",
      trim: true,
    },

    whatsIncluded: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | MAIN IMAGE
    |--------------------------------------------------------------------------
    */

    image: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT GALLERY IMAGES
    |--------------------------------------------------------------------------
    */

    images: {
      type: [productImageSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT VIDEOS
    |--------------------------------------------------------------------------
    */

    videos: {
      type: [productVideoSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT VARIANTS
    |--------------------------------------------------------------------------
    |
    | Variant data stays here in Product model.
    | UI management will be handled from ProductForm,
    | NOT ProductMediaVariants.
    |
    */

    variants: {
      type: [productVariantSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | STORE VISIBILITY
    |--------------------------------------------------------------------------
    */

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);