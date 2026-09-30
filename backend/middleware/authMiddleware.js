const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Not authorized. Please login.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message:
          "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user =
      await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message:
          "User no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been disabled.",
      });
    }

    /*
     * Invalidate old JWTs after:
     * password change
     * role change
     * permission change
     * account security changes
     */
    if (
      typeof decoded.sessionVersion ===
        "number" &&
      decoded.sessionVersion !==
        (user.sessionVersion || 0)
    ) {
      return res.status(401).json({
        message:
          "Your session has expired because your account security settings changed. Please login again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        message:
          "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      message:
        "Invalid authentication token.",
    });
  }
};

// =========================
// ADMIN ONLY
// =========================

const adminOnly = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      message:
        "Admin access required.",
    });
  }

  next();
};

// =========================
// ADMIN PERMISSION
// =========================

const requireAdminPermission = (
  permission
) => {
  return (
    req,
    res,
    next
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    if (
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Admin access required.",
      });
    }

    /*
     * Security admin always gets access
     * to every admin permission.
     */
    if (
      permission === "security"
    ) {
      if (
        req.user.permissions?.includes(
          "security"
        )
      ) {
        return next();
      }
    }

    if (
      !Array.isArray(
        req.user.permissions
      )
    ) {
      return res.status(403).json({
        message:
          "You do not have the required admin permission.",
      });
    }

    if (
      !req.user.permissions.includes(
        permission
      )
    ) {
      return res.status(403).json({
        message:
          "You do not have the required admin permission.",
        requiredPermission:
          permission,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  adminOnly,
  requireAdminPermission,
};