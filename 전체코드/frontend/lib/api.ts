const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

// Call sites can provide a response shape; legacy screens rely on inferred JSON.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    signal: options.signal || controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "요청 실패" }));
    throw new ApiError(error.error || "요청 실패", res.status);
  }

  return res.json();
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
