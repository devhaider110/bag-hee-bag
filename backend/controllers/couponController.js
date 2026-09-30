// const Coupon = require("../models/Coupon");

// // ==========================================
// // ADMIN - GET ALL COUPONS
// // ==========================================
// const getCoupons = async (req, res) => {
//   try {
//     const coupons = await Coupon.find().sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       coupons,
//     });
//   } catch (error) {
//     console.error("Get coupons error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch coupons.",
//     });
//   }
// };

// // ==========================================
// // ADMIN - CREATE COUPON
// // ==========================================
// const createCoupon = async (req, res) => {
//   try {
//     const {
//       code,
//       description,
//       discountType,
//       discountValue,
//       minOrderValue,
//       maxDiscount,
//       usageLimit,
//       perUserLimit,
//       startDate,
//       endDate,
//       isActive,
//     } = req.body;

//     if (!code || !discountType || discountValue === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Code, discount type and discount value are required.",
//       });
//     }

//     if (!["percentage", "fixed"].includes(discountType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid discount type.",
//       });
//     }

//     const numericDiscountValue = Number(discountValue);

//     if (
//       !Number.isFinite(numericDiscountValue) ||
//       numericDiscountValue <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Discount value must be a valid number greater than 0.",
//       });
//     }

//     if (discountType === "percentage" && numericDiscountValue > 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Percentage discount cannot exceed 100%.",
//       });
//     }

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Start date and end date are required.",
//       });
//     }

//     const parsedStartDate = new Date(startDate);
//     const parsedEndDate = new Date(endDate);

//     if (
//       Number.isNaN(parsedStartDate.getTime()) ||
//       Number.isNaN(parsedEndDate.getTime())
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid start or end date.",
//       });
//     }

//     if (parsedEndDate <= parsedStartDate) {
//       return res.status(400).json({
//         success: false,
//         message: "End date must be after start date.",
//       });
//     }

//     const normalizedCode = code.trim().toUpperCase();

//     if (!normalizedCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code cannot be empty.",
//       });
//     }

//     const existingCoupon = await Coupon.findOne({
//       code: normalizedCode,
//     });

//     if (existingCoupon) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code already exists.",
//       });
//     }

//     const numericMinOrderValue =
//       minOrderValue !== undefined ? Number(minOrderValue) : 0;

//     const numericMaxDiscount =
//       maxDiscount !== undefined ? Number(maxDiscount) : 0;

//     const numericUsageLimit =
//       usageLimit !== undefined ? Number(usageLimit) : 0;

//     const numericPerUserLimit =
//       perUserLimit !== undefined ? Number(perUserLimit) : 1;

//     if (!Number.isFinite(numericMinOrderValue) || numericMinOrderValue < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Minimum order value must be 0 or greater.",
//       });
//     }

//     if (!Number.isFinite(numericMaxDiscount) || numericMaxDiscount < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Maximum discount must be 0 or greater.",
//       });
//     }

//     if (!Number.isFinite(numericUsageLimit) || numericUsageLimit < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Usage limit must be 0 or greater.",
//       });
//     }

//     if (!Number.isFinite(numericPerUserLimit) || numericPerUserLimit < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Per-user limit must be at least 1.",
//       });
//     }

//     const coupon = await Coupon.create({
//       code: normalizedCode,
//       description: description || "",
//       discountType,
//       discountValue: numericDiscountValue,
//       minOrderValue: numericMinOrderValue,
//       maxDiscount: numericMaxDiscount,
//       usageLimit: numericUsageLimit,
//       perUserLimit: numericPerUserLimit,
//       startDate: parsedStartDate,
//       endDate: parsedEndDate,
//       isActive: isActive !== undefined ? Boolean(isActive) : true,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Coupon created successfully.",
//       coupon,
//     });
//   } catch (error) {
//     console.error("Create coupon error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to create coupon.",
//     });
//   }
// };

// // ==========================================
// // ADMIN - UPDATE COUPON
// // ==========================================
// const updateCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       code,
//       description,
//       discountType,
//       discountValue,
//       minOrderValue,
//       maxDiscount,
//       usageLimit,
//       perUserLimit,
//       startDate,
//       endDate,
//       isActive,
//     } = req.body;

//     const coupon = await Coupon.findById(id);

//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: "Coupon not found.",
//       });
//     }

