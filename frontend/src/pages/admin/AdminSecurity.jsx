import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import {
  getSecuritySummary,
  getSecurityUsers,
  updateUserStatus,
  updateUserRole,
  updateAdminPermissions,
  getAdminActivities,
} from "../../services/adminSecurityService";

const PERMISSIONS = [
  ["dashboard", "Dashboard"],
  ["products", "Products"],
  ["inventory", "Inventory"],
  ["orders", "Orders"],
  ["customers", "Customers"],
  ["returns", "Returns"],
  ["refunds", "Refunds"],
  ["invoices", "Invoices"],
  ["reports", "Reports & Tax"],
  ["banners", "Banners & Content"],
  [
    "physical_store",
    "Physical Store",
  ],
  ["support", "Support"],
  ["security", "Security"],
];

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
};

const AdminSecurity = () => {
  const {
    token,
    user,
    setUser,
  } = useAuth();

  const [summary, setSummary] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [activityLoading, setActivityLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [savingUserId, setSavingUserId] =
    useState("");

  const [activitySearch, setActivitySearch] =
    useState("");

  const [activityCategory, setActivityCategory] =
    useState("");

  const loadSecurity = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          usersResponse,
        ] = await Promise.all([
          getSecuritySummary(token),

          getSecurityUsers(
            token,
            {
              search,
              role: roleFilter,
              status: statusFilter,
              page: 1,
              limit: 100,
            }
          ),
        ]);

        setSummary(
          summaryResponse?.summary ||
            null
        );

        setUsers(
          usersResponse?.users ||
            []
        );
      } catch (err) {
        console.error(
          "Security page error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load security data."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      token,
      search,
      roleFilter,
      statusFilter,
    ]
  );

  const loadActivities =
    useCallback(
      async () => {
        try {
          setActivityLoading(
            true
          );

          const response =
            await getAdminActivities(
              token,
              {
                search:
                  activitySearch,
                category:
                  activityCategory,
                page: 1,
                limit: 50,
              }
            );

          setActivities(
            response?.activities ||
              []
          );
        } catch (err) {
          console.error(
            "Activity log error:",
            err
          );
        } finally {
          setActivityLoading(
            false
          );
        }
      },
      [
        token,
        activitySearch,
        activityCategory,
      ]
    );

  useEffect(() => {
    loadSecurity();
  }, [loadSecurity]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const stats = useMemo(
    () => [
      {
        label: "Total Users",
        value:
          summary?.totalUsers ??
          0,
      },
      {
        label: "Active Users",
        value:
          summary?.activeUsers ??
          0,
      },
      {
        label: "Inactive Users",
        value:
          summary?.inactiveUsers ??
          0,
      },
      {
        label: "Admins",
        value:
          summary?.totalAdmins ??
          0,
      },
      {
        label: "Verified Users",
        value:
          summary?.verifiedUsers ??
          0,
      },
      {
        label: "24h Activities",
        value:
          summary?.recentActivities ??
          0,
      },
    ],
    [summary]
  );

  const toggleUserStatus =
    async (targetUser) => {
      try {
        setSavingUserId(
          targetUser._id
        );

        const response =
          await updateUserStatus(
            token,
            targetUser._id,
            !targetUser.isActive
          );

        setUsers((current) =>
          current.map((item) =>
            item._id ===
            targetUser._id
              ? {
                  ...item,
                  isActive:
                    response
                      ?.user
                      ?.isActive ??
                    !targetUser.isActive,
                }
              : item
          )
        );

        await loadSecurity();
        await loadActivities();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update user status."
        );
      } finally {
        setSavingUserId("");
      }
    };

  const changeRole =
    async (
      targetUser,
      nextRole
    ) => {
      if (
        targetUser._id ===
        user?.id
      ) {
        alert(
          "You cannot change your own admin role."
        );
        return;
      }

      try {
        setSavingUserId(
          targetUser._id
        );

        const response =
          await updateUserRole(
            token,
            targetUser._id,
            nextRole
          );

        setUsers((current) =>
          current.map((item) =>
            item._id ===
            targetUser._id
              ? {
                  ...item,
                  role:
                    response
                      ?.user
                      ?.role ||
                    nextRole,
                  permissions:
                    response
                      ?.user
                      ?.permissions ||
                    [],
                }
              : item
          )
        );

        await loadSecurity();
        await loadActivities();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update user role."
        );
      } finally {
        setSavingUserId("");
      }
    };

  const togglePermission =
    async (
      targetUser,
      permission
    ) => {
      if (
        targetUser._id ===
        user?.id
      ) {
        alert(
          "You cannot change your own permissions."
        );
        return;
      }

      if (
        targetUser.role !==
        "admin"
      ) {
        return;
      }

      const current =
        targetUser.permissions ||
        [];

      const next =
        current.includes(
          permission
        )
          ? current.filter(
              (item) =>
                item !==
                permission
            )
          : [
              ...current,
              permission,
            ];

      try {
        setSavingUserId(
          targetUser._id
        );

        const response =
          await updateAdminPermissions(
            token,
            targetUser._id,
            next
          );

        const updatedPermissions =
          response
            ?.user
            ?.permissions ||
          next;

        setUsers((currentUsers) =>
          currentUsers.map(
            (item) =>
              item._id ===
              targetUser._id
                ? {
                    ...item,
                    permissions:
                      updatedPermissions,
                  }
                : item
          )
        );

        setSelectedUser(
          (currentSelected) =>
            currentSelected &&
            currentSelected._id ===
              targetUser._id
              ? {
                  ...currentSelected,
                  permissions:
                    updatedPermissions,
                }
              : currentSelected
        );

        await loadActivities();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Unable to update permission."
        );
      } finally {
        setSavingUserId("");
      }
    };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-5">
            <div className="h-10 w-72 rounded-xl bg-white/5" />
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-2xl bg-white/5"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              Module 24
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin, Roles & Security
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Manage administrator access,
              user account security, roles,
              permissions and security activity.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Current Admin
            </p>

            <p className="mt-1 font-medium text-[#e4c76b]">
              {user?.name}
            </p>

            <p className="text-xs text-neutral-600">
              {user?.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}

        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-600">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-semibold text-[#e4c76b]">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* USER SECURITY */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                User & Role Management
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Control account status,
                administrator roles and permissions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search user..."
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/50"
              />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  All roles
                </option>
                <option value="customer">
                  Customer
                </option>
                <option value="admin">
                  Admin
                </option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  All status
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.15em] text-neutral-600">
                  <th className="px-3 py-4">
                    User
                  </th>

                  <th className="px-3 py-4">
                    Role
                  </th>

                  <th className="px-3 py-4">
                    Status
                  </th>

                  <th className="px-3 py-4">
                    Verified
                  </th>

                  <th className="px-3 py-4">
                    Last Login
                  </th>

                  <th className="px-3 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (targetUser) => (
                    <tr
                      key={
                        targetUser._id
                      }
                      className="border-b border-white/5"
                    >
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedUser(
                              targetUser
                            )
                          }
                          className="text-left"
                        >
                          <p className="font-medium text-white hover:text-[#e4c76b]">
                            {
                              targetUser.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-neutral-600">
                            {
                              targetUser.email
                            }
                          </p>
                        </button>
                      </td>

                      <td className="px-3 py-4">
                        <select
                          value={
                            targetUser.role
                          }
                          disabled={
                            targetUser._id ===
                              user?.id ||
                            savingUserId ===
                              targetUser._id
                          }
                          onChange={(e) =>
                            changeRole(
                              targetUser,
                              e.target
                                .value
                            )
                          }
                          className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-xs outline-none disabled:opacity-40"
                        >
                          <option value="customer">
                            Customer
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            targetUser.isActive
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {targetUser.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-xs">
                        {targetUser.isVerified
                          ? "Verified"
                          : "Not verified"}
                      </td>

                      <td className="px-3 py-4 text-xs text-neutral-500">
                        {formatDate(
                          targetUser.lastLogin
                        )}
                      </td>

                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          disabled={
                            targetUser._id ===
                              user?.id ||
                            savingUserId ===
                              targetUser._id
                          }
                          onClick={() =>
                            toggleUserStatus(
                              targetUser
                            )
                          }
                          className={`rounded-xl px-4 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            targetUser.isActive
                              ? "border border-red-400/20 bg-red-400/5 text-red-300 hover:bg-red-400/10"
                              : "border border-emerald-400/20 bg-emerald-400/5 text-emerald-300 hover:bg-emerald-400/10"
                          }`}
                        >
                          {targetUser.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PERMISSIONS */}

        {selectedUser &&
          selectedUser.role ===
            "admin" && (
            <section className="mt-8 rounded-3xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                    Admin Permissions
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {
                      selectedUser.name
                    }
                  </h2>

                  <p className="text-sm text-neutral-500">
                    {
                      selectedUser.email
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedUser(
                      null
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PERMISSIONS.map(
                  ([
                    key,
                    label,
                  ]) => {
                    const enabled =
                      selectedUser.permissions?.includes(
                        key
                      );

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={
                          selectedUser._id ===
                            user?.id ||
                          savingUserId ===
                            selectedUser._id
                        }
                        onClick={() =>
                          togglePermission(
                            selectedUser,
                            key
                          )
                        }
                        className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition disabled:opacity-40 ${
                          enabled
                            ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium">
                            {label}
                          </span>

                          <span className="mt-1 block text-xs text-neutral-600">
                            {key}
                          </span>
                        </span>

                        <span
                          className={`h-5 w-5 rounded-full border ${
                            enabled
                              ? "border-[#d4af37] bg-[#d4af37]"
                              : "border-white/20"
                          }`}
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </section>
          )}

        {/* ACTIVITY LOG */}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Security Activity
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Administrative security and
                account activity history.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={
                  activitySearch
                }
                onChange={(e) =>
                  setActivitySearch(
                    e.target.value
                  )
                }
                placeholder="Search activity..."
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/50"
              />

              <select
                value={
                  activityCategory
                }
                onChange={(e) =>
                  setActivityCategory(
                    e.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  All categories
                </option>

                <option value="AUTH">
                  Auth
                </option>

                <option value="USER">
                  User
                </option>

                <option value="ROLE">
                  Role
                </option>

                <option value="PERMISSION">
                  Permission
                </option>

                <option value="SECURITY">
                  Security
                </option>

                <option value="SYSTEM">
                  System
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {activityLoading ? (
              <div className="py-10 text-center text-sm text-neutral-600">
                Loading activity...
              </div>
            ) : activities.length ===
              0 ? (
              <div className="py-10 text-center text-sm text-neutral-600">
                No security activity found.
              </div>
            ) : (
              activities.map(
                (activity) => (
                  <div
                    key={
                      activity._id
                    }
                    className="rounded-2xl border border-white/5 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#d4af37]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-[#e4c76b]">
                            {
                              activity.category
                            }
                          </span>

                          <span className="text-sm font-semibold text-white">
                            {
                              activity.action
                            }
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-neutral-400">
                          {
                            activity.description
                          }
                        </p>

                        <p className="mt-2 text-xs text-neutral-700">
                          Actor:{" "}
                          {
                            activity.actorName
                          }{" "}
                          ·{" "}
                          {
                            activity.actorEmail
                          }
                        </p>
                      </div>

                      <p className="shrink-0 text-xs text-neutral-600">
                        {formatDate(
                          activity.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminSecurity;