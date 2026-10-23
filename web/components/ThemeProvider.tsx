"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemePreference = "system" | "light" | "dark";
const STORAGE_KEY = "aegisbay-theme";
const ThemeContext = createContext<{
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}>({ theme: "system", setTheme: () => {} });

function preference(value: string | null): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setPreference] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setPreference(preference(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // System appearance still works when browser storage is unavailable.
    }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setPreference(preference(event.newValue));
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = theme === "system" ? (system.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.style.colorScheme = resolved;
    };
    apply();
    system.addEventListener("change", apply);
    return () => system.removeEventListener("change", apply);
  }, [theme, ready]);

  function setTheme(value: ThemePreference) {
    setPreference(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Keep the user's selection for this session if storage is blocked.
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function ThemeSelect() {
  const { theme, setTheme } = useContext(ThemeContext);
  const Icon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  return (
    <label className="theme-select">
      <Icon size={16} aria-hidden="true" />
      <select aria-label="Colour theme" value={theme} onChange={(event) => setTheme(preference(event.target.value))}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
