import React, { createContext, useState, useEffect, useContext } from "react";
import { API_BASE } from "./config";

const AuthContext = createContext(null);
const DEMO_TOKEN_PREFIX = "demo-token-";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (token.startsWith(DEMO_TOKEN_PREFIX)) {
      const demoUser = readStoredUser();
      setUser(demoUser);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/user/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("auth_user", JSON.stringify(data));
        setUser(data);
      } else {
        // Token invalid, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("auth_user");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("auth_user", JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refetchUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
