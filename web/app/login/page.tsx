"use client"
import { useState } from "react"
import { api } from "../../lib/api"
import { getDeviceId } from "../../lib/device"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, deviceId: getDeviceId() })
      })
      
      if (res.token) {
        localStorage.setItem("token", res.token)
        // Используем window.location для полной перезагрузки состояния приложения
        window.location.href = "/profile"
      } else {
        throw new Error("Сервер не вернул токен")
      }
    } catch (e: any) {
      setError(e.message === "UNAUTHORIZED" ? "Неверный логин или пароль" : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="glass p-8 rounded-lg border border-white/5 shadow-neon">
        <h1 className="text-2xl font-bold mb-6 text-neon uppercase tracking-tighter">Вход в систему</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-white/40 uppercase mb-1 ml-1">Email или Логин</label>
            <input
              required
              className="w-full p-3 rounded bg-white/5 border border-white/10 focus:border-neon outline-none transition-all text-sm"
              placeholder="admin"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 uppercase mb-1 ml-1">Пароль</label>
            <input
              required
              className="w-full p-3 rounded bg-white/5 border border-white/10 focus:border-neon outline-none transition-all text-sm"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="btn btn-primary w-full py-3 mt-4 uppercase font-bold tracking-widest disabled:opacity-50"
          >
            {loading ? "Авторизация..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  )
}
