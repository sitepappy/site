"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  
  const [link, setLink] = useState("")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    load()
  }, [])

  const load = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const m = await api("/users/me")
      setMe(m)
      setLink(m.steamTradeLink || "")
      setUsername(m.username || "")
      setAvatarUrl(m.avatarUrl || "")
    } catch (e: any) {
      if (e.message === "UNAUTHORIZED") {
        localStorage.removeItem("token")
        setMe(null)
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setError("")
    try {
      await api("/users/me", { method: "PUT", body: JSON.stringify({ username, avatarUrl }) })
      await api("/users/trade-link", { method: "PUT", body: JSON.stringify({ link }) })
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (!mounted) return null
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        <div className="text-neon font-bold animate-pulse uppercase tracking-widest">Загрузка данных...</div>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="max-w-md mx-auto glass p-8 rounded-lg text-center space-y-6">
        <div className="text-4xl">🔒</div>
        <h1 className="text-2xl font-bold uppercase">Доступ ограничен</h1>
        <p className="text-white/60">Чтобы увидеть свой профиль, необходимо войти в систему.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/login" className="btn btn-primary px-8">Войти</Link>
          <Link href="/register" className="btn glass px-8">Регистрация</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="glass p-6 rounded-lg border border-white/5">
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-tighter">Ваш Профиль</h1>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col items-center gap-4 text-center">
            {me.avatarUrl ? (
              <img src={me.avatarUrl} alt={me.username} className="w-32 h-32 rounded-full object-cover border-2 border-neon shadow-neon" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-bold text-white/20">
                {me.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-neon">{me.username}</div>
              <div className="text-xs text-white/40">{me.email}</div>
            </div>
          </div>

          <div className="space-y-3 bg-black/20 p-4 rounded border border-white/5">
            <div className="flex justify-between text-sm"><span className="text-white/40">Баланс:</span> <span className="text-acid font-mono font-bold">{me.balance} 🪙</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">Роль:</span> <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-white/5">{me.role}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/40">ID:</span> <span className="text-[10px] font-mono opacity-30">{me.id}</span></div>
            <div className="pt-2 border-t border-white/5">
              <div className="text-[10px] text-white/30 uppercase mb-1">Дата регистрации</div>
              <div className="text-xs">{new Date(me.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase">Настройки</h3>
            <input className="w-full p-2 text-sm rounded bg-white/5 border border-white/10 outline-none focus:border-neon" placeholder="Никнейм" value={username} onChange={e=>setUsername(e.target.value)} />
            <input className="w-full p-2 text-sm rounded bg-white/5 border border-white/10 outline-none focus:border-neon" placeholder="URL аватарки" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} />
            <input className="w-full p-2 text-sm rounded bg-white/5 border border-white/10 outline-none focus:border-neon" placeholder="Steam Trade Link" value={link} onChange={e=>setLink(e.target.value)} />
            <button onClick={save} className="btn btn-primary w-full py-2 text-xs uppercase font-bold">Сохранить</button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
          Ошибка: {error}
        </div>
      )}
    </div>
  )
}
