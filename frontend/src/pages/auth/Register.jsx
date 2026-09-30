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

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

  // =========================
  // HANDLE INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // HANDLE REGISTER
  // =========================

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

  // =========================
  // GO TO LOGIN
  // =========================

  const handleSignIn = () => {
    window.history.pushState(
      {},
      "",
      "/login"
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  };

  // =========================
  // ALREADY AUTHENTICATED
  // =========================

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          {/* =========================
              HEADER
          ========================= */}

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

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* =========================
              REGISTER FORM
          ========================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* NAME */}

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

            {/* EMAIL */}

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

            {/* PHONE */}

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder="Phone number (optional)"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
            />

            {/* =========================
                PASSWORD
            ========================= */}

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Password"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
              />

              {/* SHOW / HIDE PASSWORD */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/5 hover:text-[#d9bd82] focus:outline-none focus:ring-1 focus:ring-[#c9a45c]/50"
              >
                {showPassword ? (
                  /* EYE OFF */

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M3 3l18 18" />

                    <path d="M10.58 10.58a2 2 0 102.84 2.84" />

                    <path d="M9.88 4.24A10.94 10.94 0 0112 4c5.23 0 8.85 4.45 9.78 5.45a1 1 0 010 1.1 15.8 15.8 0 01-4.02 3.63" />

                    <path d="M6.61 6.61A15.8 15.8 0 002.22 10.45a1 1 0 000 1.1C3.15 12.55 6.77 17 12 17c1.61 0 3.04-.36 4.29-.91" />
                  </svg>
                ) : (
                  /* EYE */

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M2.22 10.45C3.15 9.45 6.77 5 12 5s8.85 4.45 9.78 5.45a1 1 0 010 1.1C20.85 12.55 17.23 17 12 17s-8.85-4.45-9.78-5.45a1 1 0 010-1.1z" />

                    <circle
                      cx="12"
                      cy="11"
                      r="3"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* =========================
                CONFIRM PASSWORD
            ========================= */}

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm password"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c9a45c]/60"
              />

              {/* SHOW / HIDE CONFIRM PASSWORD */}

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                title={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/5 hover:text-[#d9bd82] focus:outline-none focus:ring-1 focus:ring-[#c9a45c]/50"
              >
                {showConfirmPassword ? (
                  /* EYE OFF */

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M3 3l18 18" />

                    <path d="M10.58 10.58a2 2 0 102.84 2.84" />

                    <path d="M9.88 4.24A10.94 10.94 0 0112 4c5.23 0 8.85 4.45 9.78 5.45a1 1 0 010 1.1 15.8 15.8 0 01-4.02 3.63" />

                    <path d="M6.61 6.61A15.8 15.8 0 002.22 10.45a1 1 0 000 1.1C3.15 12.55 6.77 17 12 17c1.61 0 3.04-.36 4.29-.91" />
                  </svg>
                ) : (
                  /* EYE */

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M2.22 10.45C3.15 9.45 6.77 5 12 5s8.85 4.45 9.78 5.45a1 1 0 010 1.1C20.85 12.55 17.23 17 12 17s-8.85-4.45-9.78-5.45a1 1 0 010-1.1z" />

                    <circle
                      cx="12"
                      cy="11"
                      r="3"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* =========================
                SUBMIT
            ========================= */}

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

          {/* =========================
              LOGIN LINK
          ========================= */}

          <div className="mt-7 text-center text-sm text-white/50">
            Already have an account?{" "}

            <button
              type="button"
              onClick={handleSignIn}
              className="font-medium text-[#d9bd82] transition hover:text-white"
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