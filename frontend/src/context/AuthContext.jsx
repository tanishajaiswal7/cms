import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      _id: rawUser._id || rawUser.id,
      id: rawUser.id || rawUser._id,
    };
  };

  // login
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    if (res.data?.accessToken) {
  localStorage.setItem("accessToken", res.data.accessToken);
}

    const normalized = normalizeUser(res.data.user);
    setUser(normalized);
    return normalized;
  };

  // logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  // try refresh token on app load
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await api.get("/api/auth/refresh");
        if (res.data?.accessToken) {
          localStorage.setItem("accessToken", res.data.accessToken);
        }

        let refreshedUser = normalizeUser(res.data?.user);
        if (!refreshedUser) {
          const meRes = await api.get("/api/users/me");
          refreshedUser = normalizeUser(meRes.data);
        }

        setUser(refreshedUser);
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
