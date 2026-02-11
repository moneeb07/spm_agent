"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import type {
    User,
    AuthResponse,
    LoginRequest,
    SignUpRequest,
    UserProfile,
} from "@/types/auth";

// ──────────────────────────────────────────────
// Auth Context Types
// ──────────────────────────────────────────────

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    login: (data: LoginRequest) => Promise<void>;
    signup: (data: SignUpRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ──────────────────────────────────────────────
// Auth Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // ── Fetch current user profile ────────────
    const refreshUser = useCallback(async () => {
        try {
            const tokens = localStorage.getItem("auth_tokens");
            if (!tokens) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await api.get<UserProfile>("/api/auth/me");
            setUser(response.data);
        } catch (err) {
            // Token invalid or expired (refresh also failed)
            setUser(null);
            localStorage.removeItem("auth_tokens");
        } finally {
            setLoading(false);
        }
    }, []);

    // ── On mount: check for existing session ──
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // ── Login ─────────────────────────────────
    const login = async (data: LoginRequest) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post<AuthResponse>("/api/auth/login", data);
            const { access_token, refresh_token, user: userData } = response.data;

            // Store tokens
            localStorage.setItem(
                "auth_tokens",
                JSON.stringify({ access_token, refresh_token })
            );

            // Fetch full profile
            await refreshUser();

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            const message =
                err.response?.data?.detail || "Login failed. Please try again.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // ── Sign Up ───────────────────────────────
    const signup = async (data: SignUpRequest) => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.post<AuthResponse>("/api/auth/signup", data);

            // If signup returns tokens (email confirmation disabled)
            if (response.data.access_token) {
                const { access_token, refresh_token } = response.data;
                localStorage.setItem(
                    "auth_tokens",
                    JSON.stringify({ access_token, refresh_token })
                );
                await refreshUser();
                router.push("/dashboard");
            } else {
                // Email confirmation required — redirect to login with message
                router.push("/login?message=Check your email to confirm your account");
            }
        } catch (err: any) {
            const message =
                err.response?.data?.detail || "Sign up failed. Please try again.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // ── Logout ────────────────────────────────
    const logout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch {
            // Even if the API call fails, clear local state
        } finally {
            localStorage.removeItem("auth_tokens");
            setUser(null);
            router.push("/login");
        }
    };

    // ── Clear error ───────────────────────────
    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                signup,
                logout,
                refreshUser,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
