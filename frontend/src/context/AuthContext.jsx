import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext =
  createContext(null);

const TOKEN_KEY =
  "bhb_token";

const saveSession = (
  response
) => {
  const token =
    response?.token ||
    response?.accessToken;

  const user =
    response?.user;

  if (!token) {
    throw new Error(
      "Login response did not contain a valid authentication token."
    );
  }

  if (!user) {
    throw new Error(
      "Login response did not contain user information."
    );
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  return {
    token,
    user,
  };
};

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [token, setToken] =
    useState(
      () =>
        localStorage.getItem(
          TOKEN_KEY
        ) || ""
    );

  const [loading, setLoading] =
    useState(true);

  // =========================
  // RESTORE SESSION
  // =========================

  useEffect(() => {
    const loadUser =
      async () => {
        const savedToken =
          localStorage.getItem(
            TOKEN_KEY
          );

        if (
          !savedToken ||
          savedToken ===
            "undefined"
        ) {
          localStorage.removeItem(
            TOKEN_KEY
          );

          setToken("");
          setUser(null);
          setLoading(false);

          return;
        }

        try {
          const response =
            await getCurrentUser(
              savedToken
            );

          if (!response?.user) {
            throw new Error(
              "Invalid user session."
            );
          }

          setUser(
            response.user
          );

          setToken(
            savedToken
          );
        } catch (error) {
          console.error(
            "Session restore failed:",
            error
          );

          localStorage.removeItem(
            TOKEN_KEY
          );

          setToken("");
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    loadUser();
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (
    credentials
  ) => {
    const response =
      await loginUser(
        credentials
      );

    const session =
      saveSession(response);

    setToken(
      session.token
    );

    setUser(
      session.user
    );

    return {
      ...response,
      token:
        session.token,
      user:
        session.user,
    };
  };

  // =========================
  // REGISTER
  // =========================

  const register =
    async (userData) => {
      const response =
        await registerUser(
          userData
        );

      const session =
        saveSession(response);

      setToken(
        session.token
      );

      setUser(
        session.user
      );

      return {
        ...response,
        token:
          session.token,
        user:
          session.user,
      };
    };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    setToken("");
    setUser(null);
  };

  // =========================
  // SECURITY SESSION RESET
  // =========================

  const forceLogout = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    setToken("");
    setUser(null);

    if (
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
  };

  const value = {
    user,
    token,
    loading,

    isAuthenticated:
      Boolean(
        user && token
      ),

    isAdmin:
      user?.role ===
      "admin",

    permissions:
      user?.permissions ||
      [],

    hasPermission:
      (permission) => {
        if (
          user?.role !==
          "admin"
        ) {
          return false;
        }

        return (
          user?.permissions?.includes(
            permission
          ) || false
        );
      },

    login,
    register,
    logout,
    forceLogout,
    setUser,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth =
  () => {
    const context =
      useContext(
        AuthContext
      );

    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider"
      );
    }

    return context;
  };

export default AuthContext;