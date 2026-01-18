import React, { createContext, useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, username, isAuthenticated, setUser: setStoreUser, clearUser } = useAuthStore();
  const [loading] = useState(false);

  // Sync with sessionStorage for backward compatibility
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser && !user) {
      const parsedUser = JSON.parse(storedUser);
      setStoreUser(parsedUser);
    }
  }, [user, setStoreUser]);

  const login = async (loginUsername, password) => {
    try {
      const response = await window.electron.auth.login(loginUsername, password);

      if (response.success) {
        // Store in Zustand
        setStoreUser(response.data);
        // Keep sessionStorage for backward compatibility
        sessionStorage.setItem("user", JSON.stringify(response.data));
        return { success: true };
      }

      return { success: false, error: response.error };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed" };
    }
  };

  const logout = () => {
    // Clear Zustand store
    clearUser();
    // Clear sessionStorage
    sessionStorage.removeItem("user");
  };

  const value = {
    user,
    username,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