//     const normalizedCode = code ? code.trim().toUpperCase() : coupon.code;

//     if (!normalizedCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Coupon code cannot be empty.",
//       });
//     }

//     if (normalizedCode !== coupon.code) {
//       const existingCoupon = await Coupon.findOne({
//         code: normalizedCode,
//         _id: { $ne: id },
//       });

//       if (existingCoupon) {
//         return res.status(400).json({
//           success: false,
//           message: "Coupon code already exists.",
//         });
//       }
//     }

//     const newDiscountType = discountType || coupon.discountType;

//     const newDiscountValue =
//       discountValue !== undefined
//         ? Number(discountValue)
//         : coupon.discountValue;

//     const newStartDate =
//       startDate !== undefined ? new Date(startDate) : coupon.startDate;

//     const newEndDate =
//       endDate !== undefined ? new Date(endDate) : coupon.endDate;

//     if (!["percentage", "fixed"].includes(newDiscountType)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid discount type.",
//       });
//     }

//     if (
//       !Number.isFinite(newDiscountValue) ||
//       newDiscountValue <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Discount value must be a valid number greater than 0.",
//       });
//     }

//     if (newDiscountType === "percentage" && newDiscountValue > 100) {
//       return res.status(400).json({
//         success: false,
//         message: "Percentage discount cannot exceed 100%.",
//       });
//     }

//     if (
//       Number.isNaN(newStartDate.getTime()) ||
//       Number.isNaN(newEndDate.getTime())
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid start or end date.",
//       });
//     }

//     if (newEndDate <= newStartDate) {
//       return res.status(400).json({
//         success: false,
//         message: "End date must be after start date.",
//       });
//     }

//     const newMinOrderValue =
//       minOrderValue !== undefined
//         ? Number(minOrderValue)
//         : coupon.minOrderValue;

//     const newMaxDiscount =
//       maxDiscount !== undefined ? Number(maxDiscount) : coupon.maxDiscount;

//     const newUsageLimit =
//       usageLimit !== undefined ? Number(usageLimit) : coupon.usageLimit;

//     const newPerUserLimit =
//       perUserLimit !== undefined ? Number(perUserLimit) : coupon.perUserLimit;

//     if (!Number.isFinite(newMinOrderValue) || newMinOrderValue < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Minimum order value must be 0 or greater.",
//       });
//     }

//     if (!Number.isFinite(newMaxDiscount) || newMaxDiscount < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Maximum discount must be 0 or greater.",
//       });
//     }

//     if (!Number.isFinite(newUsageLimit) || newUsageLimit < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Usage limit must be 0 or greater.",
//       });
//     }

//     if (!Number.isFinite(newPerUserLimit) || newPerUserLimit < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Per-user limit must be at least 1.",
//       });
//     }

//     coupon.code = normalizedCode;

//     coupon.description =
//       description !== undefined ? description : coupon.description;

//     coupon.discountType = newDiscountType;
//     coupon.discountValue = newDiscountValue;
//     coupon.minOrderValue = newMinOrderValue;
//     coupon.maxDiscount = newMaxDiscount;
//     coupon.usageLimit = newUsageLimit;
//     coupon.perUserLimit = newPerUserLimit;
//     coupon.startDate = newStartDate;
//     coupon.endDate = newEndDate;

//     if (isActive !== undefined) {
//       coupon.isActive = Boolean(isActive);
//     }

//     await coupon.save();

//     return res.status(200).json({
//       success: true,
//       message: "Coupon updated successfully.",
//       coupon,
//     });
//   } catch (error) {
//     console.error("Update coupon error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update coupon.",
//     });
//   }
// };

// // ==========================================
// // ADMIN - TOGGLE COUPON
// // ==========================================
// const toggleCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const coupon = await Coupon.findById(id);

//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: "Coupon not found.",
//       });
//     }

//     coupon.isActive = !coupon.isActive;

//     await coupon.save();

//     return res.status(200).json({
//       success: true,
//       message: `Coupon ${
//         coupon.isActive ? "activated" : "deactivated"
//       } successfully.`,
//       coupon,
//     });
//   } catch (error) {
//     console.error("Toggle coupon error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update coupon status.",
//     });
//   }
// };

// // ==========================================
// // ADMIN - DELETE COUPON
// // ==========================================
// const deleteCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const coupon = await Coupon.findById(id);

