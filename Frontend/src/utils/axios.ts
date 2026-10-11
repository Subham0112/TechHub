import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_ROUTES = [
  "/users/login",
  "/users/admin-login",
  "/users/register",
  "/users/refresh",
];

const isAuthRoute = (url?: string) =>
  !!url && AUTH_ROUTES.some((route) => url.includes(route));

let isRefreshing = false;
let queue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const flushQueue = (error?: unknown) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthRoute(original.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => axios(original));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await axios.post("/users/refresh");
      flushQueue();
      return axios(original);
    } catch (refreshError) {
      flushQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axios;
