export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Session {
  role: "owner" | "employee" | "customer";
  userId: string;
  name: string;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("amw_access_token");
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("amw_access_token", token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("amw_refresh_token");
}

export function setRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("amw_refresh_token", token);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("amw_access_token");
  localStorage.removeItem("amw_refresh_token");
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refresh = getRefreshToken();
    if (refresh && !path.includes("/auth/login/")) {
      try {
        const refreshResponse = await fetch(`${API_URL}/api/auth/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setAccessToken(data.access);
          headers.set("Authorization", `Bearer ${data.access}`);
          const retryResponse = await fetch(url, { ...options, headers });
          if (!retryResponse.ok) {
            const errData = await retryResponse.json().catch(() => ({}));
            throw new Error(errData.error || errData.detail || "Request failed");
          }
          return retryResponse.json();
        }
      } catch (e) {
        clearTokens();
        localStorage.removeItem("amw_session");
        window.location.href = "/";
        throw e;
      }
    }
    
    clearTokens();
    localStorage.removeItem("amw_session");
    throw new Error("Unauthorized session. Please login again.");
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || JSON.stringify(errData) || "Request failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
