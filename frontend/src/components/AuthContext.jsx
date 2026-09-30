import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("bhb_token") || ""
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem("bhb_token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(savedToken);

        setUser(response.user);
        setToken(savedToken);
      } catch (error) {
        console.error("Session restore failed:", error);

        localStorage.removeItem("bhb_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);

    localStorage.setItem("bhb_token", response.token);

    setToken(response.token);
    setUser(response.user);

    return response;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);

    localStorage.setItem("bhb_token", response.token);

    setToken(response.token);
    setUser(response.user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem("bhb_token");

    setToken("");
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === "admin",

    login,
    register,
    logout,

    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;