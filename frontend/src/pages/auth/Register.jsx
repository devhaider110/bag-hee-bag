import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const {
    register,
    isAuthenticated,
  } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // REDIRECT IF ALREADY LOGIN
  // =========================

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (window.location.pathname !== "/account") {
      window.history.replaceState(
        {},
        "",
        "/account"
      );

      window.dispatchEvent(
        new PopStateEvent("popstate")
      );
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      if (!response?.token) {
        throw new Error(
          "Registration succeeded but no authentication token was received."
        );
      }

      window.history.pushState(
        {},
        "",
        "/account"
      );

      window.dispatchEvent(
        new PopStateEvent("popstate")
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a45c]">
              BAG HEE BAG
            </p>

            <h1 className="mt-3 font-serif text-3xl font-semibold">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Join us and start shopping.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Full name"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Email address"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
            />

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder="Phone number (optional)"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Password"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
            />

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Confirm password"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-[#c9a45c] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#d9bd82] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-white/50">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/login"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
              className="font-medium text-[#d9bd82] hover:text-white"
            >
              Sign In
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Register;