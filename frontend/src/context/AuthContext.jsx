import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // login
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    if (res.data?.accessToken) {
  localStorage.setItem("accessToken", res.data.accessToken);
}

    setUser(res.data.user);
    return res.data.user;
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
        localStorage.setItem("accessToken", res.data.accessToken);
      } catch (err) {
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

export const useAuth = () => useContext(AuthContext);
