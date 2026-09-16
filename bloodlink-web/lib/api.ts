const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}) {
  const { skipAuth, ...fetchOptions } = options;

  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("jwt");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token && !skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }

  const text = await res.text();
  
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    // If Spring Boot sends a plain text string instead of JSON, return it safely without crashing!
    return text; 
  }
}