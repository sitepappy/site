// lib/api.ts

// Берем URL бекенда из переменной окружения фронта или дефолт
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pappysite-production-f8ad.up.railway.app"

export function getToken() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("token") || ""
}

export async function api(path: string, opts: RequestInit = {}) {
  const token = getToken()
  const headers: any = { "Content-Type": "application/json", ...(opts.headers || {}) }

  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers, cache: "no-store" })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Ошибка")
  }

  return res.json()
}
