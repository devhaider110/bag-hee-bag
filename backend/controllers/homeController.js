const Product = require("../models/Product");

const getHomeData = async (req, res) => {
  try {
    // =====================================================
    // LOAD HOME PRODUCTS
    // =====================================================

    const [
      featuredProducts,
      newArrivals,
      bestSellers,
    ] = await Promise.all([
      // Featured Products
      Product.find({
        isActive: true,
        isFeatured: true,
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      // New Arrivals
      Product.find({
        isActive: true,
        isNewArrival: true,
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      // Best Sellers
      Product.find({
        isActive: true,
        isBestSeller: true,
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    // =====================================================
    // HOME DATA
    // =====================================================

    const homeData = {
      announcement:
        "Welcome to BAG HEE BAG — Your Style, Your Bag.",

      hero: {
        title: "Carry Your Style",
        subtitle:
          "Discover elegant handbags, travel essentials and everyday bags made for every journey.",
        buttonText: "Shop Now",
      },

      categories: [
        {
          name: "Ladies Bags",
          description:
            "Elegant bags for every occasion",
          slug: "ladies",
        },
        {
          name: "Men's Bags",
          description:
            "Smart and practical everyday bags",
          slug: "men",
        },
        {
          name: "Travel Bags",
          description:
            "Travel with comfort and confidence",
          slug: "travel",
        },
        {
          name: "School & College",
          description:
            "Reliable bags for everyday learning",
          slug: "school-college",
        },
        {
          name: "Wedding & Party",
          description:
            "Complete your special occasion look",
          slug: "wedding-party",
        },
      ],

      // ===================================================
      // DYNAMIC PRODUCT SECTIONS
      // ===================================================

      featuredProducts,
      newArrivals,
      bestSellers,

      // ===================================================
      // OFFER
      // ===================================================

      offer: {
        title: "Find Your Perfect Bag",
        description:
          "Explore our collection and discover a bag that matches your style.",
        buttonText: "Explore Collection",
      },

      // ===================================================
      // WHY CHOOSE US
      // ===================================================

      whyChooseUs: [
        {
          title: "Quality Collection",
          description:
            "Carefully selected bags for style and everyday use.",
        },
        {
          title: "Wide Variety",
          description:
            "Bags for fashion, work, travel, school and special occasions.",
        },
        {
          title: "Trusted Store",
          description:
            "Shop online or visit our physical BHB store in Mumbai.",
        },
        {
          title: "Customer Support",
          description:
            "We are here to help you choose the right bag.",
        },
      ],

      // ===================================================
      // PHYSICAL STORE
      // ===================================================

      store: {
        name: "BAG HEE BAG",
        address:
          "Kothari Milestone, Shop No. 2, S.V. Road, Malad West, Mumbai",
        description:
          "Visit our physical store and explore our collection in person.",
      },
    };

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      data: homeData,
    });
  } catch (error) {
    console.error(
      "Home data loading error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load home page data",
    });
  }
};

module.exports = {
  getHomeData,
};