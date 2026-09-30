const express = require("express");

const {
  protect,
  requireAdminPermission,
} = require("../middleware/authMiddleware");

const {
  getSecuritySummary,
  getSecurityUsers,
  updateUserStatus,
  updateUserRole,
  updateAdminPermissions,
  resetUserPassword,
  getAdminActivities,
  getSecurityInfo,
} = require("../controllers/adminSecurityController");

const router =
  express.Router();

router.use(
  protect,
  requireAdminPermission(
    "security"
  )
);

router.get(
  "/summary",
  getSecuritySummary
);

router.get(
  "/users",
  getSecurityUsers
);

router.patch(
  "/users/:id/status",
  updateUserStatus
);

router.patch(
  "/users/:id/role",
  updateUserRole
);

router.patch(
  "/users/:id/permissions",
  updateAdminPermissions
);

router.patch(
  "/users/:id/password",
  resetUserPassword
);

router.get(
  "/activities",
  getAdminActivities
);

router.get(
  "/info",
  getSecurityInfo
);

module.exports = router;