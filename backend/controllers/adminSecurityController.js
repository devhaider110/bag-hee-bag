const bcrypt = require("bcryptjs");

const User = require("../models/User");
const AdminActivity = require("../models/AdminActivity");

const {
  ADMIN_PERMISSIONS,
} = require("../models/User");

// =========================
// ACTIVITY HELPER
// =========================

const logActivity = async ({
  req,
  action,
  category,
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
        targetUser?._id ||
        targetUser ||
        null,
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
        req.headers["user-agent"] ||
        "",
      metadata,
    });
  } catch (error) {
    console.error(
      "Security activity log error:",
      error.message
    );
  }
};

// =========================
// ADMIN SECURITY SUMMARY
// =========================

const getSecuritySummary =
  async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalAdmins,
        verifiedUsers,
        recentActivities,
      ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({
          isActive: true,
        }),

        User.countDocuments({
          isActive: false,
        }),

        User.countDocuments({
          role: "admin",
        }),

        User.countDocuments({
          isVerified: true,
        }),

        AdminActivity.countDocuments({
          createdAt: {
            $gte:
              new Date(
                Date.now() -
                  24 *
                    60 *
                    60 *
                    1000
              ),
          },
        }),
      ]);

      return res.status(200).json({
        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalAdmins,
          verifiedUsers,
          recentActivities,
        },
      });
    } catch (error) {
      console.error(
        "Security summary error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load security summary.",
      });
    }
  };

// =========================
// GET USERS
// =========================

const getSecurityUsers =
  async (req, res) => {
    try {
      const {
        search = "",
        role = "",
        status = "",
        page = 1,
        limit = 20,
      } = req.query;

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const pageLimit =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      const query = {};

      if (search.trim()) {
        const regex =
          new RegExp(
            search.trim(),
            "i"
          );

        query.$or = [
          {
            name: regex,
          },
          {
            email: regex,
          },
          {
            phone: regex,
          },
        ];
      }

      if (
        ["customer", "admin"].includes(
          role
        )
      ) {
        query.role = role;
      }

      if (status === "active") {
        query.isActive = true;
      }

      if (status === "inactive") {
        query.isActive = false;
      }

      const total =
        await User.countDocuments(
          query
        );

      const users =
        await User.find(query)
          .select(
            "-password -sessionVersion"
          )
          .sort({
            createdAt: -1,
          })
          .skip(
            (currentPage - 1) *
              pageLimit
          )
          .limit(pageLimit)
          .lean();

      return res.status(200).json({
        users,
        pagination: {
          page: currentPage,
          limit: pageLimit,
          total,
          pages: Math.ceil(
            total / pageLimit
          ),
        },
      });
    } catch (error) {
      console.error(
        "Security users error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load users.",
      });
    }
  };

// =========================
// UPDATE USER STATUS
// =========================

const updateUserStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        isActive,
      } = req.body;

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          message:
            "isActive must be a boolean.",
        });
      }

      const targetUser =
        await User.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (
        targetUser._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot deactivate your own admin account.",
        });
      }

      targetUser.isActive =
        isActive;

      targetUser.sessionVersion =
        (targetUser.sessionVersion ||
          0) + 1;

      await targetUser.save();

      await logActivity({
        req,
        action: isActive
          ? "USER_ACTIVATED"
          : "USER_DEACTIVATED",
        category: "USER",
        targetUser,
        description: isActive
          ? "User account was activated."
          : "User account was deactivated.",
      });

      return res.status(200).json({
        message: isActive
          ? "User activated successfully."
          : "User deactivated successfully.",
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          isActive:
            targetUser.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update user status.",
      });
    }
  };

// =========================
// UPDATE USER ROLE
// =========================

const updateUserRole =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        role,
      } = req.body;

      if (
        !["customer", "admin"].includes(
          role
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid user role.",
        });
      }

      const targetUser =
        await User.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (
        targetUser._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot change your own admin role.",
        });
      }

      const previousRole =
        targetUser.role;

      targetUser.role = role;

      if (role === "admin") {
        targetUser.permissions =
          ADMIN_PERMISSIONS;
      } else {
        targetUser.permissions =
          [];
      }

      targetUser.sessionVersion =
        (targetUser.sessionVersion ||
          0) + 1;

      await targetUser.save();

      await logActivity({
        req,
        action: "USER_ROLE_CHANGED",
        category: "ROLE",
        targetUser,
        description: `User role changed from ${previousRole} to ${role}.`,
        metadata: {
          previousRole,
          newRole: role,
        },
      });

      return res.status(200).json({
        message:
          "User role updated successfully.",
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          permissions:
            targetUser.permissions,
          isActive:
            targetUser.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Update role error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update user role.",
      });
    }
  };

// =========================
// UPDATE ADMIN PERMISSIONS
// =========================

