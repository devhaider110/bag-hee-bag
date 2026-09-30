import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedAdminRoute = ({
  children,
  permission = null,
}) => {
  const {
    loading,
    isAuthenticated,
    isAdmin,
    hasPermission,
  } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      window.history.replaceState(
        {},
        "",
        "/login"
      );

      window.dispatchEvent(
        new PopStateEvent(
          "popstate"
        )
      );

      return;
    }

    if (!isAdmin) {
      window.history.replaceState(
        {},
        "",
        "/"
      );

      window.dispatchEvent(
        new PopStateEvent(
          "popstate"
        )
      );

      return;
    }

    if (
      permission &&
      !hasPermission(permission)
    ) {
      window.history.replaceState(
        {},
        "",
        "/admin"
      );

      window.dispatchEvent(
        new PopStateEvent(
          "popstate"
        )
      );
    }
  }, [
    loading,
    isAuthenticated,
    isAdmin,
    permission,
    hasPermission,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/30">
            <span className="text-xs font-semibold tracking-[0.2em] text-[#e4c76b]">
              BHB
            </span>
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-neutral-500">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <p className="text-sm text-neutral-400">
          Redirecting to login...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="text-center">
          <p className="text-5xl font-semibold text-[#d4af37]">
            403
          </p>

          <h1 className="mt-4 text-2xl font-semibold text-white">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            You do not have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (
    permission &&
    !hasPermission(permission)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="max-w-md text-center">
          <p className="text-5xl font-semibold text-[#d4af37]">
            403
          </p>

          <h1 className="mt-4 text-2xl font-semibold">
            Permission Required
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Your admin account does not have
            the required permission to access
            this section.
          </p>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-700">
            BHB Security
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;