//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: "Coupon not found.",
//       });
//     }

//     await coupon.deleteOne();

//     return res.status(200).json({
//       success: true,
//       message: "Coupon deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Delete coupon error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete coupon.",
//     });
//   }
// };

// // ==========================================
// // CUSTOMER - VALIDATE COUPON
// // ==========================================
// const validateCoupon = async (req, res) => {
//   try {
//     const { code, cartValue } = req.body;

//     if (!code) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a coupon code.",
//       });
//     }

//     const subtotal = Number(cartValue);

//     if (!Number.isFinite(subtotal) || subtotal < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid cart value.",
//       });
//     }

//     const normalizedCode = code.trim().toUpperCase();

//     if (!normalizedCode) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a coupon code.",
//       });
//     }

//     const coupon = await Coupon.findOne({
//       code: normalizedCode,
//     });

//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid coupon code.",
//       });
//     }

//     if (!coupon.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "This coupon is currently inactive.",
//       });
//     }

//     const now = new Date();

//     if (now < coupon.startDate) {
//       return res.status(400).json({
//         success: false,
//         message: "This coupon is not active yet.",
//       });
//     }

//     if (now > coupon.endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "This coupon has expired.",
//       });
//     }

//     if (subtotal < coupon.minOrderValue) {
//       return res.status(400).json({
//         success: false,
//         message: `Minimum order value is ₹${coupon.minOrderValue}.`,
//       });
//     }

//     if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
//       return res.status(400).json({
//         success: false,
//         message: "This coupon has reached its usage limit.",
//       });
//     }

//     let discount = 0;

//     if (coupon.discountType === "percentage") {
//       discount = (subtotal * coupon.discountValue) / 100;

//       if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
//         discount = coupon.maxDiscount;
//       }
//     } else {
//       discount = coupon.discountValue;
//     }

//     discount = Math.min(discount, subtotal);
//     discount = Number(discount.toFixed(2));

//     const total = Number(Math.max(0, subtotal - discount).toFixed(2));

//     return res.status(200).json({
//       success: true,
//       message: "Coupon applied successfully.",
//       coupon: {
//         id: coupon._id,
//         code: coupon.code,
//         description: coupon.description,
//         discountType: coupon.discountType,
//         discountValue: coupon.discountValue,
//       },
//       discount,
//       subtotal,
//       total,
//     });
//   } catch (error) {
//     console.error("Validate coupon error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to validate coupon.",
//     });
//   }
// };

// // ==========================================
// // EXPORTS
// // ==========================================
// module.exports = {
//   getCoupons,
//   createCoupon,
//   updateCoupon,
//   toggleCoupon,
//   deleteCoupon,
//   validateCoupon,
// };

const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");

// ==========================================
// PUBLIC - GET ACTIVE OFFERS
// ==========================================
const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();

    const offers = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: 0 },
        {
          $expr: {
            $lt: ["$usedCount", "$usageLimit"],
          },
        },
      ],
    })
      .select(
        "code description discountType discountValue minOrderValue maxDiscount usageLimit usedCount perUserLimit startDate endDate isActive"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    console.error("Get active offers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active offers.",
    });
  }
};

// ==========================================
// ADMIN - GET ALL COUPONS
// ==========================================
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons.",
    });
  }
};

// ==========================================
// ADMIN - CREATE COUPON
// ==========================================
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    if (!["percentage", "fixed"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type.",
      });
    }

    const numericDiscountValue = Number(discountValue);

    if (
      Number.isNaN(numericDiscountValue) ||
      numericDiscountValue <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0.",
      });
    }

    if (
      discountType === "percentage" &&
      numericDiscountValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon dates.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    const numericMinOrder = Number(minOrderValue || 0);
    const numericMaxDiscount = Number(maxDiscount || 0);
    const numericUsageLimit = Number(usageLimit || 0);
    const numericPerUserLimit = Number(perUserLimit || 1);

    if (numericMinOrder < 0) {
      return res.status(400).json({
        success: false,
        message: "Minimum order value cannot be negative.",
      });
    }

    if (numericMaxDiscount < 0) {
      return res.status(400).json({
        success: false,
        message: "Maximum discount cannot be negative.",
      });
    }

    if (numericUsageLimit < 0) {
      return res.status(400).json({
        success: false,
        message: "Usage limit cannot be negative.",
      });
    }

    if (numericPerUserLimit < 1) {
      return res.status(400).json({
        success: false,
        message: "Per-user limit must be at least 1.",
      });
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      description: description || "",
      discountType,
      discountValue: numericDiscountValue,
      minOrderValue: numericMinOrder,
      maxDiscount: numericMaxDiscount,
      usageLimit: numericUsageLimit,
      usedCount: 0,
      perUserLimit: numericPerUserLimit,
      startDate: start,
      endDate: end,
      isActive:
        typeof isActive === "boolean" ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create coupon.",
    });
  }
};

