// Single shared axios instance, reused by every api/*.ts file.
// Base URL comes from .env so it's easy to point at a different backend
// (local, staging, deployed) without touching code.

import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Normalizes backend error responses ({ error: string }) into a plain
// Error with a readable message, so components can just do `catch (err)`
// and show err.message without knowing about axios response shapes.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.error || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
