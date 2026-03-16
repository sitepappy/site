"use client"
import { useState } from "react"
import { api } from "../../lib/api"
import { getDeviceId } from "../../lib/device"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [promo, setPromo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api("/auth/register", { 
        method: "POST", 
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          promoCode: promo || undefined, 
          deviceId: getDeviceId() 
        }) 
      })
      
      // Сохраняем токен и редиректим
      if (res.token) {
        localStorage.setItem("token", res.token)
        window.location.href = "/profile"
      } else {
        window.location.href = "/login"
      }
    } catch (e:any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto glass p-6 rounded-lg shadow-neon mt-10">
      <h1 className="text-2xl font-bold mb-6 text-neon">Создать аккаунт</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Никнейм</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-neon outline-none transition-all" 
            placeholder="Ваше имя" 
            value={username} 
            onChange={e=>setUsername(e.target.value)} 
            required
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Email</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-neon outline-none transition-all" 
            placeholder="example@mail.com" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Пароль</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-neon outline-none transition-all" 
            placeholder="••••••••" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1 uppercase font-semibold">Промокод (если есть)</label>
          <input 
            className="w-full p-3 rounded bg-white/10 border border-white/5 focus:border-acid outline-none transition-all" 
            placeholder="Введите код" 
            value={promo} 
            onChange={e=>setPromo(e.target.value)} 
          />
        </div>

        <button 
          disabled={loading}
          className={`btn btn-primary w-full py-4 text-lg font-bold uppercase tracking-wider ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Создание..." : "Зарегистрироваться"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-white/40">
        Уже есть аккаунт? <button onClick={() => router.push('/login')} className="text-neon hover:underline">Войти</button>
      </div>
    </div>
  )
}