// ==========================================
// ADMIN - UPDATE COUPON
// ==========================================
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (code !== undefined) {
      const normalizedCode = code.trim().toUpperCase();

      const duplicate = await Coupon.findOne({
        code: normalizedCode,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Coupon code already exists.",
        });
      }

      coupon.code = normalizedCode;
    }

    if (description !== undefined) {
      coupon.description = description;
    }

    if (discountType !== undefined) {
      if (!["percentage", "fixed"].includes(discountType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type.",
        });
      }

      coupon.discountType = discountType;
    }

    if (discountValue !== undefined) {
      const value = Number(discountValue);

      if (Number.isNaN(value) || value <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be greater than 0.",
        });
      }

      if (
        coupon.discountType === "percentage" &&
        value > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100.",
        });
      }

      coupon.discountValue = value;
    }

    if (minOrderValue !== undefined) {
      const value = Number(minOrderValue);

      if (value < 0) {
        return res.status(400).json({
          success: false,
          message: "Minimum order value cannot be negative.",
        });
      }

      coupon.minOrderValue = value;
    }

    if (maxDiscount !== undefined) {
      const value = Number(maxDiscount);

      if (value < 0) {
        return res.status(400).json({
          success: false,
          message: "Maximum discount cannot be negative.",
        });
      }

      coupon.maxDiscount = value;
    }

    if (usageLimit !== undefined) {
      const value = Number(usageLimit);

      if (value < 0) {
        return res.status(400).json({
          success: false,
          message: "Usage limit cannot be negative.",
        });
      }

      coupon.usageLimit = value;
    }

    if (perUserLimit !== undefined) {
      const value = Number(perUserLimit);

      if (value < 1) {
        return res.status(400).json({
          success: false,
          message: "Per-user limit must be at least 1.",
        });
      }

      coupon.perUserLimit = value;
    }

    if (startDate !== undefined) {
      coupon.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      coupon.endDate = new Date(endDate);
    }

    if (
      Number.isNaN(coupon.startDate.getTime()) ||
      Number.isNaN(coupon.endDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon dates.",
      });
    }

    if (coupon.endDate <= coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date.",
      });
    }

    if (isActive !== undefined) {
      coupon.isActive = Boolean(isActive);
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon.",
    });
  }
};

// ==========================================
// ADMIN - TOGGLE COUPON
// ==========================================
const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: coupon.isActive
        ? "Coupon activated successfully."
        : "Coupon deactivated successfully.",
      coupon,
    });
  } catch (error) {
    console.error("Toggle coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to toggle coupon.",
    });
  }
};

// ==========================================
// ADMIN - DELETE COUPON
// ==========================================
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await CouponUsage.deleteMany({
      coupon: coupon._id,
    });

    await coupon.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
    });
  }
};

// ==========================================
// CUSTOMER - VALIDATE COUPON
// ==========================================
const validateCoupon = async (req, res) => {
  try {
    const { code, cartValue } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const numericCartValue = Number(cartValue);

    if (
      Number.isNaN(numericCartValue) ||
      numericCartValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart value.",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    const now = new Date();

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive.",
      });
    }

    if (now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet.",
      });
    }

    if (now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    if (
      numericCartValue < coupon.minOrderValue
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${coupon.minOrderValue}.`,
      });
    }

    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon usage limit has been reached.",
      });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (numericCartValue * coupon.discountValue) /
        100;

      if (
        coupon.maxDiscount > 0 &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    if (discount > numericCartValue) {
      discount = numericCartValue;
    }

    const total =
      numericCartValue - discount;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
      },
      discount,
      total,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon.",
    });
  }
};

module.exports = {
  getActiveOffers,
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
};