import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
}) => {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      !isAuthenticated &&
      window.location.pathname !==
        "/login"
    ) {
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
    }
  }, [
    loading,
    isAuthenticated,
  ]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#c9a45c]" />

          <p className="mt-4 text-sm text-white/50">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="text-center">
          <p className="text-sm text-white/50">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  return children;
};

export default ProtectedRoute;