import axios from "axios";

const api = axios.create({
  baseURL: "https://cmss-kvx9.onrender.com/",
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

export default api;
