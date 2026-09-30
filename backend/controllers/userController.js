const bcrypt = require("bcryptjs");

const User = require("../models/User");
const AdminActivity = require("../models/AdminActivity");

// =========================
// ACTIVITY HELPER
// =========================

const createAdminActivity = async ({
  req,
  action,
  category = "SECURITY",
  targetUser = null,
  description = "",
  metadata = {},
}) => {
  try {
    await AdminActivity.create({
      actor: req.user?._id || null,
      actorName: req.user?.name || "",
      actorEmail: req.user?.email || "",
      action,
      category,
      targetUser:
        targetUser?._id || targetUser || null,
      targetUserName:
        targetUser?.name || "",
      targetUserEmail:
        targetUser?.email || "",
      description,
      ipAddress:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        "",
      userAgent:
        req.headers["user-agent"] || "",
      metadata,
    });
  } catch (error) {
    console.error(
      "Admin activity log failed:",
      error.message
    );
  }
};

// =========================
// GET MY PROFILE
// =========================

const getMe = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user._id
      ).select("-password");

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load profile.",
    });
  }
};

// =========================
// UPDATE MY PROFILE
// =========================

const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      phone,
      avatar,
    } = req.body;

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    if (name !== undefined) {
      if (
        name.trim().length < 2
      ) {
        return res.status(400).json({
          message:
            "Name must contain at least 2 characters.",
        });
      }

      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone =
        phone.trim();
    }

    if (avatar !== undefined) {
      user.avatar =
        avatar.trim();
    }

    await user.save();

    return res.status(200).json({
      message:
        "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions:
          user.permissions || [],
        avatar: user.avatar,
        isActive:
          user.isActive,
        isVerified:
          user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update profile.",
    });
  }
};

// =========================
// CHANGE PASSWORD
// =========================

const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required.",
      });
    }

    if (
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters.",
      });
    }

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect.",
      });
    }

    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );

    user.sessionVersion =
      (user.sessionVersion || 0) + 1;

    await user.save();

    await createAdminActivity({
      req,
      action: "PASSWORD_CHANGED",
      category: "SECURITY",
      targetUser: user,
      description:
        "User changed their account password.",
    });

    return res.status(200).json({
      message:
        "Password changed successfully. Please login again.",
      requiresLogin: true,
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to change password.",
    });
  }
};

module.exports = {
  getMe,
  updateProfile,
  changePassword,
};