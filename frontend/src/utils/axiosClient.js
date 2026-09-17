import axios from "axios";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

// custom axios instance with cookies enabled
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// endpoints that must never trigger a refresh attempt
const AUTH_ENDPOINTS = ["/user/login", "/user/register", "/user/refresh-token", "/user/logout"];

let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axiosClient
      .post("/user/refresh-token")
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// access tokens are short lived (15 min); transparently refresh them once on a 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!config || !response || response.status !== 401) {
      return Promise.reject(error);
    }
    const url = config.url || "";
    if (config._retried || AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))) {
      return Promise.reject(error);
    }
    try {
      await refreshAccessToken();
    } catch (refreshError) {
      return Promise.reject(error);
    }
    config._retried = true;
    return axiosClient(config);
  }
);

// extracts a readable message from an axios error
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (Array.isArray(data?.details) && data.details.length) return data.details.join(", ");
  if (error?.code === "ERR_NETWORK") return "Cannot reach the server. Is the backend running?";
  if (error?.message) return error.message;
  return fallback;
};

export default axiosClient;
