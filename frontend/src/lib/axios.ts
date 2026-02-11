import axios from "axios";
import type { AuthResponse } from "@/types/auth";

// ──────────────────────────────────────────────
// Axios Instance
// ──────────────────────────────────────────────
// Base URL points to your FastAPI backend.
// All API calls from the frontend go through this instance.
// ──────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 15 second timeout
});

// ──────────────────────────────────────────────
// Request Interceptor — attach auth token
// ──────────────────────────────────────────────

api.interceptors.request.use(
    (config) => {
        // Get the access token from localStorage
        const tokens = localStorage.getItem("auth_tokens");
        if (tokens) {
            const parsed = JSON.parse(tokens);
            config.headers.Authorization = `Bearer ${parsed.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ──────────────────────────────────────────────
// Response Interceptor — auto-refresh on 401
// ──────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't retry refresh or login endpoints
            if (
                originalRequest.url?.includes("/auth/refresh") ||
                originalRequest.url?.includes("/auth/login")
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue requests while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const tokens = localStorage.getItem("auth_tokens");
                if (!tokens) {
                    throw new Error("No refresh token available");
                }

                const parsed = JSON.parse(tokens);
                const response = await api.post<AuthResponse>("/api/auth/refresh", {
                    refresh_token: parsed.refresh_token,
                });

                const newTokens = response.data;

                // Save the new tokens
                localStorage.setItem(
                    "auth_tokens",
                    JSON.stringify({
                        access_token: newTokens.access_token,
                        refresh_token: newTokens.refresh_token,
                    })
                );

                // Update the Authorization header
                api.defaults.headers.common.Authorization = `Bearer ${newTokens.access_token}`;
                originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;

                processQueue(null, newTokens.access_token);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh failed — clear tokens and redirect to login
                localStorage.removeItem("auth_tokens");
                window.location.href = "/login";

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
