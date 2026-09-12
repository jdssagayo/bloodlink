const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiFetchOptions = {}) {
  const { skipAuth, ...fetchOptions } = options;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  // Handle empty responses (like DELETE requests returning 204)
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}