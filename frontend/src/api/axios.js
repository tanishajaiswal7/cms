import axios from "axios";

const backendBaseUrl =
  typeof import.meta.env.VITE_BACKEND_URL === "string"
    ? import.meta.env.VITE_BACKEND_URL.trim()
    : "";

const api = axios.create({
  baseURL: backendBaseUrl || "/",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    
    if (token && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      // Only redirect if NOT the refresh endpoint (let AuthContext handle it)
      if (typeof window !== "undefined" && !error.config?.url?.includes("/auth/refresh")) {
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      error.message = error.response?.data?.message || "Access denied";
    }

    // Handle other errors
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
