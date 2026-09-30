import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const {
    login,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // REDIRECT AFTER AUTH
  // =========================

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const destination = isAdmin
      ? "/admin"
      : "/account";

    if (window.location.pathname !== destination) {
      window.history.replaceState(
        {},
        "",
        destination
      );

      window.dispatchEvent(
        new PopStateEvent("popstate")
      );
    }
  }, [isAuthenticated, isAdmin]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login(form);

      if (!response?.token) {
        throw new Error(
          "Login succeeded but no authentication token was received."
        );
      }

      if (!response?.user) {
        throw new Error(
          "Login succeeded but user information was not received."
        );
      }

      const destination =
        response.user.role === "admin"
          ? "/admin"
          : "/account";

      window.history.pushState(
        {},
        "",
        destination
      );

      window.dispatchEvent(
        new PopStateEvent("popstate")
      );
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again."
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
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Sign in to continue shopping.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#c9a45c] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#d9bd82] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-white/50">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/register"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
              className="font-medium text-[#d9bd82] hover:text-white"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;