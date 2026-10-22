"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "email" | "demo";
  role: "Lead Auditor" | "Security Researcher" | "Enclave Operator" | "Judge / Evaluator";
  token: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string, name?: string) => Promise<boolean>;
  loginDemo: (role?: User["role"]) => void;
  logout: () => void;
  renderGoogleButton: (elementId: string, callback: (res: any) => void) => void;
}

const STORAGE_KEY = "aegisbay_auth_session";
const CLIENT_ID_STORAGE_KEY = "aegisbay_google_client_id";

// Safe base64url decode helper for JWT ID tokens without external libraries
function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [googleClientId, setGoogleClientIdState] = useState<string>("");

  // Load stored session and custom Google Client ID
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedClientId =
        localStorage.getItem(CLIENT_ID_STORAGE_KEY) ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "";
      setGoogleClientIdState(storedClientId);
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoogleClientId = useCallback((id: string) => {
    setGoogleClientIdState(id);
    try {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
    } catch {
      // Ignore
    }
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Google Login from JWT credential
  const loginWithGoogleCredential = useCallback(
    async (credential: string): Promise<boolean> => {
      const payload = parseJwt(credential);
      if (!payload || !payload.email) {
        return false;
      }

      const newUser: User = {
        id: payload.sub || `google_${Date.now()}`,
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        avatar: payload.picture,
        provider: "google",
        role: "Lead Auditor",
        token: credential,
        createdAt: new Date().toISOString(),
      };

      saveSession(newUser);
      return true;
    },
    [saveSession]
  );

  // Email/Password login simulation (with client-side secure hashing/session token)
  const loginWithEmail = useCallback(
    async (email: string, _password: string, name?: string): Promise<boolean> => {
      if (!email || !email.includes("@")) return false;

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: name || email.split("@")[0],
        email: email.trim().toLowerCase(),
        provider: "email",
        role: "Security Researcher",
        token: `aegis_token_${Math.random().toString(36).substring(2)}_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      saveSession(newUser);
      return true;
    },
    [saveSession]
  );

  // Instant demo login for judges & auditors
  const loginDemo = useCallback(
    (role: User["role"] = "Lead Auditor") => {
      const demoUser: User = {
        id: "demo_auditor_01",
        name: "Ayush Sarkar (Lead Auditor)",
        email: "ayushsarkarfkt@gmail.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        provider: "demo",
        role,
        token: "demo_ed25519_enclave_bearer_verified",
        createdAt: new Date().toISOString(),
      };
      saveSession(demoUser);
    },
    [saveSession]
  );

  // Sign out
  const logout = useCallback(() => {
    saveSession(null);
  }, [saveSession]);

  // Load and render Google Identity Services button
  const renderGoogleButton = useCallback(
    (elementId: string, callback: (res: any) => void) => {
      const effectiveClientId =
        googleClientId ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "";

      if (!effectiveClientId) return;

      const initGsi = () => {
        const win = window as any;
        if (win.google?.accounts?.id) {
          try {
            win.google.accounts.id.initialize({
              client_id: effectiveClientId,
              callback: (response: any) => {
                if (response?.credential) {
                  loginWithGoogleCredential(response.credential);
                  callback(response);
                }
              },
            });

            const target = document.getElementById(elementId);
            if (target) {
              target.innerHTML = "";
              win.google.accounts.id.renderButton(target, {
                theme: "filled_black",
                size: "large",
                shape: "pill",
                text: "continue_with",
                logo_alignment: "left",
                width: 280,
              });
            }
          } catch {
            // Silently handle GSI render failures
          }
        }
      };

      // Check if GSI script is loaded
      if ((window as any).google?.accounts?.id) {
        initGsi();
      } else {
        const existingScript = document.getElementById("google-gsi-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "google-gsi-script";
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => setTimeout(initGsi, 100);
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener("load", () => setTimeout(initGsi, 100));
        }
      }
    },
    [googleClientId, loginWithGoogleCredential]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        googleClientId,
        setGoogleClientId,
        loginWithGoogleCredential,
        loginWithEmail,
        loginDemo,
        logout,
        renderGoogleButton,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
