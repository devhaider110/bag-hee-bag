import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  updateUserProfile,
  changeUserPassword,
} from "../../services/authService";

const Account = () => {
  const { user, token, setUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (profile.name.trim().length < 2) {
      setProfileError("Name must contain at least 2 characters.");
      return;
    }

    try {
      setProfileLoading(true);

      const response = await updateUserProfile(token, {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      });

      setUser(response.user);

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Unable to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!passwords.currentPassword || !passwords.newPassword) {
      setPasswordError("Please fill both password fields.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await changeUserPassword(token, passwords);

      setPasswordMessage(
        response.message || "Password changed successfully."
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="text-center">
          <p className="text-lg text-white/70">
            Please login to view your account.
          </p>

          <a
            href="/login"
            className="mt-4 inline-block rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
            BAG HEE BAG
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            My Account
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Manage your profile and account security.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Profile */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="mt-1 text-sm text-white/45">
                Update your basic account details.
              </p>
            </div>

            {profileError && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Email Address
                </label>

                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/40"
                />

                <p className="mt-2 text-xs text-white/35">
                  Email cannot be changed from this page.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/70"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full rounded-xl bg-[#d4af37] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#e6c34f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          {/* Security */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Account Security</h2>
              <p className="mt-1 text-sm text-white/45">
                Keep your BAG HEE BAG account secure.
              </p>
            </div>

            {passwordError && (
              <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d4af37]/70"
                />

                <p className="mt-2 text-xs text-white/35">
                  Minimum 6 characters.
                </p>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/10 px-5 py-3.5 text-sm font-semibold text-[#e6c34f] transition hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-3 text-sm font-medium text-white/70">
                Account Actions
              </p>

              <button
                type="button"
                onClick={logout}
                className="w-full rounded-xl border border-red-400/20 bg-red-500/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          </section>
        </div>

        {/* Account info */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-white/40">Account Type: </span>
              <span className="font-medium capitalize text-white/80">
                {user.role || "customer"}
              </span>
            </div>

            <div>
              <span className="text-white/40">Verification: </span>
              <span className="font-medium text-white/80">
                {user.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;