const updateAdminPermissions =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        permissions,
      } = req.body;

      if (
        !Array.isArray(
          permissions
        )
      ) {
        return res.status(400).json({
          message:
            "Permissions must be an array.",
        });
      }

      const invalidPermissions =
        permissions.filter(
          (permission) =>
            !ADMIN_PERMISSIONS.includes(
              permission
            )
        );

      if (
        invalidPermissions.length
      ) {
        return res.status(400).json({
          message:
            "One or more permissions are invalid.",
          invalidPermissions,
        });
      }

      const targetUser =
        await User.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (
        targetUser.role !== "admin"
      ) {
        return res.status(400).json({
          message:
            "Permissions can only be assigned to admin users.",
        });
      }

      if (
        targetUser._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot change your own admin permissions.",
        });
      }

      const previousPermissions =
        targetUser.permissions || [];

      targetUser.permissions =
        [...new Set(permissions)];

      targetUser.sessionVersion =
        (targetUser.sessionVersion ||
          0) + 1;

      await targetUser.save();

      await logActivity({
        req,
        action:
          "ADMIN_PERMISSIONS_CHANGED",
        category: "PERMISSION",
        targetUser,
        description:
          "Admin permissions were updated.",
        metadata: {
          previousPermissions,
          newPermissions:
            targetUser.permissions,
        },
      });

      return res.status(200).json({
        message:
          "Admin permissions updated successfully.",
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          permissions:
            targetUser.permissions,
        },
      });
    } catch (error) {
      console.error(
        "Update permissions error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update admin permissions.",
      });
    }
  };

// =========================
// RESET USER PASSWORD
// =========================

const resetUserPassword =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        newPassword,
      } = req.body;

      if (
        !newPassword ||
        newPassword.length < 6
      ) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const targetUser =
        await User.findById(id);

      if (!targetUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      targetUser.password =
        await bcrypt.hash(
          newPassword,
          12
        );

      targetUser.sessionVersion =
        (targetUser.sessionVersion ||
          0) + 1;

      await targetUser.save();

      await logActivity({
        req,
        action:
          "USER_PASSWORD_RESET",
        category: "SECURITY",
        targetUser,
        description:
          "An administrator reset the user's password.",
      });

      return res.status(200).json({
        message:
          "User password reset successfully.",
      });
    } catch (error) {
      console.error(
        "Reset user password error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to reset user password.",
      });
    }
  };

// =========================
// GET ADMIN ACTIVITIES
// =========================

const getAdminActivities =
  async (req, res) => {
    try {
      const {
        search = "",
        category = "",
        page = 1,
        limit = 30,
      } = req.query;

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const pageLimit =
        Math.min(
          Math.max(
            Number(limit) || 30,
            1
          ),
          100
        );

      const query = {};

      if (category) {
        query.category =
          category;
      }

      if (search.trim()) {
        const regex =
          new RegExp(
            search.trim(),
            "i"
          );

        query.$or = [
          {
            action: regex,
          },
          {
            actorName: regex,
          },
          {
            actorEmail: regex,
          },
          {
            targetUserName: regex,
          },
          {
            targetUserEmail: regex,
          },
          {
            description: regex,
          },
        ];
      }

      const total =
        await AdminActivity.countDocuments(
          query
        );

      const activities =
        await AdminActivity.find(
          query
        )
          .populate(
            "actor",
            "name email role"
          )
          .populate(
            "targetUser",
            "name email role"
          )
          .sort({
            createdAt: -1,
          })
          .skip(
            (currentPage - 1) *
              pageLimit
          )
          .limit(pageLimit)
          .lean();

      return res.status(200).json({
        activities,
        pagination: {
          page: currentPage,
          limit: pageLimit,
          total,
          pages: Math.ceil(
            total / pageLimit
          ),
        },
      });
    } catch (error) {
      console.error(
        "Admin activities error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load admin activity logs.",
      });
    }
  };

// =========================
// SECURITY INFO
// =========================

const getSecurityInfo =
  async (req, res) => {
    try {
      return res.status(200).json({
        security: {
          jwtConfigured:
            Boolean(
              process.env.JWT_SECRET
            ),
          jwtExpiry: "7d",
          passwordHashing:
            "bcryptjs",
          passwordSaltRounds: 12,
          availablePermissions:
            ADMIN_PERMISSIONS,
          currentAdmin: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            permissions:
              req.user.permissions || [],
            isActive:
              req.user.isActive,
            isVerified:
              req.user.isVerified,
            lastLogin:
              req.user.lastLogin,
          },
        },
      });
    } catch (error) {
      console.error(
        "Security info error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load security information.",
      });
    }
  };

module.exports = {
  getSecuritySummary,
  getSecurityUsers,
  updateUserStatus,
  updateUserRole,
  updateAdminPermissions,
  resetUserPassword,
  getAdminActivities,
  getSecurityInfo,
};